<template>
  <div class="login-container">
    <div class="login-card">
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
import { User, Lock, Moon, Sunny } from '@element-plus/icons-vue'
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
          username: result.user.username,
          name: result.user.nickname || result.user.username
        })
        
        // 保存登录状态
        accountStore.setLoginStatus(true)
        
        ElMessage.success('登录成功')
        // 跳转到首页
        router.push('/account')
      } else {
        ElMessage.error(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录异常:', error)
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
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  transition: background-color 0.3s;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-color-white);
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  padding: 32px;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;

  .login-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .login-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin-bottom: 4px;
  }

  .login-subtitle {
    font-size: 14px;
    color: var(--text-color-secondary);
    margin-bottom: 16px;
  }

  .theme-toggle {
    position: absolute;
    top: 16px;
    right: 16px;
  }
}


.login-form {
  margin-bottom: 24px;

  .el-form-item {
    margin-bottom: 16px;
  }
}

.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .forgot-password {
    font-size: 14px;
  }
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
  }
}

.login-footer {
  text-align: center;

  .copyright {
    font-size: 12px;
    color: #C0C4CC;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .login-card {
    margin: 0 16px;
    padding: 24px;
  }

  .login-header {
    .login-logo {
      width: 60px;
      height: 60px;
    }

    .login-title {
      font-size: 18px;
    }
  }
}

/* 动画效果 */
.login-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>