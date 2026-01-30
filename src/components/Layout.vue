<template>
  <div class="app-container">
    <!-- Global Liquid Background -->
    <div class="liquid-bg-container">
      <div class="liquid-bg-orb orb-1"></div>
      <div class="liquid-bg-orb orb-2"></div>
      <div class="liquid-bg-orb orb-3"></div>
    </div>

    <!-- 侧边导航栏 -->
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      class="sidebar glass-card"
      :class="{ 'collapsed': isCollapse }"
    >
      <div class="sidebar-header">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20fill%20form%20tool%20logo%2C%20simple%20modern%20design%2C%20blue%20color%20scheme&image_size=square_hd" alt="Logo" class="logo" />
        <span v-if="!isCollapse" class="logo-text">自动填写工具</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :background-color="'transparent'"
        :text-color="isDarkTheme ? '#e0e0e0' : '#303133'"
        :active-text-color="isDarkTheme ? '#0a84ff' : '#007aff'"
        :collapse="isCollapse"
        router
      >
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <template #title>个人中心</template>
        </el-menu-item>
        <el-menu-item index="/account">
          <el-icon><UserFilled /></el-icon>
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
      <el-header class="top-bar glass-card">
        <div class="top-bar-left">
          <span class="current-time">{{ currentTime }}</span>
          <span class="deployment-status">
            <el-tag size="small" type="success" effect="dark" round>本地部署已启动</el-tag>
          </span>
        </div>
        <div class="top-bar-right">
          <el-button 
            circle 
            @click="toggleTheme"
            class="theme-toggle-button"
            :class="{ 'dark-theme': isDarkTheme }"
          >
            <el-icon v-if="isDarkTheme"><Sunny /></el-icon>
            <el-icon v-else><MoonNight /></el-icon>
          </el-button>
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small" :src="userInfo.avatar">
                <span v-if="!userInfo.avatar">{{ userInfo.name ? userInfo.name.charAt(0) : 'A' }}</span>
              </el-avatar>
              <span v-if="!isCollapse">{{ userInfo.name || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
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
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '../stores'
import { useAccountStore } from '../stores/account'
import { User, UserFilled, Document, List, DataAnalysis, Setting, HelpFilled, ArrowLeft, ArrowRight, MoonNight, Sunny } from '@element-plus/icons-vue'

// 状态管理
const settingsStore = useSettingsStore()
const accountStore = useAccountStore()
const route = useRoute()
const router = useRouter()

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

const userInfo = computed(() => {
  return accountStore.userInfo
})

// 方法
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleTheme = () => {
  settingsStore.toggleTheme()
}

const handleProfile = () => {
  // 跳转到个人中心页面
  router.push('/profile')
}

const handleLogout = () => {
  // 调用退出登录方法
  accountStore.logout()
  // 跳转到登录页
  router.push('/login')
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
  // 初始化主题
  settingsStore.initTheme()
  
  // 初始化登录状态
  accountStore.initLoginStatus()
  
  // 检查登录状态
  if (!accountStore.isLoggedIn) {
    router.push('/login')
  }
  
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
  background-color: transparent; /* Use transparent to show liquid background */
  color: var(--text-primary);

  .sidebar {
    background-color: var(--glass-bg); /* Glass effect */
    border-right: 1px solid var(--glass-border);
    transition: width 0.3s ease, background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10;
    margin: 16px 0 16px 16px;
    height: calc(100vh - 32px);
    
    &.collapsed {
      width: 64px;
      
      .logo-text {
        display: none;
      }
      
      .sidebar-header {
        padding: 0;
        justify-content: center;
      }
    }
    
    .sidebar-header {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      .logo {
        width: 32px;
        height: 32px;
        border-radius: 8px;
      }
      
      .logo-text {
        margin-left: 10px;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
      }
    }
    
    .sidebar-menu {
      flex: 1;
      border-right: none;
      background-color: transparent !important;
      
      :deep(.el-menu-item) {
        margin: 4px 8px;
        border-radius: 8px;
        height: 44px;
        line-height: 44px;
        color: var(--text-secondary);
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
        }
        
        &.is-active {
          background-color: var(--accent-color);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
          
          .el-icon {
            color: #ffffff;
          }
        }
        
        .el-icon {
          margin-right: 8px;
          color: var(--text-secondary);
        }
      }
    }
    
    .collapse-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      color: var(--text-secondary);
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--text-primary);
      }
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 16px;
    
    .top-bar {
      height: 60px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 10;
      
      .top-bar-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .current-time {
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
      
      .top-bar-right {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .theme-toggle-button {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          
          &:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
          }
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--text-primary);
          
          &:hover {
            color: var(--accent-color);
          }
        }
      }
    }
    
    .content-area {
      flex: 1;
      padding: 0;
      overflow-y: auto;
      border-radius: var(--border-radius-lg);
      
      /* Hide scrollbar for cleaner look */
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }
    }
  }
}
</style>