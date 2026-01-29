import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 模拟初始化环境
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('正在重置数据库...');

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
`;

db.serialize(() => {
  console.log('正在清理旧表...');
  db.run('DROP TABLE IF EXISTS accounts');
  db.run('DROP TABLE IF EXISTS account_groups');
  db.run('DROP TABLE IF EXISTS form_templates');
  db.run('DROP TABLE IF EXISTS form_folders');
  db.run('DROP TABLE IF EXISTS users');
  db.run('DROP TABLE IF EXISTS form_field_mappings');
  db.run('DROP TABLE IF EXISTS fill_logs');
  db.run('DROP TABLE IF EXISTS system_settings');
  db.run('DROP TABLE IF EXISTS backups');

  console.log('正在重新创建表结构...');
  db.exec(schema);

  console.log('正在注入测试数据...');

  // 0. 插入默认管理员
  const salt = 'autofill_salt_2026';
  const hashedPassword = crypto.pbkdf2Sync('123456', salt, 1000, 64, 'sha512').toString('hex');
  db.run('INSERT INTO users (username, password, nickname, role, phone) VALUES (?, ?, ?, ?, ?)', ['admin', hashedPassword, '超级管理员', 'admin', '13800000000']);

  // 1. 插入账号分组
  db.run('INSERT INTO account_groups (group_name, description) VALUES (?, ?)', ['美食博主', '专注于探店和美食测评'], function(err) {
    if (err) return console.error(err);
    const foodGroup = this.lastID;

    db.run('INSERT INTO account_groups (group_name, description) VALUES (?, ?)', ['数码科技', '数码产品测评和开箱'], function(err) {
      if (err) return console.error(err);
      const techGroup = this.lastID;

      // 2. 插入测试账号
      const insertAccount = db.prepare(`
        INSERT INTO accounts (
          group_id, blogger_name, account_nickname, account_type, account_id, 
          homepage_url, fans_count, cooperation_type, contact, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertAccount.run(foodGroup, '王小厨', '美食大玩家', '抖音', 'wx_123', 'https://v.douyin.com/abc', 150000, '探店置换', '13800138000', '性格豪爽，配合度高');
      insertAccount.run(foodGroup, '李爱吃', '吃遍广州', '小红书', 'xhs_456', 'https://www.xiaohongshu.com/u/1', 80000, '稿费合作', 'wx: liaichi', '图片质量极佳');
      insertAccount.run(techGroup, '张极客', '极客张', 'B站', 'bili_789', 'https://space.bilibili.com/1', 500000, '产品赠送', 'gekezhang@qq.com', '视频剪辑非常专业');
      insertAccount.finalize();

      // 3. 插入表单文件夹
      db.run('INSERT INTO form_folders (folder_name, description) VALUES (?, ?)', ['品牌招募表单', '2024年各类品牌招募活动'], function(err) {
        if (err) return console.error(err);
        const collabFolder = this.lastID;

        // 4. 插入表单模板
        db.run('INSERT INTO form_templates (folder_id, template_name, form_url, form_type) VALUES (?, ?, ?, ?)', 
          [collabFolder, '夏季饮品新品招募', 'https://wj.qq.com/s2/12345/abc/', '腾讯文档'], function(err) {
          if (err) return console.error(err);
          const summerTemplate = this.lastID;

          // 5. 插入字段映射规则
          const insertMapping = db.prepare(`
            INSERT INTO form_field_mappings (template_id, form_field_name, form_field_type, is_required, account_field_name) 
            VALUES (?, ?, ?, ?, ?)
          `);

          insertMapping.run(summerTemplate, '博主姓名', '输入框', 1, 'blogger_name');
          insertMapping.run(summerTemplate, '联系方式', '输入框', 1, 'contact');
          insertMapping.run(summerTemplate, '粉丝数', '输入框', 1, 'fans_count');
          insertMapping.run(summerTemplate, '备注', '输入框', 0, 'remark');
          insertMapping.finalize();

          console.log('测试数据填充完成！');
          db.close();
        });
      });
    });
  });
});
