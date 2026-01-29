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
            <div class="header-actions">
              <el-button v-if="!isEditing" type="primary" link @click="startEdit">
                <el-icon class="el-icon--left"><Edit /></el-icon>编辑资料
              </el-button>
              <template v-else>
                <el-button type="info" link @click="cancelEdit">取消</el-button>
                <el-button type="primary" link @click="saveProfile" :loading="saveLoading">保存</el-button>
              </template>
            </div>
          </div>
        </template>
        
        <div class="user-info">
          <div class="avatar-section">
            <el-avatar size="large" :src="userAvatar" class="profile-avatar">
              <span v-if="!userAvatar">{{ userInitial }}</span>
            </el-avatar>
            <div class="avatar-actions">
              <el-button type="primary" size="small" @click="handleAvatarUpload" :loading="avatarLoading">更换头像</el-button>
            </div>
            <h3 class="user-name">{{ userInfo.nickname || userInfo.username }}</h3>
            <p class="user-role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />
          
          <div class="info-section">
            <el-form
              ref="profileFormRef"
              :model="editForm"
              :rules="profileRules"
              label-position="right"
              label-width="80px"
              class="profile-form"
              :disabled="!isEditing"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username" placeholder="请输入用户名" />
              </el-form-item>
              
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              
              <el-form-item label="注册时间">
                <span class="static-value">{{ registrationTime }}</span>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>
      
      <!-- 账号安全设置卡片 -->
      <el-card class="security-card">
        <template #header>
          <div class="card-header">
            <span>修改密码</span>
          </div>
        </template>
        
        <el-form
          ref="securityFormRef"
          :model="securitySettings"
          :rules="securitySettingsRules"
          class="security-form"
          label-position="top"
        >
          <el-form-item label="当前密码" prop="currentPassword">
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
          
          <el-form-item label="新密码" prop="newPassword">
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
          
          <el-form-item label="确认新密码" prop="confirmPassword">
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
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="securityLoading"
              @click="handlePasswordChange"
              style="width: 100%"
            >
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useAccountStore } from '../../stores/account'
import { Lock, Message, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 状态管理
const accountStore = useAccountStore()

// 响应式数据
const isEditing = ref(false)
const saveLoading = ref(false)
const avatarLoading = ref(false)
const securityLoading = ref(false)

const fileInput = ref(null)
const profileFormRef = ref(null)
const securityFormRef = ref(null)

// 编辑表单数据
const editForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: ''
})

// 安全设置数据
const securitySettings = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

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
  return userInfo.value.avatar || ''
})

const registrationTime = computed(() => {
  if (!userInfo.value.created_at) return '-'
  const date = new Date(userInfo.value.created_at)
  return date.toLocaleString('zh-CN')
})

// 验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

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
        if (value !== securitySettings.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 监听用户信息变化，同步到编辑表单
watch(userInfo, (newVal) => {
  if (!isEditing.value) {
    syncUserInfoToForm()
  }
}, { deep: true, immediate: true })

// 方法
function syncUserInfoToForm() {
  editForm.username = userInfo.value.username || ''
  editForm.nickname = userInfo.value.nickname || ''
  editForm.phone = userInfo.value.phone || ''
  editForm.email = userInfo.value.email || ''
}

const startEdit = () => {
  syncUserInfoToForm()
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  syncUserInfoToForm()
  // 清除校验结果
  if (profileFormRef.value) {
    profileFormRef.value.clearValidate()
  }
}

/**
 * 保存个人资料
 */
const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    saveLoading.value = true
    
    const updateData = {
      username: editForm.username,
      nickname: editForm.nickname,
      phone: editForm.phone,
      email: editForm.email
    }
    
    // 调用更新接口
    const result = await window.electronAPI.auth.updateProfile(userInfo.value.id, updateData)
    
    if (result.success) {
      // 更新本地 Store
      accountStore.setUserInfo({ ...userInfo.value, ...result.user })
      ElMessage.success('个人资料更新成功')
      isEditing.value = false
    } else {
      ElMessage.error(result.message || '更新失败')
    }
  } catch (error) {
    console.error('保存资料失败:', error)
    if (error && !error.username) { // 忽略表单验证错误
       ElMessage.error('保存失败')
    }
  } finally {
    saveLoading.value = false
  }
}

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
    ElMessage.error('头像文件大小不能超过2MB')
    return
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  avatarLoading.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64Data = e.target.result
      await accountStore.updateAvatar(base64Data)
      ElMessage.success('头像上传成功')
    } catch (error) {
      ElMessage.error('头像上传失败: ' + error.message)
    } finally {
      avatarLoading.value = false
    }
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

/**
 * 修改密码
 */
const handlePasswordChange = async () => {
  if (!securityFormRef.value) return
  
  try {
    await securityFormRef.value.validate()
    securityLoading.value = true
    
    const result = await window.electronAPI.auth.changePassword(
      userInfo.value.id,
      securitySettings.currentPassword,
      securitySettings.newPassword
    )
    
    if (result.success) {
      ElMessage.success('密码修改成功，请牢记新密码')
      // 清空表单
      securityFormRef.value.resetFields()
    } else {
      ElMessage.error(result.message)
    }
    
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    securityLoading.value = false
  }
}
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
  align-items: flex-start;
}

.info-card {
  flex: 2;
  min-width: 400px;
}

.security-card {
  flex: 1;
  min-width: 300px;
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
    padding-top: 10px;

    .profile-avatar {
      font-size: 32px;
      background-color: var(--el-color-primary-light-8);
      color: var(--el-color-primary);
    }

    .user-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color-primary);
      text-align: center;
    }

    .user-role {
      font-size: 14px;
      color: var(--text-color-secondary);
      background-color: var(--el-fill-color-light);
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .info-section {
    flex: 1;
    min-width: 300px;
  }
}

.profile-form {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    border-bottom: 1px solid var(--border-color);
    border-radius: 0;
    padding-left: 0;
    
    &.is-focus {
      box-shadow: 0 1px 0 0 var(--el-color-primary);
    }
  }
  
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}

/* 当非编辑模式时，Input 看起来像纯文本 */
.profile-form.el-form--disabled {
  :deep(.el-input__wrapper) {
    background-color: transparent;
    border-bottom: 1px solid transparent;
    cursor: default;
    
    .el-input__inner {
      color: var(--text-color-primary);
      cursor: default;
      -webkit-text-fill-color: var(--text-color-primary); /* 覆盖禁用状态的灰色 */
    }
  }
}

.static-value {
  padding-left: 0;
  color: var(--text-color-regular);
}

.security-form {
  padding: 10px 0;
}

.form-tip {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

/* 响应式布局 */
@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .info-card, .security-card {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .user-info {
    flex-direction: column;
    align-items: center;
    gap: 24px;

    .avatar-section {
      width: 100%;
      border-bottom: 1px solid var(--border-color-lighter);
      padding-bottom: 24px;
    }

    .info-section {
      width: 100%;
    }
  }
}
</style>