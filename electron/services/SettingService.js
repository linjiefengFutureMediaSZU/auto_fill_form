import { queryAll, queryRun } from '../database.js';

export const SettingService = {
  // 获取设置
  async getSetting(key) {
    const rows = await queryAll('SELECT value FROM system_settings WHERE key = ?', [key]);
    const row = rows[0];
    if (!row || row.value === 'undefined' || row.value === null) return null;
    try {
      return JSON.parse(row.value);
    } catch (e) {
      console.error(`Failed to parse setting ${key}:`, e);
      return null;
    }
  },

  // 保存设置
  async setSetting(key, value) {
    const valueStr = JSON.stringify(value !== undefined ? value : null);
    await queryRun('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)', [key, valueStr]);
  },

  // 获取所有设置
  async getAllSettings() {
    const rows = await queryAll('SELECT * FROM system_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = JSON.parse(row.value);
    });
    return settings;
  }
};
