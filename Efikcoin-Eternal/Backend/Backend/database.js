const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, process.env.DATABASE_PATH || 'efikcoin.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database error:', err);
    else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        address TEXT PRIMARY KEY,
        last_active INTEGER,
        total_staked TEXT DEFAULT '0',
        ece_balance TEXT DEFAULT '0',
        bnb_balance TEXT DEFAULT '0'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        tx_hash TEXT PRIMARY KEY,
        from_address TEXT,
        to_address TEXT,
        value TEXT,
        block_number INTEGER,
        timestamp INTEGER,
        type TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS stakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_address TEXT,
        amount TEXT,
        lock_period INTEGER,
        start_time INTEGER,
        end_time INTEGER,
        claimed INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        params TEXT,
        timestamp INTEGER,
        ip TEXT
    )`);
});

module.exports = db;
