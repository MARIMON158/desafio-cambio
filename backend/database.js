const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

const db = new Database("./database.db");

// cria tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    UNIQUE(user_id, symbol)
  );
`);

// cria usuário admin padrão (se não existir)
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password)
  VALUES (?, ?)
`);

insertUser.run("admin@teste.com", bcrypt.hashSync("123456", 10));

module.exports = db;