<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 注册卡片头部 -->
      <div class="login-header">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20fill%20form%20tool%20logo%2C%20simple%20modern%20design%2C%20blue%20color%20scheme&image_size=square_hd" alt="Logo" class="login-logo" />
        <h1 class="login-title">自动填写工具</h1>
        <p class="login-subtitle">多账号表单自动填写解决方案</p>
        <h2 class="register-title">用户注册</h2>
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
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'

// 状态管理
const settingsStore = useSettingsStore()

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
    
    // 模拟注册请求
    setTimeout(() => {
      // 注册成功后设置用户信息
      accountStore.setUserInfo({
        username: registerForm.username,
        email: registerForm.email,
        phone: registerForm.phone,
        name: registerForm.username
      })
      
      // 保存登录状态
      accountStore.setLoginStatus(true)
      
      // 跳转到首页
      router.push('/account')
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('注册验证失败:', error)
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
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .login-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .login-subtitle {
    font-size: 14px;
    color: #909399;
    margin-bottom: 16px;
  }
  
  .register-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
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
    color: var(--text-color-secondary);
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
    
    .register-title {
      font-size: 16px;
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