const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

function loadEnvLocal() {
  if (process.env.MONGODB_URI) return;
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (key === 'MONGODB_URI' && value) {
      process.env.MONGODB_URI = value;
      return;
    }
  }
}

function isBlank(value) {
  return !value || (typeof value === 'string' && value.trim() === '');
}

async function backfillSeriesLabels({ dryRun }) {
  loadEnvLocal();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local or env vars.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const dataSetCache = new Map();
  const dataSourceCache = new Map();

  const getDataSet = async (id) => {
    if (!id) return null;
    if (dataSetCache.has(id)) return dataSetCache.get(id);
    if (!ObjectId.isValid(id)) {
      dataSetCache.set(id, null);
      return null;
    }
    const ds = await db.collection('data_sets').findOne({ _id: new ObjectId(id) });
    dataSetCache.set(id, ds || null);
    return ds || null;
  };

  const getDataSource = async (id) => {
    if (!id) return null;
    if (dataSourceCache.has(id)) return dataSourceCache.get(id);
    if (!ObjectId.isValid(id)) {
      dataSourceCache.set(id, null);
      return null;
    }
    const ds = await db.collection('data_sources').findOne({ _id: new ObjectId(id) });
    dataSourceCache.set(id, ds || null);
    return ds || null;
  };

  const getYColumnLabel = async (series) => {
    const dataSet = await getDataSet(series.dataSetId);
    if (!dataSet) return null;
    const sourceIds = Array.isArray(dataSet.dataSourceIds) ? dataSet.dataSourceIds : [];
    const sources = (
      await Promise.all(sourceIds.map((sourceId) => getDataSource(sourceId)))
    ).filter(Boolean);

    let availableColumns = [];
    if (dataSet.type === 'combined') {
      availableColumns = sources.flatMap((source) => source.columns || []);
    } else {
      availableColumns = sources[0]?.columns || [];
    }

    const yColumn = availableColumns.find((col) => col.columnName === series.yColumnName);
    return yColumn?.description || yColumn?.columnName || null;
  };

  const chartsCursor = db.collection('charts').find({ series: { $exists: true, $ne: [] } });
  let scannedCharts = 0;
  let updatedCharts = 0;
  let updatedSeries = 0;
  let skippedNoLabel = 0;

  for await (const chart of chartsCursor) {
    scannedCharts += 1;
    let changed = false;
    const nextSeries = await Promise.all(
      (chart.series || []).map(async (series) => {
        const currentLabel = series?.options?.label;
        if (!isBlank(currentLabel)) {
          return series;
        }

        const label = await getYColumnLabel(series);
        if (isBlank(label)) {
          skippedNoLabel += 1;
          return series;
        }

        const nextOptions = { ...(series.options || {}), label };
        updatedSeries += 1;
        changed = true;
        return { ...series, options: nextOptions };
      })
    );

    if (changed) {
      updatedCharts += 1;
      if (!dryRun) {
        await db.collection('charts').updateOne(
          { _id: chart._id },
          { $set: { series: nextSeries, updatedAt: new Date() } }
        );
      }
    }
  }

  await client.close();

  console.log(`Scanned charts: ${scannedCharts}`);
  console.log(`Updated charts: ${updatedCharts}`);
  console.log(`Updated series: ${updatedSeries}`);
  console.log(`Skipped (no description found): ${skippedNoLabel}`);
  if (dryRun) {
    console.log('Dry run: no changes were written.');
  }
}

const dryRun = process.argv.includes('--dry-run');

backfillSeriesLabels({ dryRun }).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
