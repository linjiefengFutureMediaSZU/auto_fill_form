<template>
  <div class="login-container">
    <!-- Global Liquid Background -->
    <div class="liquid-bg-container">
      <div class="liquid-bg-orb orb-1"></div>
      <div class="liquid-bg-orb orb-2"></div>
      <div class="liquid-bg-orb orb-3"></div>
    </div>

    <div class="login-card">
      <!-- 注册卡片头部 -->
      <div class="login-header">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20fill%20form%20tool%20logo%2C%20simple%20modern%20design%2C%20blue%20color%20scheme&image_size=square_hd" alt="Logo" class="login-logo" />
        <h1 class="login-title">自动填写工具</h1>
        <p class="login-subtitle">多账号表单自动填写解决方案</p>
        <h2 class="register-title">用户注册</h2>
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
      
      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            size="large"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
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
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            class="register-button"
            size="large"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="info"
            class="login-button"
            size="large"
            @click="handleLogin"
          >
            已有账号？去登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 注册卡片底部 -->
      <div class="login-footer">
        <p class="copyright">© 2026 自动填写工具. 保留所有权利.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '../../stores/account'
import { useSettingsStore } from '../../stores/settings'
import { User, Lock, Message, Phone, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
const registerForm = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const registerFormRef = ref(null)

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
/**
 * 处理注册逻辑
 */
const handleRegister = async () => {
  // 表单验证
    if (!registerFormRef.value) return
    
    try {
      await registerFormRef.value.validate()
      loading.value = true
      
      // 调用真实注册接口
      const result = await window.electronAPI.auth.register({
        username: registerForm.username,
        password: registerForm.password,
        nickname: registerForm.username,
        email: registerForm.email,
        phone: registerForm.phone
      })

      if (result.success) {
        ElMessage.success('注册成功，请登录')
        // 跳转到登录页
        router.push('/login')
      } else {
        ElMessage.error(result.message || '注册失败')
      }
    } catch (error) {
      console.error('注册异常:', error)
      ElMessage.error('注册过程中发生错误')
    } finally {
      loading.value = false
    }
}

/**
 * 处理登录跳转
 */
const handleLogin = () => {
  router.push('/login')
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
    width: 100%;
    max-width: 420px;
    background: var(--glass-bg);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-round);
    box-shadow: var(--glass-shadow);
    padding: 40px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
    position: relative;

    .login-logo {
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
      border-radius: var(--border-radius-2xl); /* Slightly more rounded */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }

  .login-subtitle {
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
  
  .register-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 10px;
  }

  .theme-toggle {
    position: absolute;
    top: 0;
    right: 0;
  }
}

/* Element Plus Overrides for Glassmorphism */
:deep(.el-input__wrapper) {
  background-color: var(--input-bg) !important;
  box-shadow: none !important;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius-xl);
  padding: 8px 12px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: var(--input-bg) !important;
  border-color: var(--input-focus-border);
  box-shadow: var(--input-focus-shadow) !important;
}

:deep(.el-input__inner) {
  color: var(--input-text) !important;
  font-size: 15px;
  height: 24px;
}

:deep(.el-input__prefix) {
  color: var(--text-secondary);
}

.login-form {
  margin-bottom: 24px;

  .el-form-item {
    margin-bottom: 20px;
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius-xl);
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid rgba(134, 134, 139, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(134, 134, 139, 0.1);
    color: var(--text-primary);
    transform: translateY(-1px);
  }
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius-xl);
  background: var(--accent-color);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;

  .copyright {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .login-card {
    margin: 0 16px;
    padding: 32px 24px;
  }

  .login-header {
    .login-logo {
      width: 60px;
      height: 60px;
    }

    .login-title {
      font-size: 20px;
    }
    
    .register-title {
      font-size: 18px;
    }
  }
}

/* 动画效果 */
.login-card {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


</style>