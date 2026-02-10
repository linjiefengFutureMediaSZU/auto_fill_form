<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ t('profile.title') }}</h2>
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
            
            <div class="info-actions" style="margin-top: 24px;">
              <el-button type="primary" plain @click="securityDialogVisible = true">
                <el-icon style="margin-right: 4px;"><Lock /></el-icon>
                {{ t('profile.securitySettings') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 账号安全设置弹窗 -->
      <el-dialog
        v-model="securityDialogVisible"
        :title="t('profile.securitySettings')"
        width="500px"
        destroy-on-close
      >
        <el-form
          ref="securityFormRef"
          :model="securitySettings"
          :rules="securitySettingsRules"
          class="security-form"
          label-width="100px"
        >
          <el-form-item :label="t('profile.enablePassword')">
            <el-switch v-model="securitySettings.passwordEnabled" />
          </el-form-item>
          
          <template v-if="securitySettings.passwordEnabled">
            <el-form-item prop="currentPassword" :label="t('login.password')">
              <el-input
                v-model="securitySettings.currentPassword"
                type="password"
                :placeholder="t('profile.enterCurrentPassword')"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="newPassword" :label="t('profile.enterNewPassword')">
              <el-input
                v-model="securitySettings.newPassword"
                type="password"
                :placeholder="t('profile.enterNewPassword')"
                show-password
              />
              <div class="form-tip">{{ t('profile.passwordTip') }}</div>
            </el-form-item>
            
            <el-form-item prop="confirmPassword" :label="t('profile.confirmNewPassword')">
              <el-input
                v-model="securitySettings.confirmPassword"
                type="password"
                :placeholder="t('profile.confirmNewPassword')"
                show-password
              />
            </el-form-item>
          </template>
          
          <el-form-item prop="email" :label="t('profile.email')">
            <el-input
              v-model="securitySettings.email"
              :placeholder="t('profile.enterEmail')"
            />
            <div class="form-tip">{{ t('profile.emailTip') }}</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="securityDialogVisible = false">{{ t('common.cancel') || '取消' }}</el-button>
            <el-button
              type="primary"
              :loading="securityLoading"
              @click="handleSecuritySave"
            >
              {{ t('common.save') || '保存' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 日历/日程卡片 -->
      <div class="calendar-card glass-card">
        <div class="section-header">
          <h3 class="subtitle">日程安排</h3>
          <el-button type="primary" link size="small" @click="openScheduleDialog(new Date())">
            <el-icon><Plus /></el-icon> 新增日程
          </el-button>
        </div>
        <el-calendar v-model="currentDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell" @click.stop="openScheduleDialog(data.date)">
              <div class="cell-date" :class="{ 'is-today': data.isSelected }">
                {{ data.date.getDate() }}
              </div>
              <div class="cell-content">
                <div 
                  v-for="(schedule, index) in getSchedules(data.date)" 
                  :key="index"
                  class="schedule-item"
                  :title="schedule.content"
                >
                  <span class="schedule-dot"></span>
                  <span class="schedule-text">{{ schedule.content }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
      
      <!-- 日程编辑弹窗 -->
      <el-dialog
        v-model="scheduleDialogVisible"
        title="编辑日程"
        width="400px"
      >
        <div class="schedule-date-display">{{ formatDate(selectedDate) }}</div>
        <el-input
          v-model="newScheduleContent"
          type="textarea"
          :rows="3"
          placeholder="请输入日程内容..."
          maxlength="50"
          show-word-limit
        />
        <div class="schedule-list-edit" v-if="selectedDateSchedules.length > 0">
          <div class="schedule-list-title">当日日程：</div>
          <div 
            v-for="(item, index) in selectedDateSchedules" 
            :key="index"
            class="schedule-edit-item"
          >
            <span>{{ item.content }}</span>
            <el-button 
              type="danger" 
              link 
              size="small" 
              @click="deleteSchedule(selectedDate, index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="scheduleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveSchedule">添加</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useAccountStore } from '../../stores/account'
import { Lock, Message, Plus, Delete } from '@element-plus/icons-vue'
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

const securityDialogVisible = ref(false)
const securityLoading = ref(false)
const avatarLoading = ref(false)
const securityFormRef = ref(null)
const fileInput = ref(null)

// 日程相关状态
const currentDate = ref(new Date())
const scheduleDialogVisible = ref(false)
const selectedDate = ref(new Date())
const newScheduleContent = ref('')
// 存储日程数据：key为日期字符串(YYYY-MM-DD)，value为日程数组
const schedules = reactive(JSON.parse(localStorage.getItem('user_schedules') || '{}'))

// 监听日程数据变化，保存到本地存储
watch(schedules, (newVal) => {
  localStorage.setItem('user_schedules', JSON.stringify(newVal))
}, { deep: true })

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
    
    // 关闭弹窗
    securityDialogVisible.value = false
    
  } catch (error) {
    console.error('Failed to save security settings:', error)
    ElMessage.error(error.message || t('profile.saveFail'))
  } finally {
    securityLoading.value = false
  }
}

// 日程相关计算属性和方法
const formatDateKey = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const getSchedules = (date) => {
  const key = formatDateKey(date)
  return schedules[key] || []
}

const selectedDateSchedules = computed(() => {
  return getSchedules(selectedDate.value)
})

const openScheduleDialog = (date) => {
  selectedDate.value = date
  newScheduleContent.value = ''
  scheduleDialogVisible.value = true
}

const saveSchedule = () => {
  if (!newScheduleContent.value.trim()) {
    ElMessage.warning('请输入日程内容')
    return
  }
  
  const key = formatDateKey(selectedDate.value)
  if (!schedules[key]) {
    schedules[key] = []
  }
  
  schedules[key].push({
    content: newScheduleContent.value,
    createdAt: new Date().toISOString()
  })
  
  newScheduleContent.value = ''
  ElMessage.success('添加成功')
}

const deleteSchedule = (date, index) => {
  const key = formatDateKey(date)
  if (schedules[key]) {
    schedules[key].splice(index, 1)
    if (schedules[key].length === 0) {
      delete schedules[key]
    }
  }
}

// 监听用户信息变化，同步到安全设置表单
watch(() => userInfo.value.email, (newVal) => {
  if (newVal) {
    securitySettings.value.email = newVal
  }
}, { immediate: true })

// 生命周期
onMounted(async () => {
  // 组件挂载时的初始化操作
  console.log('Profile page mounted')
  
  // 检查用户信息完整性
  if (!accountStore.userInfo || !accountStore.userInfo.id) {
    ElMessageBox.alert(t('profile.sessionExpired') || '登录状态已失效，请重新登录', t('common.warning'), {
      confirmButtonText: t('login.loginBtn'),
      type: 'warning',
      callback: () => {
        accountStore.logout()
        router.push('/login')
      }
    })
    return
  }

  // 尝试从数据库获取最新用户信息，确保显示的数据是最新的
  const result = await accountStore.fetchUserInfo()
  
  // 如果需要重启，提示用户
  if (result && result.code === 'RESTART_REQUIRED') {
    ElMessage.warning(t('profile.restartRequired') || '系统更新：请重启应用以同步最新数据')
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding-left: var(--spacing-sm);

  .title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 24px;
      background: var(--primary-color);
      border-radius: var(--border-radius-round);
    }
  }
}

.content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 24px;
  flex-wrap: wrap;
}

.info-card {
  flex: 4;
  min-width: 350px;
  padding: 24px;
}

.calendar-card {
  flex: 7;
  min-width: 400px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

/* Calendar Styles */
:deep(.el-calendar) {
  --el-calendar-border: none;
  background: transparent;
}

:deep(.el-calendar__header) {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-calendar__body) {
  padding: 12px 0 0;
  flex: 1;
}

:deep(.el-calendar-table) {
  height: 100%;
}

:deep(.el-calendar-table td) {
  border: none;
  border-radius: var(--border-radius-base);
  transition: all 0.3s;
}

:deep(.el-calendar-table td.is-selected) {
  background-color: var(--primary-color-light-9);
}

:deep(.el-calendar-table td:hover) {
  background-color: var(--fill-color-light);
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 85px;
  padding: 4px;
  
  &:hover {
    background-color: transparent;
  }
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover .cell-date {
    color: var(--primary-color);
  }
}

.cell-date {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &.is-today {
    background-color: var(--primary-color);
    color: white;
  }
}

.cell-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--bg-color-page);
  padding: 2px 4px;
  border-radius: 2px;
  
  .schedule-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--primary-color);
    flex-shrink: 0;
  }
  
  .schedule-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }
}

.schedule-date-display {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.schedule-list-edit {
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.schedule-list-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.schedule-edit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--bg-color-page);
  border-radius: var(--border-radius-base);
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-primary);
  
  &:hover {
    background-color: var(--fill-color-light);
  }
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
  flex-wrap: wrap;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    min-width: 150px;
    flex: 1 0 auto;

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
    flex: 999 1 300px;
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