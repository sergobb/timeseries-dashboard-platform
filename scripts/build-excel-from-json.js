#!/usr/bin/env node
/**
 * Сканирует все JSON в external/, находит объекты data с полями column, table, descriptions.full,
 * собирает по table и пишет Excel в external/excel/ (колонки: column, description).
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXTERNAL_DIR = path.join(__dirname);
const EXCEL_DIR = path.join(EXTERNAL_DIR, 'excel');

// table -> [{ column, description }]
const byTable = new Map();

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function extractFromData(dataObj) {
  if (!isPlainObject(dataObj)) return;
  for (const key of Object.keys(dataObj)) {
    const item = dataObj[key];
    if (!isPlainObject(item)) continue;
    const table = item.table;
    const column = item.column;
    const full = item.descriptions && item.descriptions.full;
    if (table == null || column == null || full == null) continue;
    if (!byTable.has(table)) byTable.set(table, []);
    byTable.get(table).push({ column: String(column), description: String(full) });
  }
}

function visit(obj) {
  if (Array.isArray(obj)) {
    obj.forEach((v) => visit(v));
    return;
  }
  if (!isPlainObject(obj)) return;
  if (Object.prototype.hasOwnProperty.call(obj, 'data')) {
    const data = obj.data;
    if (isPlainObject(data) && !Array.isArray(data)) extractFromData(data);
  }
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v !== null && typeof v === 'object') visit(v);
  }
}

function findJsonFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'excel') continue;
      findJsonFiles(full, list);
    } else if (e.name.endsWith('.json')) {
      list.push(full);
    }
  }
  return list;
}

const jsonFiles = findJsonFiles(EXTERNAL_DIR);
let parsed = 0;
let errors = 0;

for (const file of jsonFiles) {
  try {
    let raw = fs.readFileSync(file, 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    const json = JSON.parse(raw);
    visit(json);
    parsed++;
  } catch (err) {
    errors++;
    console.error(`Error ${file}:`, err.message);
  }
}

if (!fs.existsSync(EXCEL_DIR)) {
  fs.mkdirSync(EXCEL_DIR, { recursive: true });
}

const safeName = (table) => table.replace(/[\\/:*?"<>|]/g, '_');

for (const [table, rows] of byTable.entries()) {
  const ws = XLSX.utils.aoa_to_sheet([
    ['column', 'description'],
    ...rows.map((r) => [r.column, r.description]),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'columns');
  const outPath = path.join(EXCEL_DIR, `${safeName(table)}.xlsx`);
  XLSX.writeFile(wb, outPath);
}

console.log(`Parsed ${parsed} JSON files, ${errors} errors. Wrote ${byTable.size} Excel files to ${EXCEL_DIR}`);
