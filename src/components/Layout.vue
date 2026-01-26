<template>
  <div class="app-container">
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
        :background-color="isDarkTheme ? '#242424' : '#f5f7fa'"
        :text-color="isDarkTheme ? '#e0e0e0' : '#303133'"
        :active-text-color="'#409EFF'"
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
      <el-header class="top-bar">
        <div class="top-bar-left">
          <span class="current-time">{{ currentTime }}</span>
          <span class="deployment-status">
            <el-tag size="small" type="success">本地部署已启动</el-tag>
          </span>
        </div>
        <div class="top-bar-right">
          <el-button 
            type="primary" 
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
  background-color: var(--bg-color);
  color: var(--text-color-primary);



  .sidebar {
    background-color: var(--bg-color);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    
    .sidebar-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border-bottom: 1px solid var(--border-color);
      
      .logo {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      
      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-color);
        white-space: nowrap;
      }
    }
    
    .sidebar-menu {
      flex: 1;
      border-right: none;
      
      &:not(.el-menu--collapse) {
        width: 200px;
      }
    }
    
    .collapse-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid var(--border-color);
      cursor: pointer;
      color: var(--text-color-secondary);
      
      &:hover {
        background-color: var(--bg-color-light);
        color: var(--primary-color);
      }
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--bg-color);
    
    .top-bar {
      height: 60px;
      background-color: var(--bg-color-white);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      
      .top-bar-left {
        display: flex;
        align-items: center;
        
        .current-time {
          margin-right: 16px;
          color: var(--text-color-regular);
          font-size: 14px;
        }
      }
      
      .top-bar-right {
        display: flex;
        align-items: center;
        
        .theme-toggle-button {
          margin-right: 16px;
          
          &.dark-theme {
            background-color: #333;
            border-color: #444;
            color: #FFD700;
            
            &:hover {
              background-color: #444;
            }
          }
        }
        
        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;
          color: var(--text-color-primary);
          
          .el-avatar {
            margin-right: 8px;
          }
        }
      }
    }
    
    .content-area {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background-color: var(--bg-color);
    }
  }
}
</style>
