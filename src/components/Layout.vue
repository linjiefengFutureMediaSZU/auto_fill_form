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
        <span v-if="!isCollapse" class="logo-text">{{ $t('app.title') }}</span>
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
          <template #title>{{ $t('menu.profile') }}</template>
        </el-menu-item>
        <el-menu-item index="/account">
          <el-icon><UserFilled /></el-icon>
          <template #title>{{ $t('menu.account') }}</template>
        </el-menu-item>
        <el-menu-item index="/formList">
          <el-icon><List /></el-icon>
          <template #title>{{ $t('menu.formList') }}</template>
        </el-menu-item>
        <el-menu-item index="/form">
          <el-icon><Document /></el-icon>
          <template #title>{{ $t('menu.fillForm') }}</template>
        </el-menu-item>
        <el-menu-item index="/data">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>{{ $t('menu.data') }}</template>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>{{ $t('menu.settings') }}</template>
        </el-menu-item>
        <el-menu-item index="/help">
          <el-icon><HelpFilled /></el-icon>
          <template #title>{{ $t('menu.help') }}</template>
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
            <el-tag size="small" type="success" effect="dark" round>{{ $t('app.deploymentStatus') }}</el-tag>
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
              <span v-if="!isCollapse">{{ userInfo.name || $t('app.admin') }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">{{ $t('menu.profile') }}</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">{{ $t('menu.logout') }}</el-dropdown-item>
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
import { useI18n } from 'vue-i18n'

// 状态管理
const { t, locale } = useI18n()
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
  currentTime.value = now.toLocaleString(locale.value, {
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
  
  // 初始化登录状态 - 移除此行，因为 Layout 只在登录后加载，调用 initLoginStatus 会重置登录状态
  // accountStore.initLoginStatus()
  
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
    
    /* 折叠状态下的 Logo 样式修正 */
    &.collapsed {
      width: 64px;
      align-items: center; /* 确保所有直接子元素水平居中 */
      
      .logo-text {
        display: none !important;
      }
      
      .sidebar-header {
        padding: 0 !important;
        margin: 0 !important; /* 去除 margin，完全依赖 Flex 居中 */
        justify-content: center;
        width: 44px !important;
        border-bottom: none !important; /* 折叠时去掉分割线，更干净 */
        
        /* 确保 Logo 图片本身也居中 */
        .logo {
          margin: 0 !important;
        }
      }
      
      /* 确保 collapse-btn 在折叠状态下也能正确定位 */
      .collapse-btn {
        margin: 16px 0 !important; /* 去除 auto margin，完全依赖 Flex 居中 */
      }
    }
    
    .sidebar-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 10px;
      padding: 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      .logo {
        width: 32px;
        height: 32px;
        border-radius: var(--border-radius-lg);
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
      width: 100%;
      padding: 0 !important; /* 移除任何默认内边距 */
      margin: 0 !important;
      
      :deep(.el-menu-item) {
        margin: 4px 10px;
        border-radius: var(--border-radius-lg);
        height: 44px;
        line-height: 44px;
        color: var(--text-secondary);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
          transform: translateX(2px);
        }
        
        &.is-active {
          background-color: var(--accent-color);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
          font-weight: 500;
          transform: translateX(2px);
          
          .el-icon {
            color: #ffffff;
          }
        }
        
        .el-icon {
          margin-right: 10px;
          color: var(--text-secondary);
          font-size: 18px;
          transition: margin 0.3s;
        }
      }
      
      /* 折叠状态下的菜单样式 */
      &.el-menu--collapse {
        width: 100%;
        padding: 0 !important;
        display: flex;
        flex-direction: column;
        align-items: center; /* 暴力居中所有子元素 */
        
        :deep(.el-menu-item) {
          margin: 4px 0 !important; /* 不再依赖 auto，由父级控制 */
          padding: 0 !important;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 44px; /* 固定宽度，变成正方形 */
          height: 44px; /* 固定高度，变成正方形 */
          border-radius: var(--border-radius-lg); /* 保持圆角 */
          
          /* 移除可能导致偏移的 transform */
          transform: none !important;
          
          .el-icon {
            margin-right: 0;
            margin-left: 0; /* 确保无左右边距 */
            font-size: 20px;
            /* 确保图标绝对居中 */
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          
          &:hover, &.is-active {
            transform: none !important;
            /* 在折叠状态下，激活样式也要居中 */
            background-color: var(--accent-color);
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
          }
          
          /* 修复折叠时文字可能残留的问题 */
          span, .el-tooltip__trigger {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 0 !important;
          }
        }
      }
    }
    
    .collapse-btn {
      height: 32px;
      width: 32px;
      margin: 16px auto; /* 自动居中 */
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      transition: all 0.3s ease;
      
      &:hover {
        background-color: var(--accent-color);
        color: #ffffff;
        transform: scale(1.1);
        border-color: var(--accent-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .el-icon {
        font-size: 14px;
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
        border-radius: var(--border-radius-md);
      }
    }
  }
}
</style>