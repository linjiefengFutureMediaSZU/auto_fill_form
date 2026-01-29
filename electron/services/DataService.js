import { queryAll, queryRun } from '../database.js';

export const DataService = {
  // 获取填写日志
  async getLogs(limit = 100) {
    return await queryAll('SELECT * FROM fill_logs ORDER BY fill_time DESC LIMIT ?', [limit]);
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
    return await queryAll('SELECT * FROM backups ORDER BY backup_time DESC');
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
    await queryRun('DELETE FROM backups WHERE id = ?', [id]);
  }
};
