const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultDB = {
  users: [],
  incomes: [],
  expenses: [],
  habits: [],
  habitLogs: [],
  goals: [],
  investments: []
};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading DB:', err.message);
  }
  saveDB(defaultDB);
  return { ...defaultDB };
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving DB:', err.message);
    return false;
  }
}

function getNextId(collection) {
  const db = loadDB();
  if (!db[collection] || db[collection].length === 0) return 1;
  return Math.max(...db[collection].map(item => item.id || 0)) + 1;
}

module.exports = { loadDB, saveDB, getNextId };
