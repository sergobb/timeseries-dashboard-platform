#!/usr/bin/env node
/**
 * Import database_connections, data_sources, data_sets from JSON file (from export-metadata.js).
 * Usage: node scripts/import-metadata.js <input-file> [--clear]
 * --clear: drop existing collections before import (default: merge/upsert by _id)
 * Requires MONGODB_URI in .env.local or env.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const COLLECTIONS = ['database_connections', 'data_sources', 'data_sets'];

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

const ID_FIELDS = {
  database_connections: ['_id'],
  data_sources: ['_id', 'databaseConnectionId'],
  data_sets: ['_id', 'dataSourceIds'],
};

function fromSerializable(doc, collName) {
  if (!doc || typeof doc !== 'object') return doc;

  const out = { ...doc };
  const idFields = ID_FIELDS[collName] || ['_id'];

  for (const field of idFields) {
    let val = out[field];
    if (val == null) continue;

    if (field === 'dataSourceIds' && Array.isArray(val)) {
      out[field] = val.map((x) => (typeof x === 'string' && ObjectId.isValid(x) ? new ObjectId(x) : x));
    } else if (typeof val === 'string' && ObjectId.isValid(val)) {
      out[field] = new ObjectId(val);
    }
  }

  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      try {
        const d = new Date(v);
        if (!isNaN(d.getTime())) out[k] = d;
      } catch (_) {}
    }
  }

  return out;
}

async function run() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local or env vars.');
  }

  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const clear = process.argv.includes('--clear');
  const inPath = args[0];

  if (!inPath) {
    console.error('Usage: node scripts/import-metadata.js <input-file> [--clear]');
    process.exit(1);
  }

  const absPath = path.isAbsolute(inPath) ? inPath : path.join(process.cwd(), inPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  const raw = fs.readFileSync(absPath, 'utf8');
  const data = JSON.parse(raw);

  if (!data.collections || typeof data.collections !== 'object') {
    throw new Error('Invalid export format: missing "collections" object');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  for (const collName of COLLECTIONS) {
    const docs = data.collections[collName];
    if (!Array.isArray(docs)) {
      console.log(`Skip ${collName}: no data`);
      continue;
    }

    const coll = db.collection(collName);

    if (clear && docs.length > 0) {
      await coll.deleteMany({});
      console.log(`Cleared ${collName}`);
    }

    const toInsert = docs.map((d) => fromSerializable(d, collName)).filter((d) => d && d._id);

    if (toInsert.length === 0) {
      console.log(`Import ${collName}: 0 documents`);
      continue;
    }

    const bulk = coll.initializeOrderedBulkOp();
    for (const doc of toInsert) {
      bulk
        .find({ _id: doc._id })
        .upsert()
        .replaceOne(doc);
    }
    await bulk.execute();

    console.log(`Imported ${toInsert.length} into ${collName}`);
  }

  await client.close();
  console.log(`Imported from ${path.resolve(absPath)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
