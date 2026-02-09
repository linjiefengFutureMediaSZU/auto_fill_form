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
        <h1 class="forget-title">{{ $t('forgetPassword.title') }}</h1>
        <p class="forget-subtitle">{{ $t('forgetPassword.subtitle') }}</p>
      </div>
      
      <!-- 步骤条 -->
      <el-steps :active="activeStep" finish-status="success" align-center class="forget-steps">
        <el-step :title="$t('forgetPassword.step1')" />
        <el-step :title="$t('forgetPassword.step2')" />
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
            :placeholder="$t('forgetPassword.usernamePlaceholder')"
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
            :placeholder="$t('forgetPassword.phonePlaceholder')"
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
            {{ $t('forgetPassword.nextBtn') }}
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
            :placeholder="$t('forgetPassword.passwordPlaceholder')"
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
            :placeholder="$t('forgetPassword.confirmPasswordPlaceholder')"
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
            {{ $t('forgetPassword.resetBtn') }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部链接 -->
      <div class="forget-footer">
        <el-link type="info" @click="goBack">{{ $t('forgetPassword.backToLogin') }}</el-link>
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
const verifyRules = computed(() => ({
  username: [{ required: true, message: t('forgetPassword.validation.usernameRequired'), trigger: 'blur' }],
  phone: [
    { required: true, message: t('forgetPassword.validation.phoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: t('forgetPassword.validation.phoneInvalid'), trigger: 'blur' }
  ]
}))

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error(t('forgetPassword.validation.confirmPasswordRequired')))
  } else if (value !== resetForm.password) {
    callback(new Error(t('forgetPassword.validation.passwordMismatch')))
  } else {
    callback()
  }
}

const resetRules = computed(() => ({
  password: [
    { required: true, message: t('forgetPassword.validation.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('forgetPassword.validation.passwordLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}))

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
      ElMessage.success(t('forgetPassword.successVerify'))
    } else {
      ElMessage.error(result.message || t('forgetPassword.failedVerify'))
    }
  } catch (error) {
    console.error('Verify error:', error)
    // validate throws error on failure
    if (error.message && !error.message.includes('validate')) {
       ElMessage.error(t('forgetPassword.errorVerify'))
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
      ElMessage.success(t('forgetPassword.successReset'))
      router.push('/login')
    } else {
      ElMessage.error(result.message || t('forgetPassword.failedReset'))
    }
  } catch (error) {
    console.error('Reset error:', error)
     if (error.message && !error.message.includes('validate')) {
       ElMessage.error(t('forgetPassword.errorReset'))
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