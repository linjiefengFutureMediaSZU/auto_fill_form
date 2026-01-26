<template>
  <!-- 直接使用router-view，让路由配置决定显示内容 -->
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useSettingsStore } from './stores'

const settingsStore = useSettingsStore()

const syncTheme = (theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

// 监听主题变化
watch(() => settingsStore.general.theme, (newTheme) => {
  syncTheme(newTheme)
})

// 初始化主题
onMounted(() => {
  syncTheme(settingsStore.general.theme)
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
