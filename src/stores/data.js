import { defineStore } from 'pinia'

// 数据管理store
export const useDataStore = defineStore('data', {
  state: () => ({
    // 备份列表
    backups: [
      {
        id: 1,
        backup_time: '2026-01-22 00:00:00',
        backup_path: 'D:/backup/backup_20260122_000000.json',
        backup_size: '1.2 MB',
        account_count: 2,
        template_count: 2,
        log_count: 10
      },
      {
        id: 2,
        backup_time: '2026-01-21 00:00:00',
        backup_path: 'D:/backup/backup_20260121_000000.json',
        backup_size: '1.1 MB',
        account_count: 2,
        template_count: 1,
        log_count: 8
      }
    ],
    // 填写日志
    logs: [
      {
        id: 1,
        account_id: 1,
        template_id: 1,
        fill_time: '2026-01-22 10:00:00',
        fill_result: '成功',
        fail_reason: null,
        submit_count: 1
      },
      {
        id: 2,
        account_id: 2,
        template_id: 1,
        fill_time: '2026-01-22 10:01:00',
        fill_result: '成功',
        fail_reason: null,
        submit_count: 1
      },
      {
        id: 3,
        account_id: 1,
        template_id: 2,
        fill_time: '2026-01-22 09:00:00',
        fill_result: '失败',
        fail_reason: '网络异常',
        submit_count: 1
      }
    ],
    // 定时备份设置
    backupSettings: {
      enabled: true,
      time: '00:00',
      frequency: 'daily', // daily, weekly, monthly
      path: 'D:/backup/'
    }
  }),
  getters: {
    // 获取成功的日志
    successLogs: (state) => {
      return state.logs.filter(log => log.fill_result === '成功')
    },
    // 获取失败的日志
    failedLogs: (state) => {
      return state.logs.filter(log => log.fill_result === '失败')
    }
  },
  actions: {
    // 添加备份记录
    addBackup(backup) {
      const newId = Math.max(...this.backups.map(b => b.id), 0) + 1
      this.backups.push({ id: newId, ...backup })
    },
    // 删除备份
    deleteBackup(id) {
      this.backups = this.backups.filter(b => b.id !== id)
    },
    // 添加填写日志
    addLog(log) {
      const newId = Math.max(...this.logs.map(l => l.id), 0) + 1
      this.logs.unshift({ id: newId, ...log })
    },
    // 清理过期日志
    cleanExpiredLogs(days) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      this.logs = this.logs.filter(log => {
        const logDate = new Date(log.fill_time)
        return logDate >= cutoffDate
      })
    },
    // 更新备份设置
    updateBackupSettings(settings) {
      this.backupSettings = { ...this.backupSettings, ...settings }
    }
  }
})
