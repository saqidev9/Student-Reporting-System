const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

function getFilePath(fileName) {
  return path.join(DATA_DIR, `${fileName}.json`);
}

function readJSON(fileName) {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJSON(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function readSingleJSON(fileName) {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeSingleJSON(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJSON, writeJSON, readSingleJSON, writeSingleJSON };
