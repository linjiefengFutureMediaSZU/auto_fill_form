<template>
  <!-- 直接使用router-view，让路由配置决定显示内容 -->
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useSettingsStore, useAccountStore, useFormStore, useDataStore } from './stores'

const settingsStore = useSettingsStore()
const accountStore = useAccountStore()
const formStore = useFormStore()
const dataStore = useDataStore()

const syncTheme = (theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

// 数据迁移逻辑
const handleMigration = async () => {
  if (!window.electronAPI) return

  const isMigrated = await window.electronAPI.migration.check()
  if (!isMigrated) {
    console.log('Starting data migration from localStorage to SQLite...')
    
    // 收集 localStorage 数据
    const migrationData = {
      accounts: JSON.parse(localStorage.getItem('accounts')),
      account_groups: JSON.parse(localStorage.getItem('account_groups')),
      form_folders: JSON.parse(localStorage.getItem('form_folders')),
      form_templates: JSON.parse(localStorage.getItem('form_templates')),
      form_field_mappings: JSON.parse(localStorage.getItem('form_field_mappings')),
      logs: JSON.parse(localStorage.getItem('logs')), // 注意：data store 里的 logs
      settings: {
        general: JSON.parse(localStorage.getItem('settings_general')), // 假设这是存储方式，需核实
        deployment: JSON.parse(localStorage.getItem('settings_deployment')),
        fill: JSON.parse(localStorage.getItem('settings_fill')),
        security: JSON.parse(localStorage.getItem('settings_security')),
      }
    }

    // 执行迁移
    const result = await window.electronAPI.migration.run(migrationData)
    if (result.success) {
      console.log('Data migration completed successfully!')
    }
  }

  // 加载初始数据
  console.log('Loading initial data from SQLite...')
  await Promise.all([
    accountStore.loadInitialData(),
    formStore.loadInitialData(),
    dataStore.loadInitialData(),
    settingsStore.loadInitialData()
  ])
}

// 监听主题变化
watch(() => settingsStore.general.theme, (newTheme) => {
  syncTheme(newTheme)
})

// 初始化
onMounted(async () => {
  // 确保每次重新启动应用（刷新页面）都回到登录页
  accountStore.logout()
  
  syncTheme(settingsStore.general.theme)
  await handleMigration()
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  background-color: #f5f7fa;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
