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
    const fields = Object.keys(account).filter((k) => k !== "id" && k !== "created_at");
    const values = fields.map((k) => {
      if (k === "is_swap") return account.is_swap ? 1 : 0;
      return account[k];
    });
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    await queryRun(`UPDATE accounts SET ${setClause} WHERE id = ?`, [...values, id]);
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
const AutoFillService = {
  // 运行中的浏览器实例
  activeBrowsers: /* @__PURE__ */ new Map(),
  /**
   * 开始填表任务
   * @param {Object} options 
   * @param {number[]} options.accountIds 账号 ID 列表
   * @param {number} options.templateId 模板 ID
   * @param {Object} options.settings 填表设置
   * @param {Function} onProgress 进度回调
   */
  async startTask(options, onProgress) {
    const { accountIds, templateId, settings } = options;
    const { showBrowser = true, submitInterval = 2 } = settings;
    const template = (await FormService.getAllTemplates()).find((t) => t.id === templateId);
    if (!template) throw new Error("模板不存在");
    const mappings = await FormService.getMappingsByTemplate(templateId);
    if (!mappings || mappings.length === 0) throw new Error("未配置字段映射规则");
    const accounts = (await AccountService.getAllAccounts()).filter((a) => accountIds.includes(a.id));
    let successCount = 0;
    let failCount = 0;
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      `task_${Date.now()}_${account.id}`;
      onProgress({
        type: "start",
        accountName: account.account_nickname,
        index: i,
        total: accounts.length
      });
      try {
        await this.fillSingle(account, template, mappings, { showBrowser }, (log) => {
          onProgress({ type: "log", log, accountId: account.id });
        });
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
        let screenshotPath = "";
        try {
          const screenshotsDir = path.join(electron.app.getPath("userData"), "screenshots");
          if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
          screenshotPath = path.join(screenshotsDir, `error_${Date.now()}_${account.id}.png`);
        } catch (e) {
          console.error("Failed to create screenshot dir:", e);
        }
        onProgress({
          type: "error",
          message: error.message,
          accountId: account.id,
          screenshotPath
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
    return { successCount, failCount };
  },
  /**
   * 填写单个账号
   */
  async fillSingle(account, template, mappings, options, logCallback) {
    const { showBrowser } = options;
    const browser = await playwrightExtra.chromium.launch({ headless: !showBrowser });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      logCallback(`正在跳转至表单: ${template.form_url}`);
      await page.goto(template.form_url, { waitUntil: "networkidle", timeout: 6e4 });
      for (const mapping of mappings) {
        const value = account[mapping.account_field_name];
        if (value === void 0 || value === null) continue;
        logCallback(`正在填写字段: ${mapping.form_field_name} -> ${value}`);
        try {
          await this.smartFill(page, mapping, value);
        } catch (e) {
          logCallback(`填写字段 ${mapping.form_field_name} 失败: ${e.message}`);
          if (mapping.is_required) throw e;
        }
      }
      logCallback(`账号 ${account.account_nickname} 填写完成`);
      await new Promise((resolve) => setTimeout(resolve, 2e3));
    } catch (error) {
      try {
        const screenshotsDir = path.join(electron.app.getPath("userData"), "screenshots");
        if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
        const screenshotPath = path.join(screenshotsDir, `error_${Date.now()}_${account.id}.png`);
        await page.screenshot({ path: screenshotPath });
        error.screenshotPath = screenshotPath;
      } catch (e) {
        console.error("Failed to capture screenshot:", e);
      }
      throw error;
    } finally {
      await browser.close();
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
      await page.click(`text="${form_field_name}" >> xpath=..//text="${value}"`);
      elementFound = true;
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
    return data.map((row) => ({
      blogger_name: row["博主姓名"] || "",
      account_nickname: row["账号昵称"] || "",
      account_type: row["账号类型"] || "",
      account_id: row["平台ID"] || "",
      homepage_url: row["主页链接"] || "",
      fans_count: parseInt(row["粉丝数"]) || 0,
      cooperation_type: row["合作类型"] || "",
      contact: row["联系方式"] || "",
      remark: row["备注"] || "",
      status: 1,
      // 默认正常
      is_swap: 0,
      extra_json: "{}"
    }));
  },
  /**
   * 导出账号到 Excel
   * @param {Array} accounts 账号列表
   * @param {string} savePath 保存路径
   */
  exportAccountsToExcel(accounts, savePath) {
    const exportData = accounts.map((a) => ({
      "博主姓名": a.blogger_name,
      "账号昵称": a.account_nickname,
      "账号类型": a.account_type,
      "平台ID": a.account_id,
      "主页链接": a.homepage_url,
      "粉丝数": a.fans_count,
      "合作类型": a.cooperation_type,
      "联系方式": a.contact,
      "备注": a.remark,
      "状态": a.status === 1 ? "正常" : "暂停"
    }));
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
    const users = await queryAll(
      "SELECT id, username, email, phone, avatar, nickname, role, created_at, password FROM users WHERE username = ? OR phone = ?",
      [account, account]
    );
    if (users.length === 0) {
      return { success: false, message: "账号不存在" };
    }
    const user = users[0];
    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: "密码错误" };
    }
    delete user.password;
    return { success: true, user };
  },
  /**
   * 修改密码
   */
  async changePassword(userId, oldPassword, newPassword) {
    const users = await queryAll("SELECT password FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return { success: false, message: "用户不存在" };
    const hashedOldPassword = this.hashPassword(oldPassword);
    if (users[0].password !== hashedOldPassword) {
      return { success: false, message: "当前密码错误" };
    }
    const hashedNewPassword = this.hashPassword(newPassword);
    try {
      await queryRun("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);
      return { success: true };
    } catch (error) {
      return { success: false, message: "修改密码失败: " + error.message };
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
    const { username, nickname, email, phone, avatar } = data;
    const fields = [];
    const params = [];
    if (username !== void 0) {
      const existingUser = await queryAll("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);
      if (existingUser.length > 0) {
        return { success: false, message: "用户名已存在" };
      }
      fields.push("username = ?");
      params.push(username);
    }
    if (phone !== void 0 && phone !== "") {
      const existingPhone = await queryAll("SELECT id FROM users WHERE phone = ? AND id != ?", [phone, userId]);
      if (existingPhone.length > 0) {
        return { success: false, message: "手机号已被注册" };
      }
      fields.push("phone = ?");
      params.push(phone);
    } else if (phone === "") {
      fields.push("phone = ?");
      params.push(null);
    }
    if (nickname !== void 0) {
      fields.push("nickname = ?");
      params.push(nickname);
    }
    if (email !== void 0) {
      fields.push("email = ?");
      params.push(email);
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
      const avatarUrl = `file://${filePath}`;
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
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href);
const __dirname$1 = path.dirname(__filename$1);
initDatabase().then(() => UserService.initAdmin()).catch(console.error);
function createWindow() {
  const win = new electron.BrowserWindow({
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
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
}
electron.app.whenReady().then(() => {
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
electron.ipcMain.handle("app:getVersion", () => electron.app.getVersion());
electron.ipcMain.handle("ping", () => "pong");
electron.ipcMain.handle("excel:importAccounts", async () => {
  const result = await electron.dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls", "csv"] }]
  });
  if (result.canceled) return null;
  const accounts = ExcelService.parseAccountExcel(result.filePaths[0]);
  return AccountService.addAccountsBulk(accounts);
});
electron.ipcMain.handle("excel:exportAccounts", async (event, accounts) => {
  const result = await electron.dialog.showSaveDialog({
    title: "导出账号",
    defaultPath: path.join(electron.app.getPath("downloads"), `账号列表_${Date.now()}.xlsx`),
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
  });
  if (result.canceled) return false;
  ExcelService.exportAccountsToExcel(accounts, result.filePath);
  return true;
});
electron.ipcMain.handle("auth:login", async (event, { account, password }) => {
  return await UserService.login(account, password);
});
electron.ipcMain.handle("auth:register", async (event, userData) => {
  return await UserService.register(userData);
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
electron.ipcMain.handle("auth:changePassword", async (event, userId, oldPassword, newPassword) => {
  return await UserService.changePassword(userId, oldPassword, newPassword);
});
electron.ipcMain.handle("auth:resetPassword", async (event, userId, newPassword) => {
  return await UserService.resetPassword(userId, newPassword);
});
