<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 用户信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        
        <div class="user-info">
          <div class="avatar-section">
            <el-avatar size="large" :src="userAvatar">
              <span v-if="!userAvatar">{{ userInitial }}</span>
            </el-avatar>
            <el-button type="primary" size="small" @click="handleAvatarUpload">上传头像</el-button>
            <h3 class="user-name">{{ userInfo.name || userInfo.username }}</h3>
            <p class="user-role">普通用户</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />
          
          <div class="info-section">
            <div class="info-item">
              <div class="info-label">用户名</div>
              <div class="info-value">{{ userInfo.username }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">邮箱</div>
              <div class="info-value" :class="{ unset: !userInfo.email }">{{ userInfo.email || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">手机号</div>
              <div class="info-value" :class="{ unset: !userInfo.phone }">{{ userInfo.phone || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">注册时间</div>
              <div class="info-value">{{ registrationTime }}</div>
            </div>
          </div>
        </div>
      </el-card>
      

      
      <!-- 账号安全设置卡片 -->
      <el-card class="security-card">
        <template #header>
          <div class="card-header">
            <span>账号安全设置</span>
          </div>
        </template>
        
        <el-form
          ref="securityFormRef"
          :model="securitySettings"
          :rules="securitySettingsRules"
          class="security-form"
        >
          <el-form-item label="启用密码">
            <el-switch v-model="securitySettings.passwordEnabled" />
          </el-form-item>
          
          <el-form-item prop="currentPassword" v-if="securitySettings.passwordEnabled">
            <el-input
              v-model="securitySettings.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="newPassword" v-if="securitySettings.passwordEnabled">
            <el-input
              v-model="securitySettings.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">密码长度至少6位</div>
          </el-form-item>
          
          <el-form-item prop="confirmPassword" v-if="securitySettings.passwordEnabled">
            <el-input
              v-model="securitySettings.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="securitySettings.email"
              placeholder="请输入邮箱地址"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">用于找回密码</div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="securityLoading"
              @click="handleSecuritySave"
            >
              保存安全设置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountStore } from '../../stores/account'
import { Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 状态管理
const accountStore = useAccountStore()

// 响应式数据
// 安全设置
const securitySettings = ref({
  passwordEnabled: true,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  email: ''
})

const securityLoading = ref(false)
const securityFormRef = ref(null)
const fileInput = ref(null)

// 计算属性
const userInfo = computed(() => accountStore.userInfo)

const userInitial = computed(() => {
  if (userInfo.value.name) {
    return userInfo.value.name.charAt(0).toUpperCase()
  } else if (userInfo.value.username) {
    return userInfo.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

const userAvatar = computed(() => {
  // 从用户信息中获取头像URL
  return userInfo.value.avatar || ''
})

const registrationTime = computed(() => {
  // 模拟注册时间
  return '2026-01-26 16:00:00'
})

// 安全设置验证规则
const securitySettingsRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== securitySettings.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 方法
/**
 * 处理头像上传
 */
const handleAvatarUpload = () => {
  fileInput.value.click()
}

/**
 * 处理文件选择
 */
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件大小（限制为2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('头像文件大小不能超过2MB')
    return
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  // 读取文件并显示预览
  const reader = new FileReader()
  reader.onload = (e) => {
    const avatarUrl = e.target.result
    
    // 更新用户信息中的头像
    accountStore.setUserInfo({
      ...userInfo.value,
      avatar: avatarUrl
    })
    
    ElMessage.success('头像上传成功')
  }
  reader.readAsDataURL(file)
  
  // 重置文件输入，以便可以重复选择同一个文件
  event.target.value = ''
}

/**
 * 处理账号安全设置保存
 */
const handleSecuritySave = async () => {
  if (!securityFormRef.value) return
  
  try {
    await securityFormRef.value.validate()
    securityLoading.value = true
    
    // 模拟保存请求
    setTimeout(() => {
      // 保存成功
      ElMessage({
        message: '安全设置保存成功',
        type: 'success'
      })
      
      // 更新用户信息中的邮箱
      accountStore.setUserInfo({
        ...userInfo.value,
        email: securitySettings.value.email
      })
      
      // 重置表单
      if (securitySettings.value.passwordEnabled) {
        securitySettings.value = {
          ...securitySettings.value,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }
      
      securityLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('安全设置验证失败:', error)
    securityLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化操作
  console.log('个人中心页面挂载')
  // 从用户信息中设置邮箱
  if (userInfo.value.email) {
    securitySettings.value.email = userInfo.value.email
  }
})
</script>

<style scoped lang="scss">
.profile-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin-bottom: 8px;
  }

  .page-description {
    font-size: 14px;
    color: var(--text-color-secondary);
  }
}

.content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 24px;
  flex-wrap: wrap;
}

.info-card {
  max-width: 800px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.user-info {
  display: flex;
  gap: 48px;
  padding: 16px 0;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    min-width: 150px;

    .user-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .user-role {
      font-size: 14px;
      color: #909399;
    }
  }

  .info-section {
    flex: 1;
    min-width: 300px;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f9f9f9;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f0f9eb;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .info-label {
        width: 100px;
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }

      .info-value {
        flex: 1;
        font-size: 14px;
        color: #303133;
        word-break: break-all;
        font-weight: 500;

        &.unset {
          color: #909399;
          font-style: italic;
          font-weight: normal;
        }
      }
    }
  }
}

.password-card {
  max-width: 600px;
}

.password-form {
  padding: 16px 0;

  .el-form-item {
    margin-bottom: 20px;
  }
}

.security-card {
  max-width: 600px;
}

.security-form {
  padding: 16px 0;

  .el-form-item {
    margin-bottom: 20px;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .content-wrapper {
    flex-direction: column;
  }

  .user-info {
    flex-direction: column;
    align-items: center;
    gap: 24px;

    .avatar-section {
      text-align: center;
    }

    .info-section {
      width: 100%;
    }
  }
}
</style>