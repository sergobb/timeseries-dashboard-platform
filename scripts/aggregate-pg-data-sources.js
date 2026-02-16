#!/usr/bin/env node
/**
 * Собирает data_sources из Postgres (таблицы с суффиксами 1s, 10s, 1m, 10m, 5m, 1h, 3h)
 * и метаданные из external/*.json (описания, descriptions.iface для колонок)
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const EXTERNAL_DIR = path.join(__dirname, '..', 'external');
const DATA_JSON = path.join(EXTERNAL_DIR, 'data.json');
const OUTPUT_FILE = path.join(EXTERNAL_DIR, 'data-sources-pg.json');

const VALID_SUFFIXES = ['_1s', '_10s', '_1m', '_10m', '_5m', '_1h', '_3h'];
const SKIP_SUFFIXES = ['_avg', '_load', '_6h'];

const SUFFIX_TAGS = {
  _1s: '1 second',
  _10s: '10 second',
  _1m: '1 minute',
  _5m: '5 minute',
  _10m: '10 minute',
  _1h: '1 hour',
  _3h: '3 hour',
};

const DESCRIPTION_TAG_PHRASES = [
  { regex: /\blevel\s*1\b/i, tag: 'level1' },
  { regex: /\blevel\s*2\b/i, tag: 'level2' },
  { regex: /\bmagnetic\s*field\b/i, tag: 'Magnetic field' },
  { regex: /\bcount\s*rate\b/i, tag: 'Count Rate' },
  { regex: /\bparticle\s*flux\b/i, tag: 'Particle flux' },
];

function getSuffixOrder(suffix) {
  const i = VALID_SUFFIXES.indexOf(suffix);
  return i >= 0 ? i : 999;
}

const pgConfig = {
  host: 'localhost',
  port: 5432,
  database: 'smdc',
  user: 'selector',
  password: 'kVb3Cz75Y3',
  connectionTimeoutMillis: 5000,
};

function stripSuffix(tableName) {
  for (const suffix of VALID_SUFFIXES) {
    if (tableName.endsWith(suffix)) {
      return tableName.slice(0, -suffix.length);
    }
  }
  return null;
}

function hasSkipSuffix(tableName) {
  return SKIP_SUFFIXES.some((s) => tableName.endsWith(s));
}

function getSuffixTag(suffix) {
  return SUFFIX_TAGS[suffix] ?? null;
}

function getTagsFromDescription(description) {
  if (!description || typeof description !== 'string') return [];
  const tags = [];
  for (const { regex, tag } of DESCRIPTION_TAG_PHRASES) {
    if (regex.test(description)) tags.push(tag);
  }
  return tags;
}

function getFirstWordTag(description) {
  if (!description || typeof description !== 'string') return null;
  const m = description.trim().match(/^\S+/);
  return m ? m[0] : null;
}

function mergeTags(...tagArrays) {
  const set = new Set();
  for (const arr of tagArrays) {
    for (const t of arr) if (t) set.add(t);
  }
  return [...set];
}

// Строим маппинг base_table_name -> { description, tags, columns: { columnName -> description } }
function buildMetadataMap() {
  const data = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8'));

  const instrumentToSource = {};
  for (const [sourceId, source] of Object.entries(data)) {
    if (!source.instruments) continue;
    const iface = source.descriptions?.iface ?? sourceId;
    const tags = source.tags ?? [];
    for (const instPath of source.instruments) {
      instrumentToSource[instPath] = { iface, tags };
    }
  }

  function extractDataObjects(obj, result = []) {
    if (!obj || typeof obj !== 'object') return result;
    if (Array.isArray(obj)) {
      for (const item of obj) extractDataObjects(item, result);
      return result;
    }
    if (obj.data && typeof obj.data === 'object') {
      for (const [, val] of Object.entries(obj.data)) {
        if (val && typeof val === 'object' && 'column' in val && 'table' in val && val.descriptions?.iface != null) {
          result.push(val);
        }
      }
    }
    for (const v of Object.values(obj)) extractDataObjects(v, result);
    return result;
  }

  const tablesMap = new Map();

  for (const [instPath, { iface, tags }] of Object.entries(instrumentToSource)) {
    const fullPath = path.join(EXTERNAL_DIR, instPath);
    if (!fs.existsSync(fullPath)) continue;

    let instData;
    try {
      instData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch {
      continue;
    }

    const title = Object.values(instData)[0]?.title ?? path.basename(instPath, '.json');
    const description = `${iface} ${title}`;

    const items = extractDataObjects(instData);
    for (const item of items) {
      const baseTable = item.table;
      const authority = item.authority ?? '';
      const metaKey = `${authority}.${baseTable}`;
      if (!tablesMap.has(metaKey)) {
        tablesMap.set(metaKey, {
          description,
          tags: [...tags],
          authority,
          columns: new Map(),
        });
      }
      const entry = tablesMap.get(metaKey);
      entry.columns.set(item.column.trim(), item.descriptions.iface);
    }
  }

  return tablesMap;
}

async function getTablesFromPg(client) {
  const schemasRes = await client.query(`
    SELECT schema_name FROM information_schema.schemata
    WHERE schema_name NOT LIKE 'pg_%'
      AND schema_name != 'information_schema'
    ORDER BY schema_name
  `);

  const tables = [];

  for (const { schema_name } of schemasRes.rows) {
    const tablesRes = await client.query(
      `
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema = $1
        AND table_type IN ('BASE TABLE', 'VIEW')
    `,
      [schema_name]
    );

    for (const { table_schema, table_name } of tablesRes.rows) {
      if (hasSkipSuffix(table_name)) continue;
      const baseName = stripSuffix(table_name);
      if (baseName) tables.push({ schema: table_schema, tableName: table_name, baseName });
    }
  }

  return tables;
}

const COLUMNS_BATCH_SIZE = 400;

async function getAllColumns(client, tables) {
  const map = new Map();
  if (tables.length === 0) return map;

  for (let i = 0; i < tables.length; i += COLUMNS_BATCH_SIZE) {
    const batch = tables.slice(i, i + COLUMNS_BATCH_SIZE);
    const conditions = batch.map((_, j) => `(table_schema = $${2 * j + 1} AND table_name = $${2 * j + 2})`).join(' OR ');
    const params = batch.flatMap((t) => [t.schema, t.tableName]);

    const res = await client.query(
      `
      SELECT table_schema, table_name, column_name, data_type
      FROM information_schema.columns
      WHERE ${conditions}
      ORDER BY table_schema, table_name, ordinal_position
    `,
      params
    );

    for (const r of res.rows) {
      const key = `${r.table_schema}.${r.table_name}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({
        columnName: r.column_name,
        dataType: r.data_type,
      });
    }
  }
  return map;
}

async function main() {
  const metadataMap = buildMetadataMap();
  const client = new Client(pgConfig);

  try {
    await client.connect();
    const tables = await getTablesFromPg(client);

    const columnsMap = await getAllColumns(client, tables);

    const dataSources = [];
    const seen = new Set();

    for (const { schema, tableName, baseName } of tables) {
      const key = `${schema}.${tableName}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const columns = columnsMap.get(key) ?? [];
      const metaKey = `${schema}.${baseName}`;
      const meta = metadataMap.get(metaKey) ?? metadataMap.get(baseName);
      if (!meta) continue;

      const columnDescs = meta.columns;

      const columnList = columns.map((c) => ({
        columnName: c.columnName,
        dataType: c.dataType,
        description: columnDescs.get(c.columnName) ?? columnDescs.get(c.columnName.trim()) ?? c.columnName,
        active: true,
      }));

      const suffix = VALID_SUFFIXES.find((s) => tableName.endsWith(s)) ?? '';
      const suffixTag = getSuffixTag(suffix);
      const description = meta.description;
      const descTags = getTagsFromDescription(description);
      const firstWordTag = getFirstWordTag(description);
      const tags = mergeTags(meta.tags, suffixTag ? [suffixTag] : [], descTags, firstWordTag ? [firstWordTag] : []);

      dataSources.push({
        tableName,
        schemaName: meta.authority ?? schema,
        description,
        columns: columnList,
        tags,
        _baseName: baseName,
        _suffix: suffix,
      });
    }

    dataSources.sort((a, b) => {
      const schemaCmp = (a.schemaName ?? '').localeCompare(b.schemaName ?? '');
      if (schemaCmp !== 0) return schemaCmp;
      const baseCmp = (a._baseName ?? '').localeCompare(b._baseName ?? '');
      if (baseCmp !== 0) return baseCmp;
      return getSuffixOrder(a._suffix) - getSuffixOrder(b._suffix);
    });

    dataSources.forEach((ds) => {
      delete ds._baseName;
      delete ds._suffix;
    });

    const output = { data_sources: dataSources };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
    console.error(`Written ${dataSources.length} data sources to ${OUTPUT_FILE}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
