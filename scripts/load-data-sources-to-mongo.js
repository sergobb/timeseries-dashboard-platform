#!/usr/bin/env node
/**
 * Загружает data_sources из JSON файла в MongoDB.
 * Использование: node scripts/load-data-sources-to-mongo.js <файл.json>
 *
 * - connectionId берётся из database_connections (postgresql)
 * - теги: ищет по имени (без учёта регистра), при отсутствии — создаёт
 */

const fs = require('fs');
const path = require('path');

// Загрузка .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}
const { MongoClient, ObjectId } = require('mongodb');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Использование: node scripts/load-data-sources-to-mongo.js <файл.json>');
  process.exit(1);
}

const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
if (!fs.existsSync(absPath)) {
  console.error(`Файл не найден: ${absPath}`);
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('Установите MONGODB_URI в .env.local');
  process.exit(1);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getOrCreateTag(db, tagName, tagCache) {
  const key = tagName.toLowerCase().trim();
  if (tagCache.has(key)) return tagCache.get(key);

  const pattern = '^' + escapeRegex(tagName.trim()) + '$';
  const existing = await db.collection('tags').findOne({
    name: { $regex: new RegExp(pattern, 'i') },
  });
  if (existing) {
    tagCache.set(key, existing._id.toString());
    return existing._id.toString();
  }

  const doc = {
    name: tagName.trim(),
    createdAt: new Date(),
  };
  const result = await db.collection('tags').insertOne(doc);
  tagCache.set(key, result.insertedId.toString());
  return result.insertedId.toString();
}

async function main() {
  const data = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  const dataSources = data.data_sources;
  if (!Array.isArray(dataSources)) {
    console.error('Файл должен содержать массив data_sources');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  const conn = await db.collection('database_connections').findOne({ type: 'postgresql' });
  if (!conn) {
    console.error('В MongoDB не найдено соединение типа postgresql');
    await client.close();
    process.exit(1);
  }
  const connectionId = conn._id.toString();
  const createdBy = conn.createdBy || conn._id.toString();

  const tagCache = new Map();
  let inserted = 0;
  let skipped = 0;

  for (const ds of dataSources) {
    const tagNames = [...new Set((ds.tags || []).filter((t) => t && typeof t === 'string'))];
    const tagIds = [];
    for (const name of tagNames) {
      const id = await getOrCreateTag(db, name, tagCache);
      tagIds.push(id);
    }
    const uniqueTagIds = [...new Set(tagIds)];

    const doc = {
      connectionId,
      tableName: ds.tableName,
      schemaName: ds.schemaName ?? null,
      description: ds.description ?? null,
      columns: ds.columns || [],
      tagIds: uniqueTagIds.map((id) => new ObjectId(id)),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    };

    const existing = await db.collection('data_sources').findOne({
      connectionId,
      tableName: doc.tableName,
      schemaName: doc.schemaName,
    });
    if (existing) {
      skipped++;
      continue;
    }

    await db.collection('data_sources').insertOne(doc);
    inserted++;
    if (inserted % 100 === 0) process.stderr.write(`Вставлено: ${inserted}\r`);
  }

  await client.close();
  console.error(`\nГотово. Вставлено: ${inserted}, пропущено (дубли): ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
