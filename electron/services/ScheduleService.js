import { queryAll, queryRun } from '../database.js';

export const ScheduleService = {
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