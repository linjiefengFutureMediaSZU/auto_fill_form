"use strict";
const electron = require("electron");
const path = require("path");
const url = require("url");
const sqlite3 = require("sqlite3");
const fs = require("fs");
const playwrightExtra = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const XLSX = require("xlsx");
const crypto = require("crypto");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const XLSX__namespace = /* @__PURE__ */ _interopNamespaceDefault(XLSX);
let db = null;
async function initDatabase() {
  if (db) return db;
  const isDev = !electron.app.isPackaged;
  const dbDir = isDev ? path.join(process.cwd(), "data") : path.join(electron.app.getPath("userData"), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, "data.db");
  console.log("Database path:", dbPath);
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Database connection error:", err);
        reject(err);
      } else {
        console.log("Database connected.");
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

    -- 全局字段映射规则表
    CREATE TABLE IF NOT EXISTS global_field_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL UNIQUE,
      account_field_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT NOT NULL,
      schedule_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function queryGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
const AccountService = {
  // 获取所有账号
  async getAllAccounts() {
    return await queryAll("SELECT * FROM accounts ORDER BY created_at DESC");
  },
  // 获取所有分组
  async getAllGroups() {
    return await queryAll("SELECT * FROM account_groups ORDER BY created_at ASC");
  },
  // 添加账号
  async addAccount(account) {
    const {
      group_id,
      blogger_name,
      account_nickname,
      account_type,
      account_id,
      homepage_url,
      fans_count,
      avg_read_count,
      like_count,
      comment_count,
      quote_single,
      quote_package,
      cooperation_type,
      is_swap,
      contact,
      remark,
      status,
      extra_json
    } = account;
    const result = await queryRun(`
      INSERT INTO accounts (
        group_id, blogger_name, account_nickname, account_type, account_id,
        homepage_url, fans_count, avg_read_count, like_count, comment_count,
        quote_single, quote_package, cooperation_type, is_swap, contact,
        remark, status, extra_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      group_id,
      blogger_name,
      account_nickname,
      account_type,
      account_id,
      homepage_url,
      fans_count,
      avg_read_count,
      like_count,
      comment_count,
      quote_single,
      quote_package,
      cooperation_type,
      is_swap ? 1 : 0,
      contact,
      remark,
      status,
      extra_json
    ]);
    return result.lastID;
  },
  // 批量添加账号
  async addAccountsBulk(accounts) {
    let count = 0;
    for (const account of accounts) {
      await this.addAccount(account);
      count++;
    }
    return count;
  },
  // 更新账号
  async updateAccount(id, account) {
    console.log("AccountService.updateAccount called with:", id, account);
    const fields = Object.keys(account).filter((k) => k !== "id" && k !== "created_at");
    if (fields.length === 0) {
      console.warn("No fields to update for account:", id);
      return;
    }
    const values = fields.map((k) => {
      if (k === "is_swap") return account.is_swap ? 1 : 0;
      return account[k];
    });
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const sql = `UPDATE accounts SET ${setClause} WHERE id = ?`;
    console.log("Executing SQL:", sql, [...values, id]);
    try {
      await queryRun(sql, [...values, id]);
      console.log("Update successful");
    } catch (error) {
      console.error("SQL Execution Error:", error);
      throw error;
    }
  },
  // 删除账号
  async deleteAccount(id) {
    await queryRun("DELETE FROM accounts WHERE id = ?", [id]);
  },
  // 添加分组
  async addGroup(group) {
    const { group_name, description } = group;
    const result = await queryRun("INSERT INTO account_groups (group_name, description) VALUES (?, ?)", [group_name, description]);
    return result.lastID;
  },
  // 更新分组
  async updateGroup(id, group) {
    const { group_name, description } = group;
    await queryRun("UPDATE account_groups SET group_name = ?, description = ? WHERE id = ?", [group_name, description, id]);
  },
  // 删除分组
  async deleteGroup(id) {
    await queryRun("UPDATE accounts SET group_id = NULL WHERE group_id = ?", [id]);
    await queryRun("DELETE FROM account_groups WHERE id = ?", [id]);
  }
};
const FormService = {
  // 获取所有文件夹
  async getAllFolders() {
    return await queryAll("SELECT * FROM form_folders ORDER BY created_at DESC");
  },
  // 获取所有模板
  async getAllTemplates() {
    return await queryAll("SELECT * FROM form_templates ORDER BY created_at DESC");
  },
  // 获取模板的所有映射规则
  async getMappingsByTemplate(templateId) {
    return await queryAll("SELECT * FROM form_field_mappings WHERE template_id = ?", [templateId]);
  },
  // 添加文件夹
  async addFolder(folder) {
    const { folder_name, description } = folder;
    const result = await queryRun("INSERT INTO form_folders (folder_name, description) VALUES (?, ?)", [folder_name, description]);
    return result.lastID;
  },
  // 更新文件夹
  async updateFolder(id, folder) {
    const { folder_name, description } = folder;
    await queryRun("UPDATE form_folders SET folder_name = ?, description = ? WHERE id = ?", [folder_name, description, id]);
  },
  // 删除文件夹
  async deleteFolder(id) {
    const templates = await queryAll("SELECT id FROM form_templates WHERE folder_id = ?", [id]);
    const templateIds = templates.map((t) => t.id);
    if (templateIds.length > 0) {
      const placeholders = templateIds.map(() => "?").join(",");
      await queryRun(`DELETE FROM form_field_mappings WHERE template_id IN (${placeholders})`, templateIds);
      await queryRun(`DELETE FROM form_templates WHERE folder_id = ?`, [id]);
    }
    await queryRun("DELETE FROM form_folders WHERE id = ?", [id]);
  },
  // 添加模板
  async addTemplate(template) {
    const { folder_id, template_name, form_url, form_type, is_default } = template;
    const result = await queryRun(`
      INSERT INTO form_templates (folder_id, template_name, form_url, form_type, is_default)
      VALUES (?, ?, ?, ?, ?)
    `, [folder_id, template_name, form_url, form_type, is_default ? 1 : 0]);
    return result.lastID;
  },
  // 更新模板
  async updateTemplate(id, template) {
    const fields = Object.keys(template).filter((k) => k !== "id" && k !== "created_at");
    const values = fields.map((k) => {
      if (k === "is_default") return template.is_default ? 1 : 0;
      return template[k];
    });
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    await queryRun(`UPDATE form_templates SET ${setClause} WHERE id = ?`, [...values, id]);
  },
  // 删除模板
  async deleteTemplate(id) {
    await queryRun("DELETE FROM form_field_mappings WHERE template_id = ?", [id]);
    await queryRun("DELETE FROM form_templates WHERE id = ?", [id]);
  },
  // 批量删除模板
  async deleteTemplates(ids) {
    if (!ids || ids.length === 0) return;
    const placeholders = ids.map(() => "?").join(",");
    await queryRun(`DELETE FROM form_field_mappings WHERE template_id IN (${placeholders})`, ids);
    await queryRun(`DELETE FROM form_templates WHERE id IN (${placeholders})`, ids);
  },
  // 添加映射规则
  async addMapping(mapping) {
    const { template_id, form_field_name, form_field_type, is_required, account_field_name, is_auto_mapping } = mapping;
    const result = await queryRun(`
      INSERT INTO form_field_mappings (template_id, form_field_name, form_field_type, is_required, account_field_name, is_auto_mapping)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [template_id, form_field_name, form_field_type, is_required ? 1 : 0, account_field_name, is_auto_mapping ? 1 : 0]);
    return result.lastID;
  },
  // 更新映射规则
  async updateMapping(id, mapping) {
    const fields = Object.keys(mapping).filter((k) => k !== "id");
    const values = fields.map((k) => {
      if (k === "is_required" || k === "is_auto_mapping") {
        return mapping[k] ? 1 : 0;
      }
      return mapping[k];
    });
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    await queryRun(`UPDATE form_field_mappings SET ${setClause} WHERE id = ?`, [...values, id]);
  },
  // 删除映射规则
  async deleteMapping(id) {
    await queryRun("DELETE FROM form_field_mappings WHERE id = ?", [id]);
  },
  // --- 全局映射规则 ---
  // 获取所有全局规则
  async getAllGlobalMappings() {
    return await queryAll("SELECT * FROM global_field_mappings ORDER BY created_at DESC");
  },
  // 添加全局规则
  async addGlobalMapping(keyword, accountFieldName) {
    try {
      const result = await queryRun("INSERT INTO global_field_mappings (keyword, account_field_name) VALUES (?, ?)", [keyword, accountFieldName]);
      return result.lastID;
    } catch (e) {
      if (e.message.includes("UNIQUE constraint failed")) {
        throw new Error(`关键词 "${keyword}" 已存在`);
      }
      throw e;
    }
  },
  // 更新全局规则
  async updateGlobalMapping(id, keyword, accountFieldName) {
    try {
      await queryRun("UPDATE global_field_mappings SET keyword = ?, account_field_name = ? WHERE id = ?", [keyword, accountFieldName, id]);
    } catch (e) {
      if (e.message.includes("UNIQUE constraint failed")) {
        throw new Error(`关键词 "${keyword}" 已存在`);
      }
      throw e;
    }
  },
  // 删除全局规则
  async deleteGlobalMapping(id) {
    await queryRun("DELETE FROM global_field_mappings WHERE id = ?", [id]);
  }
};
const DataService = {
  // 获取填写日志
  async getLogs(limit = 100) {
    return await queryAll("SELECT * FROM fill_logs ORDER BY fill_time DESC LIMIT ?", [limit]);
  },
  // 添加日志
  async addLog(log) {
    const { account_id, template_id, fill_result, fail_reason, submit_count } = log;
    const result = await queryRun(`
      INSERT INTO fill_logs (account_id, template_id, fill_result, fail_reason, submit_count)
      VALUES (?, ?, ?, ?, ?)
    `, [account_id, template_id, fill_result, fail_reason, submit_count]);
    return result.lastID;
  },
  // 清理过期日志
  async cleanExpiredLogs(days) {
    await queryRun("DELETE FROM fill_logs WHERE fill_time < datetime('now', '-' || ? || ' days')", [days]);
  },
  // 获取备份记录
  async getBackups() {
    return await queryAll("SELECT * FROM backups ORDER BY backup_time DESC");
  },
  // 添加备份记录
  async addBackup(backup) {
    const { backup_path, backup_size, account_count, template_count, log_count } = backup;
    const result = await queryRun(`
      INSERT INTO backups (backup_path, backup_size, account_count, template_count, log_count)
      VALUES (?, ?, ?, ?, ?)
    `, [backup_path, backup_size, account_count, template_count, log_count]);
    return result.lastID;
  },
  // 删除备份记录
  async deleteBackup(id) {
    await queryRun("DELETE FROM backups WHERE id = ?", [id]);
  }
};
const SettingService = {
  // 获取设置
  async getSetting(key) {
    const rows = await queryAll("SELECT value FROM system_settings WHERE key = ?", [key]);
    const row = rows[0];
    if (!row || row.value === "undefined" || row.value === null) return null;
    try {
      return JSON.parse(row.value);
    } catch (e) {
      console.error(`Failed to parse setting ${key}:`, e);
      return null;
    }
  },
  // 保存设置
  async setSetting(key, value) {
    const valueStr = JSON.stringify(value !== void 0 ? value : null);
    await queryRun("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)", [key, valueStr]);
  },
  // 获取所有设置
  async getAllSettings() {
    const rows = await queryAll("SELECT * FROM system_settings");
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = JSON.parse(row.value);
    });
    return settings;
  }
};
const MigrationService = {
  // 检查是否已经迁移过
  async isMigrated() {
    const isMigrated = await SettingService.getSetting("isMigrated");
    return !!isMigrated;
  },
  // 执行迁移
  async migrate(data) {
    const {
      accounts,
      account_groups,
      form_folders,
      form_templates,
      form_field_mappings,
      logs,
      settings
    } = data;
    if (account_groups) {
      for (const g of account_groups) {
        await AccountService.addGroup(g);
      }
    }
    if (accounts) {
      for (const a of accounts) {
        await AccountService.addAccount(a);
      }
    }
    if (form_folders) {
      for (const f of form_folders) {
        await FormService.addFolder(f);
      }
    }
    if (form_templates) {
      for (const t of form_templates) {
        await FormService.addTemplate(t);
      }
    }
    if (form_field_mappings) {
      for (const m of form_field_mappings) {
        await FormService.addMapping(m);
      }
    }
    if (logs) {
      for (const l of logs) {
        await DataService.addLog(l);
      }
    }
    if (settings) {
      for (const key of Object.keys(settings)) {
        await SettingService.setSetting(key, settings[key]);
      }
    }
    await SettingService.setSetting("isMigrated", true);
    return { success: true };
  }
};
playwrightExtra.chromium.use(stealth());
const FIELD_MATCH_DICT = {
  "blogger_name": ["博主姓名", "姓名", "Name", "Blogger", "博主", "达人"],
  "account_nickname": ["账号昵称", "昵称", "Nickname", "博主昵称", "达人昵称"],
  "account_type": ["账号类型", "平台", "Type", "达人类型", "博主类型"],
  "account_id": ["账号ID", "ID", "平台ID", "小红书ID", "抖音ID", "B站ID"],
  "homepage_url": ["主页链接", "主页", "Homepage", "Link", "URL", "链接", "个人主页"],
  "fans_count": ["粉丝量", "粉丝数", "Fans", "粉丝", "关注数"],
  "avg_read_count": ["平均阅读量", "阅读量", "Read Count", "阅读"],
  "like_count": ["平均点赞量", "点赞量", "Like Count", "点赞", "赞藏量", "点藏量"],
  "comment_count": ["平均评论量", "评论量", "Comment Count", "评论"],
  "quote_single": ["单条报价", "报价", "Quote", "Price", "图文报价", "报备图文价", "图文价", "直发价"],
  "quote_package": ["套餐报价", "Package Price", "打包价"],
  "cooperation_type": ["合作形式", "Cooperation Type", "合作类型"],
  "contact": ["联系方式", "联系人", "Contact", "Phone", "Mobile", "WeChat", "Email", "电话", "手机", "微信", "邮箱"],
  "total_like_collect": ["总赞藏数", "Total Likes", "赞藏总数", "获赞与收藏"],
  "avg_interaction_count": ["平均互动量", "Interaction", "互动量", "互动"],
  "content_tags": ["内容标签", "Tags", "标签", "擅长领域", "垂类"],
  "note_price_video": ["视频报价", "Video Price", "视频价", "报备视频价"],
  "shipping_address": ["收货地址", "地址", "Address", "寄送地址", "收件地址"],
  "id_card": ["身份证号", "身份证", "ID Card", "证件号"],
  "bank_card": ["银行卡号", "银行卡", "Bank Card", "卡号"],
  "alipay_name": ["支付宝姓名", "Alipay Name", "支付宝"],
  "city": ["所在城市", "城市", "City", "Location", "居住地", "常驻地"],
  "promotion_type": ["推广形式", "Promotion Type", "推广类型"]
};
const AutoFillService = {
  // 运行中的浏览器实例 (key: taskId or 'global')
  activeBrowsers: /* @__PURE__ */ new Map(),
  /**
   * 获取或创建浏览器实例
   * @param {string} id 实例标识
   * @param {boolean} headless 是否无头
   * @returns {Promise<import('playwright').Browser>}
   */
  async getOrCreateBrowser(id = "global", headless = false) {
    if (this.activeBrowsers.has(id)) {
      const browser2 = this.activeBrowsers.get(id);
      if (browser2.isConnected()) return browser2;
      this.activeBrowsers.delete(id);
    }
    const browser = await playwrightExtra.chromium.launch({ headless });
    this.activeBrowsers.set(id, browser);
    browser.on("disconnected", () => {
      if (this.activeBrowsers.get(id) === browser) {
        this.activeBrowsers.delete(id);
      }
    });
    return browser;
  },
  /**
   * 关闭浏览器实例
   */
  async closeBrowser(id = "global") {
    if (this.activeBrowsers.has(id)) {
      const browser = this.activeBrowsers.get(id);
      await browser.close().catch(() => {
      });
      this.activeBrowsers.delete(id);
    }
  },
  /**
   * 开始填表任务
   * @param {Object} options 
   * @param {number[]} options.accountIds 账号 ID 列表
   * @param {number} options.templateId 模板 ID
   * @param {Array} options.fieldDefinitions 字段定义（可选）
   * @param {Object} options.settings 填表设置
   * @param {Function} onProgress 进度回调
   */
  async startTask(options, onProgress) {
    const { accountIds, templateId, fieldDefinitions, settings } = options;
    const { showBrowser = true, submitInterval = 2, autoSubmit = false } = settings;
    const template = (await FormService.getAllTemplates()).find((t) => t.id === templateId);
    if (!template) throw new Error("模板不存在");
    const globalRules = await FormService.getAllGlobalMappings();
    let mappings = await FormService.getMappingsByTemplate(templateId);
    const accounts = (await AccountService.getAllAccounts()).filter((a) => accountIds.includes(a.id));
    const browser = await this.getOrCreateBrowser("task_runner", !showBrowser);
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    let successCount = 0;
    let failCount = 0;
    try {
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        onProgress({
          type: "start",
          accountName: account.account_nickname,
          index: i,
          total: accounts.length
        });
        try {
          await context.clearCookies();
          await page.evaluate(() => {
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch (e) {
            }
          });
          const sessionsDir = path.join(electron.app.getPath("userData"), "sessions");
          if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
          const sessionPath = path.join(sessionsDir, `session_${account.id}.json`);
          if (fs.existsSync(sessionPath)) {
            try {
              const storageState = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
              await context.addCookies(storageState.cookies || []);
            } catch (e) {
              console.warn("Failed to load session:", e);
            }
          }
          await this.fillPage(page, account, template, mappings, {
            fieldDefinitions,
            globalRules,
            autoSubmit
          }, async (newMappings) => {
            mappings = newMappings;
          });
          try {
            const storageState = await context.storageState();
            fs.writeFileSync(sessionPath, JSON.stringify(storageState));
          } catch (e) {
          }
          successCount++;
          await DataService.addLog({
            account_id: account.id,
            template_id: templateId,
            fill_result: "成功",
            submit_count: 1
          });
        } catch (error) {
          failCount++;
          console.error(`Fill failed for account ${account.account_nickname}:`, error);
          onProgress({
            type: "error",
            message: error.message,
            accountId: account.id
          });
          await DataService.addLog({
            account_id: account.id,
            template_id: templateId,
            fill_result: "失败",
            fail_reason: error.message,
            submit_count: 1
          });
        }
        onProgress({
          type: "progress",
          percentage: Math.round((i + 1) / accounts.length * 100),
          successCount,
          failCount
        });
        if (i < accounts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, submitInterval * 1e3));
        }
      }
    } finally {
      await context.close().catch(() => {
      });
      if (!showBrowser) {
        await this.closeBrowser("task_runner");
      }
    }
    return { successCount, failCount };
  },
  /**
   * 在指定页面执行填表逻辑 (无浏览器启动逻辑)
   */
  async fillPage(page, account, template, mappings, options, updateMappingsCallback) {
    const { fieldDefinitions, globalRules, autoSubmit } = options;
    await page.goto(template.form_url, { waitUntil: "domcontentloaded" });
    if (!mappings || mappings.length === 0) {
      try {
        const scannedFields = await this.scanPage(page);
        const normalize = (s) => {
          if (!s) return "";
          return s.toLowerCase().normalize("NFKC").replace(/[\\s\\-_.:：、，]/g, "");
        };
        const findMatch = (formFieldName) => {
          const formLabel = normalize(formFieldName);
          if (formLabel.length <= 1) return "";
          if (globalRules && Array.isArray(globalRules)) {
            for (const rule of globalRules) {
              const k = normalize(rule.keyword);
              if (!k) continue;
              if (formLabel.includes(k)) return rule.account_field_name;
            }
          }
          for (const [accField, keywords] of Object.entries(FIELD_MATCH_DICT)) {
            if (keywords.some((k) => {
              const nk = normalize(k);
              return nk && formLabel.includes(nk);
            })) return accField;
          }
          if (fieldDefinitions && Array.isArray(fieldDefinitions)) {
            const potentialMatches = fieldDefinitions.filter((field) => {
              const fieldLabel = normalize(field.label || "");
              if (fieldLabel.length <= 1) return false;
              if (formLabel.includes(fieldLabel)) return true;
              if (fieldLabel.includes(formLabel)) return true;
              return false;
            });
            if (potentialMatches.length > 0) {
              potentialMatches.sort((a, b) => (a.label || "").length > (b.label || "").length ? -1 : 1);
              return potentialMatches[0].name;
            }
          }
          return "";
        };
        for (const field of scannedFields) {
          const matchedAccountField = findMatch(field.form_field_name);
          await FormService.addMapping({
            template_id: template.id,
            form_field_name: field.form_field_name,
            form_field_type: field.form_field_type,
            is_required: field.is_required,
            account_field_name: matchedAccountField,
            is_auto_mapping: !!matchedAccountField
          });
        }
        mappings = await FormService.getMappingsByTemplate(template.id);
        if (updateMappingsCallback) await updateMappingsCallback(mappings);
      } catch (e) {
        console.error("Lazy Scan failed:", e);
      }
    }
    for (const mapping of mappings) {
      let value = account[mapping.account_field_name];
      if ((value === void 0 || value === null) && account.extra_json) {
        try {
          const extra = typeof account.extra_json === "string" ? JSON.parse(account.extra_json) : account.extra_json;
          value = extra[mapping.account_field_name];
        } catch (e) {
        }
      }
      if (value === void 0 || value === null) continue;
      try {
        await this.smartFill(page, mapping, value);
      } catch (e) {
        if (mapping.is_required) throw e;
      }
    }
    if (autoSubmit) {
      const submitSelector = 'button[type="submit"], input[type="submit"], .submit-btn, .btn-submit, button:has-text("提交"), button:has-text("Submit"), div[role="button"]:has-text("提交")';
      try {
        const submitBtn = await page.waitForSelector(submitSelector, { timeout: 3e3 });
        if (submitBtn) {
          await submitBtn.click();
          await page.waitForTimeout(2e3);
        }
      } catch (e) {
        console.log("Auto submit failed or not found");
      }
    }
  },
  // 兼容旧接口 fillSingle (重定向到 fillPage)
  async fillSingle(account, template, mappings, options, logCallback, updateMappingsCallback) {
    const browser = await this.getOrCreateBrowser("single_runner", !options.showBrowser);
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      const sessionsDir = path.join(electron.app.getPath("userData"), "sessions");
      const sessionPath = path.join(sessionsDir, `session_${account.id}.json`);
      if (fs.existsSync(sessionPath)) {
        try {
          const storageState = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
          await context.addCookies(storageState.cookies || []);
        } catch (e) {
        }
      }
      await this.fillPage(page, account, template, mappings, options, updateMappingsCallback);
      try {
        const storageState = await context.storageState();
        if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
        fs.writeFileSync(sessionPath, JSON.stringify(storageState));
      } catch (e) {
      }
      return browser;
    } catch (e) {
      throw e;
    }
  },
  /**
   * 智能填充逻辑
   */
  async smartFill(page, mapping, value) {
    const { form_field_name, form_field_type } = mapping;
    const selectors = [
      `text="${form_field_name}"`,
      `label:has-text("${form_field_name}")`,
      `[placeholder*="${form_field_name}"]`,
      `[name*="${form_field_name}"]`,
      `[id*="${form_field_name}"]`
    ];
    let elementFound = false;
    if (form_field_type === "输入框" || !form_field_type) {
      for (const selector of selectors) {
        try {
          const target = page.locator(`${selector} >> xpath=..//input | ${selector} >> xpath=..//textarea | ${selector}`);
          if (await target.count() > 0) {
            await target.first().fill(String(value));
            elementFound = true;
            break;
          }
        } catch (e) {
        }
      }
    } else if (form_field_type === "下拉框") {
      for (const selector of selectors) {
        try {
          const target = page.locator(`${selector} >> xpath=..//select | ${selector}`);
          if (await target.count() > 0) {
            await target.first().selectOption({ label: String(value) });
            elementFound = true;
            break;
          }
          const divTarget = page.locator(`${selector} >> xpath=..//div[contains(@class, "select")] | ${selector}`);
          if (await divTarget.count() > 0) {
            await divTarget.first().click();
            await page.click(`text="${value}"`);
            elementFound = true;
            break;
          }
        } catch (e) {
        }
      }
    } else if (form_field_type === "单选框") {
      let radioFound = false;
      try {
        const label = page.locator(`label:has-text("${value}")`).first();
        if (await label.count() > 0) {
          await label.click();
          radioFound = true;
        }
      } catch (e) {
      }
      if (!radioFound) {
        try {
          const container = page.locator(`:text("${form_field_name}") >> xpath=..`);
          const option = container.locator(`:text("${value}")`).first();
          if (await option.count() > 0) {
            await option.click();
            radioFound = true;
          }
        } catch (e) {
        }
      }
      if (radioFound) elementFound = true;
    } else if (form_field_type === "复选框") {
      const values = String(value).split(/[,，;；]/).map((v) => v.trim());
      let checkboxFound = false;
      for (const val of values) {
        try {
          const label = page.locator(`label:has-text("${val}")`).first();
          if (await label.count() > 0) {
            const input = label.locator('input[type="checkbox"]');
            if (await input.count() > 0) {
              if (!await input.isChecked()) await label.click();
            } else {
              await label.click();
            }
            checkboxFound = true;
            continue;
          }
          const container = page.locator(`:text("${form_field_name}") >> xpath=..`);
          const option = container.locator(`:text("${val}")`).first();
          if (await option.count() > 0) {
            await option.click();
            checkboxFound = true;
          }
        } catch (e) {
          console.warn(`无法勾选复选框选项: ${val}`, e);
        }
      }
      if (checkboxFound) elementFound = true;
    } else if (form_field_type === "文件上传") {
      const filePath = String(value);
      if (fs.existsSync(filePath)) {
        for (const selector of selectors) {
          try {
            const input = page.locator(`${selector} >> xpath=..//input[type="file"] | ${selector}`);
            if (await input.count() > 0) {
              await input.first().setInputFiles(filePath);
              elementFound = true;
              break;
            }
          } catch (e) {
          }
        }
      } else {
        console.warn(`文件不存在: ${filePath}`);
        throw new Error(`文件不存在: ${filePath}`);
      }
    }
    if (!elementFound) {
      throw new Error(`无法定位字段: ${form_field_name}`);
    }
  },
  /**
   * 拾取网页元素选择器
   * @param {string} url 网页地址
   * @returns {Promise<string>} 选择器
   */
  async pickSelector(url2) {
    const browser = await playwrightExtra.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url2, { waitUntil: "networkidle" });
      const selector = await page.evaluate(() => {
        return new Promise((resolve) => {
          const style = document.createElement("style");
          style.innerHTML = `
            .autofill-picker-hover { outline: 2px solid #409eff !important; cursor: crosshair !important; }
          `;
          document.head.appendChild(style);
          const onMouseOver = (e) => e.target.classList.add("autofill-picker-hover");
          const onMouseOut = (e) => e.target.classList.remove("autofill-picker-hover");
          const onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const el = e.target;
            let selector2 = "";
            if (el.id) selector2 = `#${el.id}`;
            else if (el.name) selector2 = `[name="${el.name}"]`;
            else if (el.placeholder) selector2 = `[placeholder="${el.placeholder}"]`;
            else {
              selector2 = el.tagName.toLowerCase();
              if (el.className) selector2 += `.${el.className.split(" ").join(".")}`;
            }
            cleanup();
            resolve(selector2);
          };
          const cleanup = () => {
            document.removeEventListener("mouseover", onMouseOver);
            document.removeEventListener("mouseout", onMouseOut);
            document.removeEventListener("click", onClick, true);
            document.head.removeChild(style);
          };
          document.addEventListener("mouseover", onMouseOver);
          document.addEventListener("mouseout", onMouseOut);
          document.addEventListener("click", onClick, true);
        });
      });
      return selector;
    } finally {
      await browser.close();
    }
  },
  /**
   * 扫描表单页面逻辑 (重构为独立方法)
   * @param {import('playwright').Page} page Playwright page object
   * @returns {Promise<Array<{name: string, type: string}>>} 字段列表
   */
  async scanPage(page) {
    try {
      const frames = page.frames();
      console.log(`Scanning page, found ${frames.length} frames`);
      let allFields = [];
      const seenGlobalNames = /* @__PURE__ */ new Set();
      for (const frame of frames) {
        try {
          const fields = await frame.evaluate(() => {
            const results = [];
            const inferType = (el) => {
              const tag = el.tagName.toLowerCase();
              const type = el.type ? el.type.toLowerCase() : "";
              if (tag === "select") return "下拉框";
              if (tag === "textarea") return "输入框";
              if (tag === "input") {
                if (["radio"].includes(type)) return "单选框";
                if (["checkbox"].includes(type)) return "复选框";
                if (["file"].includes(type)) return "文件上传";
                if (["button", "submit", "reset", "image", "hidden"].includes(type)) return null;
                return "输入框";
              }
              return null;
            };
            const getLabel = (el) => {
              let labelText = "";
              const mikeItem = el.closest(".f-item");
              if (mikeItem) {
                const mikeLabel = mikeItem.querySelector(".f-label");
                if (mikeLabel) return mikeLabel.innerText;
                const mikeReactSpan = mikeItem.querySelector('span[data-reactid*="$bodyMain"]');
                if (mikeReactSpan) return mikeReactSpan.innerText;
                const mikeTitle = mikeItem.querySelector(".title");
                if (mikeTitle) return mikeTitle.innerText;
              }
              if (el.id) {
                const label = document.querySelector(`label[for="${el.id}"]`);
                if (label) labelText = label.innerText;
              }
              if (!labelText && el.getAttribute("aria-label")) {
                labelText = el.getAttribute("aria-label");
              }
              if (!labelText && el.placeholder) {
                labelText = el.placeholder;
              }
              if (!labelText) {
                const parentLabel = el.closest("label");
                if (parentLabel) labelText = parentLabel.innerText;
              }
              if (!labelText) {
                const container = el.closest('.f-item, .form-group, .field-container, .question-item, div[class*="item"], div[class*="field"], div[class*="block"], .ksapc-question-item, .question-container, .ant-form-item, .obj_item, .pd-list-item');
                if (container) {
                  const wpsTitle = container.querySelector(".ksapc-question-title-title");
                  if (wpsTitle) {
                    labelText = wpsTitle.innerText;
                  } else if (container.querySelector(".topichtml")) {
                    labelText = container.querySelector(".topichtml").innerText;
                  } else if (container.querySelector(".field-label")) {
                    labelText = container.querySelector(".field-label").innerText;
                  } else if (container.querySelector(".form-auto-ellipsis")) {
                    labelText = container.querySelector(".form-auto-ellipsis").innerText;
                  } else if (container.querySelector(".question-title")) {
                    labelText = container.querySelector(".question-title").innerText;
                  } else {
                    const reactLabel = container.querySelector('span[data-reactid*="$bodyMain"]');
                    const fLabel = container.querySelector(".f-label");
                    const fItemLabel = container.querySelector(".f-item-label");
                    if (reactLabel) {
                      labelText = reactLabel.innerText;
                    } else if (fLabel) {
                      labelText = fLabel.innerText;
                    } else if (fItemLabel) {
                      labelText = fItemLabel.innerText;
                    } else {
                      const title = container.querySelector('label, .title, .question-title, h3, h4, span[class*="label"], div[class*="title"], .label-text');
                      if (title) labelText = title.innerText;
                    }
                  }
                }
              }
              if (!labelText) {
                const parentDiv = el.closest("div");
                if (parentDiv) {
                  const prevDiv = parentDiv.previousElementSibling;
                  if (prevDiv) {
                    if (prevDiv.querySelector(".ksapc-question-title-title")) {
                      labelText = prevDiv.querySelector(".ksapc-question-title-title").innerText;
                    } else if (prevDiv.querySelector(".topichtml")) {
                      labelText = prevDiv.querySelector(".topichtml").innerText;
                    } else if (prevDiv.querySelector(".f-label")) {
                      labelText = prevDiv.querySelector(".f-label").innerText;
                    } else if (prevDiv.querySelector(".f-item-label")) {
                      labelText = prevDiv.querySelector(".f-item-label").innerText;
                    } else if (prevDiv.innerText && prevDiv.innerText.length < 100) {
                      const text = prevDiv.innerText.trim();
                      if (text) labelText = text;
                    }
                  }
                }
              }
              if (!labelText) {
                const prev = el.previousElementSibling;
                if (prev && ["LABEL", "SPAN", "DIV", "P"].includes(prev.tagName)) {
                  labelText = prev.innerText;
                }
              }
              return labelText ? labelText.trim().replace(/[*:]/g, "") : "";
            };
            const inputs = document.querySelectorAll('input, textarea, select, [role="textbox"], [contenteditable="true"]');
            inputs.forEach((input) => {
              if (input.type === "hidden" || input.style.display === "none" || input.disabled) return;
              const type = inferType(input);
              if (!type && !input.getAttribute("contenteditable")) return;
              const label = getLabel(input);
              if (!label && !input.name) return;
              const fieldName = label || input.name || "未命名字段";
              results.push({
                form_field_name: fieldName,
                form_field_type: type || "输入框",
                is_required: input.required || input.getAttribute("aria-required") === "true" || label && label.includes("*"),
                selector: ""
              });
            });
            return results;
          });
          if (fields && fields.length > 0) {
            console.log(`Frame found ${fields.length} fields`);
            fields.forEach((f) => {
              const key = `${f.form_field_name}-${f.form_field_type}`;
              if (!seenGlobalNames.has(key)) {
                seenGlobalNames.add(key);
                allFields.push(f);
              }
            });
          }
        } catch (e) {
          console.warn("Error scanning frame:", e);
        }
      }
      console.log(`Total fields found: ${allFields.length}`);
      return allFields;
    } catch (e) {
      console.error("Scan page failed:", e);
      throw e;
    }
  },
  /**
   * 扫描表单页面，提取可能的字段
   * @param {string} url 网页地址
   * @returns {Promise<Array<{name: string, type: string}>>} 字段列表
   */
  async scanForm(url2) {
    const browser = await playwrightExtra.chromium.launch({ headless: false });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    try {
      console.log("Scanning URL:", url2);
      try {
        await page.goto(url2, { waitUntil: "domcontentloaded", timeout: 6e4 });
        await page.waitForLoadState("networkidle", { timeout: 3e4 }).catch(() => console.log("Network idle timeout, proceeding..."));
      } catch (e) {
        console.warn("Page load timeout or error:", e);
      }
      await page.waitForTimeout(3e3);
      return await this.scanPage(page);
    } catch (e) {
      console.error("Scan failed:", e);
      throw e;
    } finally {
      await browser.close();
    }
  }
};
const ExcelService = {
  /**
   * 解析账号 Excel 文件
   * @param {string} filePath 文件路径
   * @returns {Array} 解析后的账号列表
   */
  parseAccountExcel(filePath) {
    const workbook = XLSX__namespace.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX__namespace.utils.sheet_to_json(worksheet);
    return data.map((row) => {
      const extra = {
        authorization: row["授权"] || "",
        info_stream: row["信息流"] || "",
        agency: row["机构"] || row["所属MCN机构"] || "",
        interaction: row["互动"] || "",
        phone: row["电话"] || row["联系手机号"] || "",
        pugongying_url: row["蒲公英链接"] || "",
        wechat: row["微信"] || row["联系微信号"] || "",
        // 新增字段
        total_like_collect: parseNumber(row["总赞藏数"] || row["总赞藏数(填写具体数字)"]),
        avg_interaction_count: parseNumber(row["图文平均互动量"] || row["平均互动量"] || row["平时平均互动数"]),
        max_interaction_count: parseNumber(row["最高互动量"]),
        // Excel可能无此字段
        fans_gender_ratio: row["粉丝男女比例"] || "",
        // Excel可能无此字段
        fans_age_distribution: row["粉丝年龄分布"] || row["粉丝年龄画像"] || row["粉丝年龄画像/粉丝画像年龄范围"] || "",
        fans_region_distribution: row["粉丝地域分布"] || "",
        // Excel可能无此字段
        content_tags: row["内容标签"] || row["账号类目"] || row["账号类型/领域"] || "",
        cooperation_experience: row["合作品牌"] || row["过往合作案例"] || "",
        // Excel可能无此字段
        note_price_video: parseNumber(row["视频笔记报价"] || row["报备视频报价"] || row["报备视频价格(裸价)"]),
        live_price: parseNumber(row["直播报价"]),
        // Excel可能无此字段
        shipping_address: row["收货地址"] || row["寄样地址"] || row["收件地址+邮编"] || "",
        id_card: row["身份证号"] || "",
        // Excel可能无此字段
        bank_card: row["银行卡号"] || "",
        // Excel可能无此字段
        open_bank: row["开户行"] || "",
        // Excel可能无此字段
        alipay_name: row["支付宝姓名"] || "",
        // Excel可能无此字段
        city: row["所在城市"] || row["达人所在城市"] || "",
        estimated_play_count: parseNumber(row["预估播放量"]),
        estimated_interaction_count: parseNumber(row["预估互动量"]),
        blogger_level: row["达人级别"] || row["达人级别(kol/koc/素人)"] || "",
        private_price: parseNumber(row["水下价格"] || row["水下报备价格"] || row["水下报备价格(KOC/KOL)"]),
        promotion_type: row["推广形式"] || row["推广形式(单品/合集/CP搭配)"] || "",
        earliest_schedule: row["最早档期"] || row["最快可执行档期"] || row["最快可执行档期/具体发布时间"] || "",
        price_protection: parseBoolean(row["是否保价"] || row["是否可保价"] || row["是否可保价至指定月份执行"]),
        auth_free_6m: parseBoolean(row["免费授权6个月"] || row["是否免费授权品牌全渠道使用素材6个月"]),
        auth_free_1y: parseBoolean(row["免费授权1年"] || row["是否免费授权品牌全渠道使用素材1年(含肖像权)"]),
        content_retention: parseBoolean(row["内容保留"] || row["内容是否保留指定时长(12个月/1年)"]),
        accept_second_edit: parseBoolean(row["接受二剪"] || row["是否接受素材二次剪辑"]),
        accept_competitor_exclusion: parseBoolean(row["接受排竞"] || row["是否接受排竞(前后指定天数)"]),
        can_buy_product: parseBoolean(row["自费购买"] || row["是否可自费购买推广产品"]),
        free_component: parseBoolean(row["免费组件"] || row["是否可免费带组件"]),
        product_return: parseBoolean(row["产品回收"] || row["是否接受产品寄拍且回收"]),
        provide_raw_face: parseBoolean(row["提供素颜"] || row["是否可提供脸部素颜图/对比图"]),
        accept_face_show: parseBoolean(row["接受露脸"] || row["是否接受露脸拍摄"]),
        receiver_name: row["收件人"] || row["收件人姓名"] || ""
      };
      const parseNumber = (val) => {
        if (!val) return 0;
        const num = parseFloat(String(val).replace(/[^\d.]/g, ""));
        return isNaN(num) ? 0 : num;
      };
      const parseBoolean = (val) => {
        if (!val) return 0;
        return String(val).includes("是") || String(val).toLowerCase() === "yes" || String(val) === "1" ? 1 : 0;
      };
      return {
        blogger_name: row["博主姓名"] || row["博主昵称"] || "",
        account_nickname: row["账号昵称"] || row["博主昵称"] || "",
        account_type: row["账号类型"] || "",
        account_id: row["平台ID"] || row["账号ID"] || "",
        homepage_url: row["主页链接"] || row["账号链接"] || "",
        fans_count: parseNumber(row["粉丝数"] || row["粉丝数量"]),
        like_count: parseNumber(row["赞藏数量"]),
        quote_single: parseNumber(row["报备图文报价"]),
        quote_package: parseNumber(row["报备视频报价"]),
        cooperation_type: row["合作类型"] || "",
        contact: row["联系方式"] || row["微信"] || row["电话"] || "",
        remark: row["备注"] || "",
        status: 1,
        // 默认正常
        is_swap: parseBoolean(row["是否接受置换"] || row["是否需要试用"]),
        extra_json: JSON.stringify(extra)
      };
    });
  },
  /**
   * 导出账号到 Excel
   * @param {Array} accounts 账号列表
   * @param {string} savePath 保存路径
   * @param {Array} fields 导出字段配置 [{label: '列名', name: '字段名'}]
   */
  exportAccountsToExcel(accounts, savePath, fields) {
    const exportData = accounts.map((a) => {
      let extra = {};
      try {
        extra = a.extra_json ? JSON.parse(a.extra_json) : {};
      } catch (e) {
        console.error("Failed to parse extra_json", e);
      }
      const flatAccount = {
        ...a,
        ...extra,
        // 特殊处理字段
        // 如果是布尔值，转换为是/否；如果是字符串（已经转换过），则保留
        is_swap: typeof a.is_swap === "boolean" ? a.is_swap ? "是" : "否" : a.is_swap
        // 注意：Account.vue 传递过来的已经是格式化过的 formattedAccounts，
        // 其中 is_swap 已经是 '是'/'否'，status 已经是中文。
        // 所以我们主要需要根据 fields 来提取数据。
      };
      const row = {};
      fields.forEach((field) => {
        let value = flatAccount[field.name];
        if (value === void 0 && extra[field.name] !== void 0) {
          value = extra[field.name];
        }
        row[field.label] = value || "";
      });
      return row;
    });
    const worksheet = XLSX__namespace.utils.json_to_sheet(exportData);
    const workbook = XLSX__namespace.utils.book_new();
    XLSX__namespace.utils.book_append_sheet(workbook, worksheet, "账号列表");
    XLSX__namespace.writeFile(workbook, savePath);
  }
};
const UserService = {
  /**
   * 密码加密
   */
  hashPassword(password) {
    const salt = "autofill_salt_2026";
    return crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  },
  /**
   * 用户登录 (支持用户名或手机号)
   */
  async login(account, password) {
    const hashedPassword = this.hashPassword(password);
    const users = await queryAll(
      "SELECT id, username, email, phone, avatar, nickname, role, created_at FROM users WHERE (username = ? OR phone = ?) AND password = ?",
      [account, account, hashedPassword]
    );
    if (users.length > 0) {
      return { success: true, user: users[0] };
    } else {
      return { success: false, message: "账号或密码错误" };
    }
  },
  /**
   * 获取用户信息
   */
  async getUser(userId) {
    try {
      const users = await queryAll(
        "SELECT id, username, email, phone, avatar, nickname, role, created_at FROM users WHERE id = ?",
        [userId]
      );
      if (users.length > 0) {
        return { success: true, user: users[0] };
      } else {
        return { success: false, message: "用户不存在" };
      }
    } catch (error) {
      return { success: false, message: "获取用户信息失败: " + error.message };
    }
  },
  /**
   * 用户注册
   */
  async register(userData) {
    const { username, password, nickname, email, phone } = userData;
    const existingUser = await queryAll("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return { success: false, message: "用户名已存在" };
    }
    if (phone) {
      const existingPhone = await queryAll("SELECT id FROM users WHERE phone = ?", [phone]);
      if (existingPhone.length > 0) {
        return { success: false, message: "手机号已被注册" };
      }
    }
    const hashedPassword = this.hashPassword(password);
    try {
      const result = await queryRun(
        "INSERT INTO users (username, password, nickname, email, phone) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, nickname || username, email || null, phone || null]
      );
      return { success: true, userId: result.lastID };
    } catch (error) {
      return { success: false, message: "注册失败: " + error.message };
    }
  },
  /**
   * 更新用户资料
   */
  async updateProfile(userId, data) {
    const { nickname, email, phone, avatar } = data;
    const fields = [];
    const params = [];
    if (nickname !== void 0) {
      fields.push("nickname = ?");
      params.push(nickname);
    }
    if (email !== void 0) {
      fields.push("email = ?");
      params.push(email);
    }
    if (phone !== void 0) {
      fields.push("phone = ?");
      params.push(phone);
    }
    if (avatar !== void 0) {
      fields.push("avatar = ?");
      params.push(avatar);
    }
    if (fields.length === 0) return { success: true };
    params.push(userId);
    try {
      await queryRun(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
      const updatedUser = await queryAll("SELECT id, username, email, phone, avatar, nickname, role, created_at FROM users WHERE id = ?", [userId]);
      return { success: true, user: updatedUser[0] };
    } catch (error) {
      return { success: false, message: "更新失败: " + error.message };
    }
  },
  /**
   * 保存头像
   */
  async saveAvatar(userId, base64Data) {
    try {
      const userDataPath = electron.app.getPath("userData");
      const avatarsDir = path.join(userDataPath, "avatars");
      if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true });
      }
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("无效的图片数据");
      }
      const extension = matches[1].split("/")[1];
      const fileName = `avatar_${userId}_${Date.now()}.${extension}`;
      const filePath = path.join(avatarsDir, fileName);
      const buffer = Buffer.from(matches[2], "base64");
      fs.writeFileSync(filePath, buffer);
      const normalizedPath = filePath.replace(/\\/g, "/");
      const avatarUrl = `local-resource:///${normalizedPath}`;
      await this.updateProfile(userId, { avatar: avatarUrl });
      return { success: true, avatarUrl };
    } catch (error) {
      console.error("Failed to save avatar:", error);
      return { success: false, message: error.message };
    }
  },
  /**
   * 验证用户是否可以重置密码 (通过用户名和手机号)
   */
  async verifyUserForReset(username, phone) {
    const users = await queryAll(
      "SELECT id, phone FROM users WHERE username = ?",
      [username]
    );
    if (users.length === 0) {
      return { success: false, message: "用户不存在" };
    }
    const user = users[0];
    if (user.phone !== phone) {
      return { success: false, message: "手机号不匹配" };
    }
    return { success: true, userId: user.id };
  },
  /**
   * 重置密码
   */
  async resetPassword(userId, newPassword) {
    const hashedPassword = this.hashPassword(newPassword);
    try {
      await queryRun("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
      return { success: true };
    } catch (error) {
      return { success: false, message: "重置密码失败: " + error.message };
    }
  },
  /**
   * 初始化管理员账号
   */
  async initAdmin() {
    const admin = await queryAll("SELECT id FROM users WHERE username = ?", ["admin"]);
    if (admin.length === 0) {
      const hashedPassword = this.hashPassword("123456");
      await queryRun(
        "INSERT INTO users (username, password, nickname, role, phone) VALUES (?, ?, ?, ?, ?)",
        ["admin", hashedPassword, "超级管理员", "admin", "13800000000"]
      );
      console.log("Default admin account created (admin/123456, phone: 13800000000)");
    }
  }
};
const ScheduleService = {
  // 获取用户某月的所有日程
  // dateStr: YYYY-MM
  async getSchedulesByMonth(userId, dateStr) {
    const sql = `
      SELECT * FROM schedules 
      WHERE user_id = ? 
      AND strftime('%Y-%m', schedule_date) = ?
      ORDER BY schedule_date ASC, created_at ASC
    `;
    return await queryAll(sql, [userId, dateStr]);
  },
  // 获取用户某天的所有日程
  async getSchedulesByDate(userId, dateStr) {
    const sql = `
      SELECT * FROM schedules 
      WHERE user_id = ? 
      AND schedule_date = ?
      ORDER BY created_at ASC
    `;
    return await queryAll(sql, [userId, dateStr]);
  },
  // 添加日程
  async addSchedule(userId, content, scheduleDate) {
    const sql = `
      INSERT INTO schedules (user_id, content, schedule_date) 
      VALUES (?, ?, ?)
    `;
    return await queryRun(sql, [userId, content, scheduleDate]);
  },
  // 删除日程
  async deleteSchedule(id, userId) {
    const sql = `DELETE FROM schedules WHERE id = ? AND user_id = ?`;
    return await queryRun(sql, [id, userId]);
  }
};
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow = null;
let aboutWindow = null;
initDatabase().then(() => UserService.initAdmin()).catch(console.error);
if (process.env.VITE_DEV_SERVER_URL) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
}
electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: "local-resource",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname$1, "../public/vite.svg")
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(() => {
  electron.protocol.handle("local-resource", (request) => {
    try {
      let urlPath = request.url.replace(/^local-resource:\/*/, "");
      urlPath = decodeURIComponent(urlPath);
      if (/^[a-zA-Z]\/Users\//.test(urlPath)) {
        urlPath = urlPath.charAt(0) + ":" + urlPath.slice(1);
      }
      const fileUrl = "file:///" + urlPath;
      console.log(`[LocalResource] Loading: ${request.url} -> ${fileUrl}`);
      return electron.net.fetch(fileUrl);
    } catch (error) {
      console.error("[LocalResource] Failed:", error);
      return new Response("Not Found", { status: 404 });
    }
  });
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("account:getAll", () => AccountService.getAllAccounts());
electron.ipcMain.handle("account:getGroups", () => AccountService.getAllGroups());
electron.ipcMain.handle("account:add", (event, account) => AccountService.addAccount(account));
electron.ipcMain.handle("account:update", (event, id, account) => AccountService.updateAccount(id, account));
electron.ipcMain.handle("account:delete", (event, id) => AccountService.deleteAccount(id));
electron.ipcMain.handle("group:add", (event, group) => AccountService.addGroup(group));
electron.ipcMain.handle("group:update", (event, id, group) => AccountService.updateGroup(id, group));
electron.ipcMain.handle("group:delete", (event, id) => AccountService.deleteGroup(id));
electron.ipcMain.handle("form:getFolders", () => FormService.getAllFolders());
electron.ipcMain.handle("form:getTemplates", () => FormService.getAllTemplates());
electron.ipcMain.handle("form:getMappings", (event, templateId) => FormService.getMappingsByTemplate(templateId));
electron.ipcMain.handle("form:addFolder", (event, folder) => FormService.addFolder(folder));
electron.ipcMain.handle("form:updateFolder", (event, id, folder) => FormService.updateFolder(id, folder));
electron.ipcMain.handle("form:deleteFolder", (event, id) => FormService.deleteFolder(id));
electron.ipcMain.handle("form:addTemplate", (event, template) => FormService.addTemplate(template));
electron.ipcMain.handle("form:updateTemplate", (event, id, template) => FormService.updateTemplate(id, template));
electron.ipcMain.handle("form:deleteTemplate", (event, id) => FormService.deleteTemplate(id));
electron.ipcMain.handle("form:deleteTemplates", (event, ids) => FormService.deleteTemplates(ids));
electron.ipcMain.handle("mapping:add", (event, mapping) => FormService.addMapping(mapping));
electron.ipcMain.handle("mapping:update", (event, id, mapping) => FormService.updateMapping(id, mapping));
electron.ipcMain.handle("mapping:delete", (event, id) => FormService.deleteMapping(id));
electron.ipcMain.handle("setting:get", (event, key) => SettingService.getSetting(key));
electron.ipcMain.handle("setting:getAll", () => SettingService.getAllSettings());
electron.ipcMain.handle("setting:set", (event, key, value) => SettingService.setSetting(key, value));
electron.ipcMain.handle("log:getAll", (event, limit) => DataService.getLogs(limit));
electron.ipcMain.handle("log:add", (event, log) => DataService.addLog(log));
electron.ipcMain.handle("log:clean", (event, days) => DataService.cleanExpiredLogs(days));
electron.ipcMain.handle("backup:getAll", () => DataService.getBackups());
electron.ipcMain.handle("backup:add", (event, backup) => DataService.addBackup(backup));
electron.ipcMain.handle("backup:delete", (event, id) => DataService.deleteBackup(id));
electron.ipcMain.handle("migration:check", () => MigrationService.isMigrated());
electron.ipcMain.handle("migration:run", (event, data) => MigrationService.migrate(data));
electron.ipcMain.handle("autofill:start", async (event, options) => {
  return await AutoFillService.startTask(options, (progress) => {
    event.sender.send("autofill:progress", progress);
  });
});
electron.ipcMain.handle("autofill:pickSelector", async (event, url2) => {
  return await AutoFillService.pickSelector(url2);
});
electron.ipcMain.handle("autofill:scan", async (event, url2) => {
  return await AutoFillService.scanForm(url2);
});
electron.ipcMain.handle("app:getVersion", () => electron.app.getVersion());
electron.ipcMain.on("open-about-dialog", () => {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }
  aboutWindow = new electron.BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: "关于",
    parent: mainWindow || void 0,
    modal: !!mainWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  aboutWindow.setMenu(null);
  if (process.env.VITE_DEV_SERVER_URL) {
    aboutWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}about.html`);
  } else {
    aboutWindow.loadFile(path.join(__dirname$1, "../dist/about.html"));
  }
  aboutWindow.on("closed", () => {
    aboutWindow = null;
  });
});
electron.ipcMain.handle("ping", () => "pong");
electron.ipcMain.handle("db:run", (event, sql, params) => queryRun(sql, params));
electron.ipcMain.handle("db:query", (event, sql, params) => queryAll(sql, params));
electron.ipcMain.handle("db:get", (event, sql, params) => queryGet(sql, params));
electron.ipcMain.handle("excel:importAccounts", async () => {
  const result = await electron.dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls", "csv"] }]
  });
  if (result.canceled) return null;
  const accounts = ExcelService.parseAccountExcel(result.filePaths[0]);
  return AccountService.addAccountsBulk(accounts);
});
electron.ipcMain.handle("excel:exportAccounts", async (event, accounts, fields) => {
  const result = await electron.dialog.showSaveDialog({
    title: "导出账号",
    defaultPath: path.join(electron.app.getPath("downloads"), `账号列表_${Date.now()}.xlsx`),
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
  });
  if (result.canceled) return false;
  ExcelService.exportAccountsToExcel(accounts, result.filePath, fields);
  return true;
});
electron.ipcMain.handle("auth:login", async (event, { account, password }) => {
  return await UserService.login(account, password);
});
electron.ipcMain.handle("auth:register", async (event, userData) => {
  return await UserService.register(userData);
});
electron.ipcMain.handle("auth:getUser", async (event, userId) => {
  return await UserService.getUser(userId);
});
electron.ipcMain.handle("auth:updateProfile", async (event, userId, data) => {
  return await UserService.updateProfile(userId, data);
});
electron.ipcMain.handle("auth:saveAvatar", async (event, userId, base64Data) => {
  return await UserService.saveAvatar(userId, base64Data);
});
electron.ipcMain.handle("auth:verifyReset", async (event, username, phone) => {
  return await UserService.verifyUserForReset(username, phone);
});
electron.ipcMain.handle("auth:resetPassword", async (event, userId, newPassword) => {
  return await UserService.resetPassword(userId, newPassword);
});
electron.ipcMain.handle("schedule:getByMonth", (event, userId, dateStr) => ScheduleService.getSchedulesByMonth(userId, dateStr));
electron.ipcMain.handle("schedule:getByDate", (event, userId, dateStr) => ScheduleService.getSchedulesByDate(userId, dateStr));
electron.ipcMain.handle("schedule:add", (event, userId, content, scheduleDate) => ScheduleService.addSchedule(userId, content, scheduleDate));
electron.ipcMain.handle("schedule:delete", (event, id, userId) => ScheduleService.deleteSchedule(id, userId));
