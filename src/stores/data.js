import { defineStore } from 'pinia'

// 数据管理store
export const useDataStore = defineStore('data', {
  state: () => ({
    backups: [],
    logs: [],
    backupSettings: {
      enabled: true,
      time: '00:00',
      frequency: 'daily',
      path: 'D:/backup/'
    },
    loading: false
  }),
  getters: {
    successLogs: (state) => {
      return state.logs.filter(log => log.fill_result === '成功')
    },
    failedLogs: (state) => {
      return state.logs.filter(log => log.fill_result === '失败')
    }
  },
  actions: {
    // 从数据库加载初始数据
    async loadInitialData() {
      if (!window.electronAPI) return;
      this.loading = true;
      try {
        const [backups, logs, settings] = await Promise.all([
          window.electronAPI.backup.getAll(),
          window.electronAPI.log.getAll(100),
          window.electronAPI.setting.get('backupSettings')
        ]);
        this.backups = backups || [];
        this.logs = logs || [];
        if (settings) {
          this.backupSettings = settings;
        }
      } catch (error) {
        console.error('Failed to load data/logs:', error);
      } finally {
        this.loading = false;
      }
    },

    // 备份操作
    async addBackup(backup) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.backup.add(backup);
        this.backups.push({ id: newId, ...backup });
      } catch (error) {
        console.error('Failed to add backup:', error);
        throw error;
      }
    },
    async deleteBackup(id) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.backup.delete(id);
        this.backups = this.backups.filter(b => b.id !== id);
      } catch (error) {
        console.error('Failed to delete backup:', error);
        throw error;
      }
    },

    // 日志操作
    async addLog(log) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.log.add(log);
        this.logs.unshift({ id: newId, ...log });
      } catch (error) {
        console.error('Failed to add log:', error);
        throw error;
      }
    },
    async cleanExpiredLogs(days) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.log.clean(days);
        // 本地也同步清理
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        this.logs = this.logs.filter(log => new Date(log.fill_time) >= cutoffDate);
      } catch (error) {
        console.error('Failed to clean logs:', error);
        throw error;
      }
    },

    // 备份设置
    async updateBackupSettings(settings) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.setting.set('backupSettings', settings);
        this.backupSettings = { ...this.backupSettings, ...settings };
      } catch (error) {
        console.error('Failed to update backup settings:', error);
        throw error;
      }
    }
  }
})
