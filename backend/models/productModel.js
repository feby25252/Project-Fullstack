const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db/products.json');

function readProducts() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeProducts(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  readProducts,
  writeProducts
};