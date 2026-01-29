import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

let db = null;

export async function initDatabase() {
  if (db) return db;

  const isDev = !app.isPackaged;
  const dbDir = isDev ? 
    path.join(process.cwd(), 'data') : 
    path.join(app.getPath('userData'), 'data');

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'data.db');
  console.log('Database path:', dbPath);

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        console.log('Database connected.');
        createSchema().then(() => resolve(db)).catch(reject);
      }
    });
  });
}

async function createSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS account_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      blogger_name TEXT,
      account_nickname TEXT,
      account_type TEXT,
      account_id TEXT,
      homepage_url TEXT,
      fans_count INTEGER DEFAULT 0,
      avg_read_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      quote_single REAL DEFAULT 0,
      quote_package REAL DEFAULT 0,
      cooperation_type TEXT,
      is_swap INTEGER DEFAULT 0,
      contact TEXT,
      remark TEXT,
      status INTEGER DEFAULT 1,
      extra_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES account_groups(id)
    );

    CREATE TABLE IF NOT EXISTS form_folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS form_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_id INTEGER,
      template_name TEXT NOT NULL,
      form_url TEXT,
      form_type TEXT,
      is_default INTEGER DEFAULT 0,
      last_fill_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES form_folders(id)
    );

    CREATE TABLE IF NOT EXISTS form_field_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER,
      form_field_name TEXT,
      form_field_type TEXT,
      is_required INTEGER DEFAULT 0,
      account_field_name TEXT,
      is_auto_mapping INTEGER DEFAULT 1,
      FOREIGN KEY (template_id) REFERENCES form_templates(id)
    );

    CREATE TABLE IF NOT EXISTS fill_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      template_id INTEGER,
      fill_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      fill_result TEXT,
      fail_reason TEXT,
      submit_count INTEGER DEFAULT 0,
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      FOREIGN KEY (template_id) REFERENCES form_templates(id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      phone TEXT UNIQUE,
      avatar TEXT,
      nickname TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      backup_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      backup_path TEXT,
      backup_size TEXT,
      account_count INTEGER,
      template_count INTEGER,
      log_count INTEGER
    );
  `;

  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function getDatabase() {
  return db;
}

// 辅助方法：封装异步查询
export function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
