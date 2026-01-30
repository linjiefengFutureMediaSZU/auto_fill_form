import { defineStore } from 'pinia'

// 系统设置store
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 通用设置
    general: {
      language: 'zh-CN',
      theme: 'light',
      fontSize: 'medium'
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
      submitInterval: 2,
      requiredFieldAlert: 'popup'
    },
    // 账号安全设置
    security: {
      passwordEnabled: true,
      password: 'admin123',
      email: 'admin@example.com'
    },
    // 版本信息
    version: {
      current: '1.0.0',
      latest: '1.0.0',
      updateAvailable: false
    },
    loading: false
  }),
  actions: {
    // 从数据库加载初始数据
    async loadInitialData() {
      if (!window.electronAPI) return;
      this.loading = true;
      try {
        const settings = await window.electronAPI.setting.getAll();
        if (settings.general) this.general = settings.general;
        if (settings.deployment) this.deployment = settings.deployment;
        if (settings.fill) this.fill = settings.fill;
        if (settings.security) this.security = settings.security;
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        this.loading = false;
      }
    },

    // 更新通用设置
    async updateGeneralSettings(settings) {
      if (!window.electronAPI) return;
      try {
        const newSettings = { ...this.general, ...settings };
        await window.electronAPI.setting.set('general', newSettings);
        this.general = newSettings;
      } catch (error) {
        console.error('Failed to update general settings:', error);
        throw error;
      }
    },

    // 更新本地部署设置
    async updateLocalDeploymentSettings(settings) {
      if (!window.electronAPI) return;
      try {
        const newSettings = { ...this.deployment.local, ...settings };
        const fullDeployment = { ...this.deployment, local: newSettings };
        await window.electronAPI.setting.set('deployment', fullDeployment);
        this.deployment.local = newSettings;
      } catch (error) {
        console.error('Failed to update local deployment settings:', error);
        throw error;
      }
    },

    // 更新填写设置
    async updateFillSettings(settings) {
      if (!window.electronAPI) return;
      try {
        const newSettings = { ...this.fill, ...settings };
        await window.electronAPI.setting.set('fill', newSettings);
        this.fill = newSettings;
      } catch (error) {
        console.error('Failed to update fill settings:', error);
        throw error;
      }
    },

    // 更新安全设置
    async updateSecuritySettings(settings) {
      if (!window.electronAPI) return;
      try {
        const newSettings = { ...this.security, ...settings };
        await window.electronAPI.setting.set('security', newSettings);
        this.security = newSettings;
      } catch (error) {
        console.error('Failed to update security settings:', error);
        throw error;
      }
    },

    // 切换主题
    async toggleTheme() {
      const newTheme = this.general.theme === 'light' ? 'dark' : 'light'
      await this.updateGeneralSettings({ theme: newTheme })
      
      // 更新全局类名
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    
    // 初始化主题
    initTheme() {
      if (this.general.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
})
