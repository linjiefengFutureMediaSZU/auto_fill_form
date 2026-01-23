<template>
  <div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 侧边导航栏 -->
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      class="sidebar"
      :class="{ 'collapsed': isCollapse }"
    >
      <div class="sidebar-header">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20fill%20form%20tool%20logo%2C%20simple%20modern%20design%2C%20blue%20color%20scheme&image_size=square_hd" alt="Logo" class="logo" />
        <span v-if="!isCollapse" class="logo-text">自动填写工具</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#f5f7fa"
        text-color="#303133"
        active-text-color="#409EFF"
        :collapse="isCollapse"
        router
      >
        <el-menu-item index="/account">
          <el-icon><User /></el-icon>
          <template #title>账号管理</template>
        </el-menu-item>
        <el-menu-item index="/form">
          <el-icon><Document /></el-icon>
          <template #title>表单填写</template>
        </el-menu-item>
        <el-menu-item index="/formList">
          <el-icon><List /></el-icon>
          <template #title>表单列表</template>
        </el-menu-item>
        <el-menu-item index="/data">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据管理</template>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>基础设置</template>
        </el-menu-item>
        <el-menu-item index="/help">
          <el-icon><HelpFilled /></el-icon>
          <template #title>帮助与反馈</template>
        </el-menu-item>
      </el-menu>
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon v-if="isCollapse"><ArrowRight /></el-icon>
        <el-icon v-else><ArrowLeft /></el-icon>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部状态栏 -->
      <el-header class="top-bar">
        <div class="top-bar-left">
          <span class="current-time">{{ currentTime }}</span>
          <span class="deployment-status">
            <el-tag size="small" type="success">本地部署已启动</el-tag>
          </span>
        </div>
        <div class="top-bar-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small"><span>Admin</span></el-avatar>
              <span v-if="!isCollapse">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item @click="toggleTheme">
                  <el-icon v-if="!isDarkTheme"><MoonNight /></el-icon>
                  <el-icon v-else><Sunny /></el-icon>
                  <span>{{ isDarkTheme ? '切换浅色主题' : '切换深色主题' }}</span>
                </el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content-area">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '../stores'
import { User, Document, List, DataAnalysis, Setting, HelpFilled, ArrowLeft, ArrowRight, MoonNight, Sunny } from '@element-plus/icons-vue'

// 状态管理
const settingsStore = useSettingsStore()
const route = useRoute()

// 响应式数据
const isCollapse = ref(false)
const currentTime = ref('')
let timeInterval = null

// 计算属性
const activeMenu = computed(() => {
  return route.path
})

const isDarkTheme = computed(() => {
  return settingsStore.general.theme === 'dark'
})

// 方法
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleTheme = () => {
  settingsStore.toggleTheme()
}

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;

  &.dark-theme {
    background-color: #1a1a1a;
    color: #e0e0e0;

    .sidebar {
      background-color: #242424;

      .sidebar-header {
        background-color: #1e1e1e;
        border-bottom: 1px solid #333;
      }

      .logo-text {
        color: #e0e0e0;
      }

      .sidebar-menu {
        background-color: #242424;
        text-color: #e0e0e0;
        active-text-color: #409EFF;
      }

      .collapse-btn {
        background-color: #242424;
        border-color: #333;

        &:hover {
          background-color: #2c3e50;
          border-color: #444;
        }
      }
    }

    .top-bar {
      background-color: #1e1e1e;
      border-bottom: 1px solid #333;

      .current-time,
      .user-info span {
        color: #e0e0e0;
      }
    }

    .content-area {
      background-color: #1a1a1a;
      color: #e0e0e0;
    }
  }
}

.sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s ease;

  &.collapsed {
    .logo-text {
      display: none;
    }
  }

  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background-color: #ffffff;
    border-bottom: 1px solid #e4e7ed;

    .logo {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .logo-text {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;
  }

  .collapse-btn {
    position: absolute;
    right: 10px;
    bottom: 20px;
    width: 24px;
    height: 24px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: none;
    z-index: 10;

    &:hover {
      background-color: #f0f9eb;
      border-color: #c2e7b0;
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .current-time {
      font-size: 14px;
      color: #606266;
    }
  }

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      span {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>
