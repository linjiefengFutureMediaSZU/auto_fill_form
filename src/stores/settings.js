import { defineStore } from 'pinia'

// 系统设置store
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 通用设置
    general: {
      language: 'zh-CN',
      theme: 'light', // light, dark
      fontSize: 'medium' // small, medium, large
    },
    // 部署设置
    deployment: {
      local: {
        dataPath: 'C:/AutoFill/data/',
        backupPath: 'C:/AutoFill/backup/',
        port: 3000,
        status: 'running'
      },
      online: {
        enabled: false,
        serverAddress: '',
        port: 8080,
        database: {
          host: '',
          port: 3306,
          username: '',
          password: ''
        }
      }
    },
    // 填写设置
    fill: {
      submitInterval: 2, // 提交间隔（秒）
      requiredFieldAlert: 'popup' // popup, tooltip
    },
    // 账号安全设置
    security: {
      passwordEnabled: true,
      password: 'admin123', // 实际项目中应加密存储
      email: 'admin@example.com'
    },
    // 版本信息
    version: {
      current: '1.0.0',
      latest: '1.0.0',
      updateAvailable: false
    }
  }),
  actions: {
    // 更新通用设置
    updateGeneralSettings(settings) {
      this.general = { ...this.general, ...settings }
    },
    // 更新本地部署设置
    updateLocalDeploymentSettings(settings) {
      this.deployment.local = { ...this.deployment.local, ...settings }
    },
    // 更新线上部署设置
    updateOnlineDeploymentSettings(settings) {
      this.deployment.online = { ...this.deployment.online, ...settings }
    },
    // 更新填写设置
    updateFillSettings(settings) {
      this.fill = { ...this.fill, ...settings }
    },
    // 更新安全设置
    updateSecuritySettings(settings) {
      this.security = { ...this.security, ...settings }
    },
    // 切换主题
    toggleTheme() {
      this.general.theme = this.general.theme === 'light' ? 'dark' : 'light'
    }
  }
})
