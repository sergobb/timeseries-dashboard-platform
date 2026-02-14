#!/usr/bin/env node
/**
 * Export database_connections, data_sources, data_sets, tags from MongoDB to JSON file.
 * Usage: node scripts/export-metadata.js [output-file]
 * Default output: metadata-export-YYYY-MM-DD-HHmmss.json
 * Requires MONGODB_URI in .env.local or env.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const COLLECTIONS = ['database_connections', 'data_sources', 'data_sets', 'tags'];

function loadEnvLocal() {
  if (process.env.MONGODB_URI) return;
  for (const name of ['.env.local', '.env']) {
    const envPath = path.join(process.cwd(), name);
    if (!fs.existsSync(envPath)) continue;
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
}

function toSerializable(val) {
  if (val == null) return val;
  if (val.constructor?.name === 'ObjectID' || val instanceof ObjectId) {
    return val.toString();
  }
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.map(toSerializable);
  if (typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = toSerializable(v);
    return out;
  }
  return val;
}

async function run() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local or env vars.');
  }

  const outPath =
    process.argv[2] ||
    path.join(process.cwd(), `metadata-export-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const result = { exportedAt: new Date().toISOString(), collections: {} };

  for (const collName of COLLECTIONS) {
    const docs = await db.collection(collName).find({}).toArray();
    result.collections[collName] = docs.map(toSerializable);
    console.log(`Exported ${result.collections[collName].length} from ${collName}`);
  }

  await client.close();

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved to ${path.resolve(outPath)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
