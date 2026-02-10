import { queryAll, queryRun } from '../database.js';

export const AccountService = {
  // 获取所有账号
  async getAllAccounts() {
    return await queryAll('SELECT * FROM accounts ORDER BY created_at DESC');
  },

  // 获取所有分组
  async getAllGroups() {
    return await queryAll('SELECT * FROM account_groups ORDER BY created_at ASC');
  },

  // 添加账号
  async addAccount(account) {
    const {
      group_id, blogger_name, account_nickname, account_type, account_id,
      homepage_url, fans_count, avg_read_count, like_count, comment_count,
      quote_single, quote_package, cooperation_type, is_swap, contact,
      remark, status, extra_json
    } = account;

    const result = await queryRun(`
      INSERT INTO accounts (
        group_id, blogger_name, account_nickname, account_type, account_id,
        homepage_url, fans_count, avg_read_count, like_count, comment_count,
        quote_single, quote_package, cooperation_type, is_swap, contact,
        remark, status, extra_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      group_id, blogger_name, account_nickname, account_type, account_id,
      homepage_url, fans_count, avg_read_count, like_count, comment_count,
      quote_single, quote_package, cooperation_type, is_swap ? 1 : 0, contact,
      remark, status, extra_json
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
    console.log('AccountService.updateAccount called with:', id, account);
    const fields = Object.keys(account).filter(k => k !== 'id' && k !== 'created_at');
    
    if (fields.length === 0) {
      console.warn('No fields to update for account:', id);
      return;
    }

    const values = fields.map(k => {
      if (k === 'is_swap') return account.is_swap ? 1 : 0;
      return account[k];
    });
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const sql = `UPDATE accounts SET ${setClause} WHERE id = ?`;
    console.log('Executing SQL:', sql, [...values, id]);
    
    try {
      await queryRun(sql, [...values, id]);
      console.log('Update successful');
    } catch (error) {
      console.error('SQL Execution Error:', error);
      throw error;
    }
  },

  // 删除账号
  async deleteAccount(id) {
    await queryRun('DELETE FROM accounts WHERE id = ?', [id]);
  },

  // 添加分组
  async addGroup(group) {
    const { group_name, description } = group;
    const result = await queryRun('INSERT INTO account_groups (group_name, description) VALUES (?, ?)', [group_name, description]);
    return result.lastID;
  },

  // 更新分组
  async updateGroup(id, group) {
    const { group_name, description } = group;
    await queryRun('UPDATE account_groups SET group_name = ?, description = ? WHERE id = ?', [group_name, description, id]);
  },

  // 删除分组
  async deleteGroup(id) {
    await queryRun('UPDATE accounts SET group_id = NULL WHERE group_id = ?', [id]);
    await queryRun('DELETE FROM account_groups WHERE id = ?', [id]);
  }
};
