import { queryAll, queryRun } from '../database.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export const UserService = {
  /**
   * 密码加密
   */
  hashPassword(password) {
    const salt = 'autofill_salt_2026';
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  },

  /**
   * 用户登录 (支持用户名或手机号)
   */
  async login(account, password) {
    // 先查询用户是否存在
    const users = await queryAll(
      'SELECT id, username, email, phone, avatar, nickname, role, created_at, password FROM users WHERE username = ? OR phone = ?', 
      [account, account]
    );
    
    if (users.length === 0) {
      return { success: false, message: '账号不存在' };
    }

    const user = users[0];
    const hashedPassword = this.hashPassword(password);
    
    if (user.password !== hashedPassword) {
      return { success: false, message: '密码错误' };
    }

    // 登录成功，移除密码字段后返回用户信息
    delete user.password;
    return { success: true, user: user };
  },

  /**
   * 修改密码
   */
  async changePassword(userId, oldPassword, newPassword) {
    const users = await queryAll('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return { success: false, message: '用户不存在' };
    
    const hashedOldPassword = this.hashPassword(oldPassword);
    if (users[0].password !== hashedOldPassword) {
      return { success: false, message: '当前密码错误' };
    }
    
    const hashedNewPassword = this.hashPassword(newPassword);
    try {
      await queryRun('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
      return { success: true };
    } catch (error) {
      return { success: false, message: '修改密码失败: ' + error.message };
    }
  },

  /**
   * 用户注册
   */
  async register(userData) {
    const { username, password, nickname, email, phone } = userData;
    
    const existingUser = await queryAll('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return { success: false, message: '用户名已存在' };
    }

    if (phone) {
      const existingPhone = await queryAll('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingPhone.length > 0) {
        return { success: false, message: '手机号已被注册' };
      }
    }

    const hashedPassword = this.hashPassword(password);
    try {
      const result = await queryRun(
        'INSERT INTO users (username, password, nickname, email, phone) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, nickname || username, email || null, phone || null]
      );
      return { success: true, userId: result.lastID };
    } catch (error) {
      return { success: false, message: '注册失败: ' + error.message };
    }
  },

  /**
   * 更新用户资料
   */
  async updateProfile(userId, data) {
    const { username, nickname, email, phone, avatar } = data;
    const fields = [];
    const params = [];

    // 如果更新用户名，需要检查唯一性
    if (username !== undefined) {
      const existingUser = await queryAll('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (existingUser.length > 0) {
        return { success: false, message: '用户名已存在' };
      }
      fields.push('username = ?');
      params.push(username);
    }
    
    // 如果更新手机号，需要检查唯一性
    if (phone !== undefined && phone !== '') {
      const existingPhone = await queryAll('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, userId]);
      if (existingPhone.length > 0) {
        return { success: false, message: '手机号已被注册' };
      }
      fields.push('phone = ?');
      params.push(phone);
    } else if (phone === '') {
       // 允许清空手机号
       fields.push('phone = ?');
       params.push(null);
    }

    if (nickname !== undefined) { fields.push('nickname = ?'); params.push(nickname); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (avatar !== undefined) { fields.push('avatar = ?'); params.push(avatar); }

    if (fields.length === 0) return { success: true };

    params.push(userId);
    try {
      await queryRun(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
      const updatedUser = await queryAll('SELECT id, username, email, phone, avatar, nickname, role, created_at FROM users WHERE id = ?', [userId]);
      return { success: true, user: updatedUser[0] };
    } catch (error) {
      return { success: false, message: '更新失败: ' + error.message };
    }
  },

  /**
   * 保存头像
   */
  async saveAvatar(userId, base64Data) {
    try {
      const userDataPath = app.getPath('userData');
      const avatarsDir = path.join(userDataPath, 'avatars');
      
      if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true });
      }

      // 提取 base64 数据
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('无效的图片数据');
      }

      const extension = matches[1].split('/')[1];
      const fileName = `avatar_${userId}_${Date.now()}.${extension}`;
      const filePath = path.join(avatarsDir, fileName);
      const buffer = Buffer.from(matches[2], 'base64');

      fs.writeFileSync(filePath, buffer);

      // 返回文件的协议路径，方便前端显示
      const avatarUrl = `file://${filePath}`;
      await this.updateProfile(userId, { avatar: avatarUrl });

      return { success: true, avatarUrl };
    } catch (error) {
      console.error('Failed to save avatar:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * 验证用户是否可以重置密码 (通过用户名和手机号)
   */
  async verifyUserForReset(username, phone) {
    const users = await queryAll(
      'SELECT id, phone FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = users[0];
    if (user.phone !== phone) {
      return { success: false, message: '手机号不匹配' };
    }

    return { success: true, userId: user.id };
  },

  /**
   * 重置密码
   */
  async resetPassword(userId, newPassword) {
    const hashedPassword = this.hashPassword(newPassword);
    try {
      await queryRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      return { success: true };
    } catch (error) {
      return { success: false, message: '重置密码失败: ' + error.message };
    }
  },

  /**
   * 初始化管理员账号
   */
  async initAdmin() {
    const admin = await queryAll('SELECT id FROM users WHERE username = ?', ['admin']);
    if (admin.length === 0) {
      const hashedPassword = this.hashPassword('123456');
      await queryRun(
        'INSERT INTO users (username, password, nickname, role, phone) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, '超级管理员', 'admin', '13800000000']
      );
      console.log('Default admin account created (admin/123456, phone: 13800000000)');
    }
  }
};
