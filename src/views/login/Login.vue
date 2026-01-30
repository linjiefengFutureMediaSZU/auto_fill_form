<template>
  <div class="login-container" :class="{ 'is-dark': isDarkTheme }">
    <!-- Liquid Background Orbs -->
    <div class="liquid-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="login-card">
      <div class="card-glow"></div>
      <!-- 登录卡片头部 -->
      <div class="login-header">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20fill%20form%20tool%20logo%2C%20simple%20modern%20design%2C%20blue%20color%20scheme&image_size=square_hd" alt="Logo" class="login-logo" />
        <h1 class="login-title">自动填写工具</h1>
        <p class="login-subtitle">多账号表单自动填写解决方案</p>
        <!-- 主题切换按钮 -->
        <div class="theme-toggle">
          <el-button
            type="info"
            circle
            size="small"
            @click="handleThemeToggle"
            :title="isDarkTheme ? '切换到浅色主题' : '切换到深色主题'"
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
            placeholder="请输入用户名"
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
            placeholder="请输入密码"
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
            记住我
          </el-checkbox>
          <el-link type="primary" class="forgot-password" @click="router.push('/forget-password')">忘记密码？</el-link>
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
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="info"
            class="register-button"
            size="large"
            @click="handleRegister"
          >
            注册
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
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 方法
/**
 * 处理登录逻辑
 */
const handleLogin = async () => {
  // 非空校验提示
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入账号和密码')
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
        accountStore.setLoginStatus(true)
        
        ElMessage.success('登录成功')
        // 跳转到首页
        router.push('/account')
      } else {
        // 使用弹窗提示错误（账号不存在或密码错误）
        ElMessageBox.alert(result.message || '登录失败', '登录错误', {
          confirmButtonText: '确定',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('登录异常:', error)
      // 如果是表单校验失败，不需要弹窗，Element Plus 会有红字提示
      if (error && error.username) return 
      ElMessage.error('登录过程中发生错误')
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
  /* Light Mode Variables */
  --bg-base: #f5f5f7;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --accent-color: #007aff;
  
  --orb-1: #a1c4fd; /* Pastel Blue */
  --orb-2: #c2e9fb; /* Light Cyan */
  --orb-3: #ffecd2; /* Light Peach */
  
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(255, 255, 255, 0.6);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  
  --input-bg: rgba(255, 255, 255, 0.5);
  --input-border: transparent;
  --input-text: #1d1d1f;
  --input-placeholder: #86868b;
  --input-focus-border: #007aff;
  --input-focus-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);

  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.5s ease;
}

/* Dark Mode Overrides */
.login-container.is-dark {
  --bg-base: #000000;
  --text-primary: #f5f5f7;
  --text-secondary: #a1a1a6;
  --accent-color: #0a84ff;
  
  /* Deep, vibrant liquid colors for dark mode */
  --orb-1: #2b5876; /* Deep Navy */
  --orb-2: #4e4376; /* Deep Purple */
  --orb-3: #141e30; /* Dark Blue */
  
  --glass-bg: rgba(28, 28, 30, 0.65);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  
  --input-bg: rgba(255, 255, 255, 0.1);
  --input-border: rgba(255, 255, 255, 0.05);
  --input-text: #ffffff;
  --input-placeholder: #86868b;
  --input-focus-border: #0a84ff;
  --input-focus-shadow: 0 0 0 4px rgba(10, 132, 255, 0.25);
}

/* Liquid Background Animation */
.liquid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: var(--bg-base);
  transition: background-color 0.5s ease;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.8;
  animation: float 10s infinite ease-in-out alternate;
  will-change: transform;
}

.orb-1 {
  background: var(--orb-1);
  width: 60vw;
  height: 60vw;
  top: -10%;
  left: -10%;
}

.orb-2 {
  background: var(--orb-2);
  width: 50vw;
  height: 50vw;
  bottom: -10%;
  right: -10%;
  animation-delay: -5s;
}

.orb-3 {
  background: var(--orb-3);
  width: 40vw;
  height: 40vw;
  top: 30%;
  left: 30%;
  animation-delay: -2s;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(30px, 50px) rotate(10deg); }
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
  border-radius: 24px;
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
  border-radius: 18px;
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
  border-radius: 12px;
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
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  background-color: var(--accent-color);
  border: none;
  transition: all 0.2s ease;
  
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
  border-radius: 14px;
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