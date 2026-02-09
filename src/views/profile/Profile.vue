<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header glass-card">
      <h1 class="page-title">{{ t('profile.title') }}</h1>
      <p class="page-description">{{ t('profile.description') }}</p>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 用户信息卡片 -->
    <div class="info-card glass-card">
      <div class="section-header">
        <h3 class="subtitle">{{ t('profile.basicInfo') }}</h3>
      </div>
      
      <div class="user-info">
          <div class="avatar-section">
            <el-avatar size="large" :src="userAvatar">
              <span v-if="!userAvatar">{{ userInitial }}</span>
            </el-avatar>
            <el-button type="primary" size="small" @click="handleAvatarUpload" :loading="avatarLoading">{{ t('profile.uploadAvatar') }}</el-button>
            <h3 class="user-name">{{ userInfo.nickname || userInfo.username }}</h3>
            <p class="user-role">{{ userInfo.role === 'admin' ? t('profile.admin') : t('profile.user') }}</p>
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
              <div class="info-label">{{ t('profile.username') }}</div>
              <div class="info-value">{{ userInfo.username }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('profile.email') }}</div>
              <div class="info-value" :class="{ unset: !userInfo.email }">{{ userInfo.email || t('profile.notSet') }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('profile.phone') }}</div>
              <div class="info-value" :class="{ unset: !userInfo.phone }">{{ userInfo.phone || t('profile.notSet') }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('profile.registrationTime') }}</div>
              <div class="info-value">{{ registrationTime }}</div>
            </div>
          </div>
        </div>
      </div>
      
      
      
      <!-- 账号安全设置卡片 -->
      <div class="security-card glass-card">
        <div class="section-header">
          <h3 class="subtitle">{{ t('profile.securitySettings') }}</h3>
        </div>
        
        <el-form
          ref="securityFormRef"
          :model="securitySettings"
          :rules="securitySettingsRules"
          class="security-form"
        >
          <el-form-item :label="t('profile.enablePassword')">
            <el-switch v-model="securitySettings.passwordEnabled" />
          </el-form-item>
          
          <el-form-item prop="currentPassword" v-if="securitySettings.passwordEnabled">
            <el-input
              v-model="securitySettings.currentPassword"
              type="password"
              :placeholder="t('profile.enterCurrentPassword')"
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
              :placeholder="t('profile.enterNewPassword')"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">{{ t('profile.passwordTip') }}</div>
          </el-form-item>
          
          <el-form-item prop="confirmPassword" v-if="securitySettings.passwordEnabled">
            <el-input
              v-model="securitySettings.confirmPassword"
              type="password"
              :placeholder="t('profile.confirmNewPassword')"
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
              :placeholder="t('profile.enterEmail')"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">{{ t('profile.emailTip') }}</div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="securityLoading"
              @click="handleSecuritySave"
            >
              {{ t('profile.saveSecuritySettings') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountStore } from '../../stores/account'
import { Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

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
const avatarLoading = ref(false)
const securityFormRef = ref(null)
const fileInput = ref(null)

// 计算属性
const userInfo = computed(() => accountStore.userInfo)

const userInitial = computed(() => {
  if (userInfo.value.nickname) {
    return userInfo.value.nickname.charAt(0).toUpperCase()
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
  if (!userInfo.value.created_at) return '-'
  try {
    const date = new Date(userInfo.value.created_at)
    return date.toLocaleString(locale.value)
  } catch (e) {
    return '-'
  }
})

// 安全设置验证规则 - 改为 computed 以支持国际化切换
const securitySettingsRules = computed(() => ({
  currentPassword: [
    { required: true, message: t('profile.enterCurrentPassword'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('profile.enterNewPassword'), trigger: 'blur' },
    { min: 6, message: t('profile.passwordLengthTip'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('profile.confirmNewPassword'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== securitySettings.value.newPassword) {
          callback(new Error(t('profile.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: t('profile.enterEmail'), trigger: 'blur' },
    { type: 'email', message: t('profile.invalidEmail'), trigger: 'blur' }
  ]
}))

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
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件大小（限制为2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error(t('profile.avatarSizeLimit'))
    return
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error(t('profile.imageOnly'))
    return
  }
  
  avatarLoading.value = true
  // 读取文件并转换为 base64 发送给 Electron
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64Data = e.target.result
      await accountStore.updateAvatar(base64Data)
      ElMessage.success(t('profile.avatarSuccess'))
    } catch (error) {
      ElMessage.error(t('profile.avatarFail') + ': ' + error.message)
    } finally {
      avatarLoading.value = false
    }
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
    
    // 调用真实更新接口
    const updateData = {
      email: securitySettings.value.email
    }
    
    // 如果启用了密码修改，这里可以扩展逻辑，目前先处理基本资料
    await accountStore.updateProfile(updateData)
    
    ElMessage.success(t('profile.securitySaveSuccess'))
    
    // 重置密码相关字段
    securitySettings.value.currentPassword = ''
    securitySettings.value.newPassword = ''
    securitySettings.value.confirmPassword = ''
    
  } catch (error) {
    console.error('Failed to save security settings:', error)
    ElMessage.error(error.message || t('profile.saveFail'))
  } finally {
    securityLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 组件挂载时的初始化操作
  console.log('Profile page mounted')
  // 从用户信息中设置邮箱
  if (userInfo.value.email) {
    securitySettings.value.email = userInfo.value.email
  }
})
</script>

<style scoped lang="scss">
.profile-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 32px;
  padding: 24px;
  border-radius: var(--border-radius-xl);

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
  padding: 24px;
}

.security-card {
  max-width: 600px;
  padding: 24px;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.subtitle {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0;
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
      color: var(--text-primary);
    }

    .user-role {
      font-size: 14px;
      color: var(--text-secondary);
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
      background-color: var(--input-bg);
      border-radius: var(--border-radius-lg);
      transition: all 0.3s ease;

      &:hover {
        background-color: color-mix(in srgb, var(--accent-color), transparent 90%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .info-label {
        width: 100px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      .info-value {
        flex: 1;
        font-size: 14px;
        color: var(--text-primary);
        word-break: break-all;
        font-weight: 500;

        &.unset {
          color: var(--text-secondary);
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
  color: var(--text-color-secondary);
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