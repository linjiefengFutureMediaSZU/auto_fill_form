<template>
  <div class="forget-container">
    <!-- Global Liquid Background -->
    <div class="liquid-bg-container">
      <div class="liquid-bg-orb orb-1"></div>
      <div class="liquid-bg-orb orb-2"></div>
      <div class="liquid-bg-orb orb-3"></div>
    </div>

    <div class="forget-card">
      <!-- 卡片头部 -->
      <div class="forget-header">
        <h1 class="forget-title">重置密码</h1>
        <p class="forget-subtitle">通过验证手机号重置您的密码</p>
      </div>
      
      <!-- 步骤条 -->
      <el-steps :active="activeStep" finish-status="success" align-center class="forget-steps">
        <el-step title="验证身份" />
        <el-step title="重置密码" />
      </el-steps>

      <!-- 步骤 1: 验证身份 -->
      <el-form
        v-if="activeStep === 0"
        ref="verifyFormRef"
        :model="verifyForm"
        :rules="verifyRules"
        class="forget-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="verifyForm.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="phone">
          <el-input
            v-model="verifyForm.phone"
            placeholder="请输入注册手机号"
            size="large"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            class="submit-button"
            size="large"
            :loading="loading"
            @click="handleVerify"
          >
            下一步
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 步骤 2: 重置密码 -->
      <el-form
        v-if="activeStep === 1"
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        class="forget-form"
      >
        <el-form-item prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
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
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
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
            class="submit-button"
            size="large"
            :loading="loading"
            @click="handleReset"
          >
            重置密码
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部链接 -->
      <div class="forget-footer">
        <el-link type="info" @click="goBack">返回登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Iphone, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '../../stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const isDarkTheme = computed(() => settingsStore.general.theme === 'dark')

const activeStep = ref(0)
const loading = ref(false)
const verifyFormRef = ref(null)
const resetFormRef = ref(null)
const userId = ref(null)

// 表单数据
const verifyForm = reactive({
  username: '',
  phone: ''
})

const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

// 验证规则
const verifyRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

// 验证身份
const handleVerify = async () => {
  if (!verifyFormRef.value) return
  
  try {
    await verifyFormRef.value.validate()
    loading.value = true
    
    // 调用验证接口
    const result = await window.electronAPI.auth.verifyUser({
      username: verifyForm.username,
      phone: verifyForm.phone
    })
    
    if (result.success) {
      userId.value = result.userId
      activeStep.value = 1
      ElMessage.success('验证成功，请设置新密码')
    } else {
      ElMessage.error(result.message || '验证失败，用户信息不匹配')
    }
  } catch (error) {
    console.error('Verify error:', error)
    // validate throws error on failure
    if (error.message && !error.message.includes('validate')) {
       ElMessage.error('验证过程中发生错误')
    }
  } finally {
    loading.value = false
  }
}

// 重置密码
const handleReset = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    loading.value = true
    
    const result = await window.electronAPI.auth.resetPassword(
      userId.value,
      resetForm.password
    )
    
    if (result.success) {
      ElMessage.success('密码重置成功，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error(result.message || '重置失败')
    }
  } catch (error) {
    console.error('Reset error:', error)
     if (error.message && !error.message.includes('validate')) {
       ElMessage.error('重置过程中发生错误')
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
/* Apple Style Liquid Design System */
.forget-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.5s ease;
}

.forget-card {
  position: relative;
  z-index: 1;
  width: 400px;
  padding: 40px;
  background: var(--glass-bg);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-round);
  box-shadow: var(--glass-shadow);
  text-align: center;
  transition: all 0.3s ease;
}

.forget-header {
  margin-bottom: 30px;
}

.forget-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}

.forget-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.forget-steps {
  margin-bottom: 30px;
}

.forget-form {
  margin-top: 20px;
}

.submit-button {
  width: 100%;
  margin-top: 10px;
}

.forget-footer {
  margin-top: 20px;
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
}
</style>