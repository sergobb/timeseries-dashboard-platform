#!/usr/bin/env node
/**
 * Собирает data_sources из external/data.json и instrument JSON файлов.
 * Ищет series[].data объекты с column, table, descriptions.full
 */

const fs = require('fs');
const path = require('path');

const EXTERNAL_DIR = path.join(__dirname, '..', 'external');
const DATA_JSON = path.join(EXTERNAL_DIR, 'data.json');

const data = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8'));

// Строим маппинг: instrument_path -> { iface, sourceId, tags }
const instrumentToSource = {};
for (const [sourceId, source] of Object.entries(data)) {
  if (!source.instruments) continue;
  const iface = source.descriptions?.iface ?? sourceId;
  const tags = source.tags ?? [];
  for (const instPath of source.instruments) {
    instrumentToSource[instPath] = { iface, sourceId, tags };
  }
}

function extractDataObjects(obj, result = []) {
  if (!obj || typeof obj !== 'object') return result;
  if (Array.isArray(obj)) {
    for (const item of obj) extractDataObjects(item, result);
    return result;
  }
  if (obj.data && typeof obj.data === 'object') {
    for (const [key, val] of Object.entries(obj.data)) {
      if (val && typeof val === 'object' && 'column' in val && 'table' in val && val.descriptions?.full) {
        result.push(val);
      }
    }
  }
  for (const val of Object.values(obj)) {
    extractDataObjects(val, result);
  }
  return result;
}

const tablesMap = new Map(); // tableName -> { description, columns[] }

for (const [instPath, { iface, tags }] of Object.entries(instrumentToSource)) {
  const fullPath = path.join(EXTERNAL_DIR, instPath);
  if (!fs.existsSync(fullPath)) continue;

  let instData;
  try {
    instData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    continue;
  }

  const instrument = Object.values(instData)[0]?.instrument ?? path.basename(instPath, '.json');
  const description = `${iface} - ${instrument}`;

  const items = extractDataObjects(instData);
  for (const item of items) {
    const tableName = item.table;
    if (!tablesMap.has(tableName)) {
      tablesMap.set(tableName, {
        description,
        tags: [...tags],
        columns: [],
        columnNames: new Set(),
      });
    }
    const entry = tablesMap.get(tableName);
    if (!entry.columnNames.has(item.column)) {
      entry.columnNames.add(item.column);
      entry.columns.push({
        columnName: item.column,
        dataType: item.dataType ?? 'unknown',
        description: item.descriptions.full,
        active: true,
      });
    }
  }
}

const dataSources = Array.from(tablesMap.entries()).map(([tableName, { description, tags, columns }]) => ({
  tableName,
  schemaName: '',
  description,
  columns,
  tags: tags ?? [],
}));

const output = { data_sources: dataSources };
console.log(JSON.stringify(output, null, 2));
