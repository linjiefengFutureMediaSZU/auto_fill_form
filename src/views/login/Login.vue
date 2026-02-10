<template>
  <div class="login-container">
    <!-- Global Liquid Background -->
    <div class="liquid-bg-container">
      <div class="liquid-bg-orb orb-1"></div>
      <div class="liquid-bg-orb orb-2"></div>
      <div class="liquid-bg-orb orb-3"></div>
    </div>

    <div class="login-card">
      <div class="card-glow"></div>
      <!-- 登录卡片头部 -->
      <div class="login-header">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20fill%20form%20tool%20logo%2C%20simple%20modern%20design%2C%20blue%20color%20scheme&image_size=square_hd" alt="Logo" class="login-logo" />
        <h1 class="login-title">{{ $t('login.title') }}</h1>
        <p class="login-subtitle">{{ $t('login.subtitle') }}</p>
        <!-- 主题切换按钮 -->
        <div class="theme-toggle">
          <el-button
            type="info"
            circle
            size="small"
            @click="handleThemeToggle"
            :title="isDarkTheme ? $t('login.themeLight') : $t('login.themeDark')"
          >
            <el-icon v-if="isDarkTheme"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('login.usernamePlaceholder')"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('login.passwordPlaceholder')"
            show-password
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item class="remember-me">
          <el-checkbox v-model="loginForm.remember">
            {{ $t('login.rememberMe') }}
          </el-checkbox>
          <el-link type="primary" class="forgot-password" @click="router.push('/forget-password')">{{ $t('login.forgotPassword') }}</el-link>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            class="login-button"
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            {{ $t('login.loginBtn') }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="info"
            class="register-button"
            size="large"
            @click="handleRegister"
          >
            {{ $t('login.registerBtn') }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 登录卡片底部 -->
      <div class="login-footer">
        <p class="copyright">© 2026 Qilin Culture Media Co., Ltd. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '../../stores/account'
import { useSettingsStore } from '../../stores/settings'
import { User, Lock, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 状态管理
const settingsStore = useSettingsStore()

// 计算属性
const isDarkTheme = computed(() => {
  return settingsStore.general.theme === 'dark'
})

// 方法
/**
 * 切换主题
 */
const handleThemeToggle = () => {
  settingsStore.toggleTheme()
}

// 状态管理
const accountStore = useAccountStore()
const router = useRouter()

// 响应式数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)
const loginFormRef = ref(null)

// 表单验证规则
const rules = {
  username: [
    { required: true, message: computed(() => t('login.usernamePlaceholder')), trigger: 'blur' }
  ],
  password: [
    { required: true, message: computed(() => t('login.passwordPlaceholder')), trigger: 'blur' }
  ]
}

// 方法
/**
 * 处理登录逻辑
 */
const handleLogin = async () => {
  // 非空校验提示
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning(t('login.inputRequired'))
    return
  }

  // 表单验证
    if (!loginFormRef.value) return
    
    try {
      await loginFormRef.value.validate()
      loading.value = true
      
      // 调用真实登录接口
      const result = await window.electronAPI.auth.login({
        account: loginForm.username, // 这里的 username 字段实际作为 account (用户名或手机号)
        password: loginForm.password
      })

      if (result.success) {
        // 登录成功后设置用户信息
        accountStore.setUserInfo({
          ...result.user, // 确保包含 email, phone, created_at 等所有字段
          name: result.user.nickname || result.user.username
        })
        
        // 保存登录状态
        accountStore.setLoginStatus(true, loginForm.remember)
        
        ElMessage.success(t('login.success'))
        // 跳转到首页
        router.push('/account')
      } else {
        // 使用弹窗提示错误（账号不存在或密码错误）
        ElMessageBox.alert(result.message || t('login.failed'), t('common.error'), {
          confirmButtonText: t('common.confirm'),
          type: 'error'
        })
      }
    } catch (error) {
      console.error('登录异常:', error)
      // 如果是表单校验失败，不需要弹窗，Element Plus 会有红字提示
      if (error && error.username) return 
      ElMessage.error(t('common.error'))
    } finally {
      loading.value = false
    }
}

/**
 * 处理注册跳转
 */
const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="scss">
/* Apple Style Liquid Design System */
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.5s ease;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 48px;
  background: var(--glass-bg);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-round);
  box-shadow: var(--glass-shadow);
  text-align: center;
  transition: all 0.3s ease;
}

.login-header {
  margin-bottom: 32px;
  position: relative;
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-2xl);
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.theme-toggle {
  position: absolute;
  top: -10px;
  right: -10px;
}

/* Input Styles Overrides */
:deep(.el-input__wrapper) {
  background-color: var(--input-bg) !important;
  box-shadow: none !important;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius-xl);
  padding: 8px 16px;
  transition: all 0.2s ease;
  
  &.is-focus {
    background-color: var(--glass-bg) !important;
    border-color: var(--input-focus-border) !important;
    box-shadow: var(--input-focus-shadow) !important;
  }
  
  &:hover:not(.is-focus) {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}

:deep(.el-input__inner) {
  color: var(--input-text) !important;
  height: 44px;
  font-size: 16px;
  
  &::placeholder {
    color: var(--input-placeholder);
  }
}

.remember-me {
  margin-bottom: 24px;
  
  :deep(.el-form-item__content) {
    justify-content: space-between;
  }
  
  :deep(.el-checkbox__label) {
    color: var(--text-secondary);
  }
}

.forgot-password {
  font-size: 14px;
  color: var(--accent-color);
  
  &:hover {
    opacity: 0.8;
  }
}

.login-button {
  width: 100%;
  height: 50px;
  border-radius: var(--border-radius-xl);
  font-size: 17px;
  font-weight: 600;
  background-color: var(--accent-color);
  border: none;
  transition: all 0.2s ease;
  
  &.is-loading {
    opacity: 0.8;
  }
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.register-button {
  width: 100%;
  height: 50px;
  border-radius: var(--border-radius-xl);
  font-size: 17px;
  font-weight: 600;
  background-color: transparent;
  border: 1px solid var(--text-secondary);
  color: var(--text-secondary);
  margin-top: -10px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: var(--text-primary);
    color: var(--text-primary);
  }
}

.login-footer {
  margin-top: 32px;
  
  .copyright {
    font-size: 12px;
    color: var(--text-secondary);
    opacity: 0.8;
  }
}
</style>
