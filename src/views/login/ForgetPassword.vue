<template>
  <div class="forget-container" :class="{ 'is-dark': isDarkTheme }">
    <!-- Liquid Background Orbs -->
    <div class="liquid-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
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
            确认重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 返回登录 -->
      <div class="forget-footer">
        <el-button link type="info" @click="goBack">
          返回登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeStep = ref(0)
const loading = ref(false)
const userId = ref(null)

// 验证表单
const verifyFormRef = ref(null)
const verifyForm = reactive({
  username: '',
  phone: ''
})

const verifyRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

// 重置密码表单
const resetFormRef = ref(null)
const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

// 验证身份
const handleVerify = async () => {
  if (!verifyFormRef.value) return
  
  try {
    await verifyFormRef.value.validate()
    loading.value = true
    
    const result = await window.electronAPI.auth.verifyReset(
      verifyForm.username,
      verifyForm.phone
    )
    
    if (result.success) {
      userId.value = result.userId
      activeStep.value = 1
      ElMessage.success('验证通过，请设置新密码')
    } else {
      ElMessage.error(result.message || '验证失败')
    }
  } catch (error) {
    console.error('Verify error:', error)
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
.forget-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
  background-image: radial-gradient(var(--el-color-primary-light-9) 2px, transparent 2px);
  background-size: 32px 32px;
}

.forget-card {
  width: 400px;
  padding: 40px;
  background: var(--el-bg-color-overlay);
  border-radius: 16px;
  box-shadow: var(--el-box-shadow-light);
  text-align: center;
}

.forget-header {
  margin-bottom: 30px;
}

.forget-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 10px;
}

.forget-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
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
</style>