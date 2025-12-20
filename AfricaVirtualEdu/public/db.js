// db.js
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// 1) Make sure the /data folder exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// 2) Define where the database file will live
const dbPath = path.join(dataDir, "ave.db");

// 3) Open (or create) the SQLite database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err);
  } else {
    console.log("✅ Connected to SQLite database at:", dbPath);
  }
});

// 4) Create tables if they do NOT exist yet
db.serialize(() => {
  // MEMBERS table (for membership enrollments)
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      country TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      occupation TEXT,
      institution TEXT,
      reason TEXT,
      goals TEXT,
      communication_pref TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // CONTACT MESSAGES table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // DONATIONS table (optional, for future)
  db.run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      amount REAL,
      currency TEXT,
      method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// 5) Export the db object so server.js can use it
module.exports = db;
  // USERS table (login + access rights)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER,              -- optional: link to members table
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'member',     -- e.g. 'member', 'mentor', 'admin'
      can_finance_help INTEGER DEFAULT 0,
      can_laptop_help INTEGER DEFAULT 0,
      can_mentorship_help INTEGER DEFAULT 0,
      can_volunteer INTEGER DEFAULT 0,
      whatsapp_channel TEXT,
      telegram_channel TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(member_id) REFERENCES members(id)
    )
  `);
