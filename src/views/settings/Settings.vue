<template>
  <div class="settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ $t('settings.title') }}</h2>
    </div>

    <!-- 设置内容 -->
    <div class="settings-container">
      <!-- 通用设置 -->
      <div class="glass-card">
        <h3 class="subtitle">{{ $t('settings.generalSettings') }}</h3>
        <el-form
          :model="generalSettings"
          :rules="generalSettingsRules"
          ref="generalSettingsFormRef"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item :label="$t('settings.language')">
            <el-select v-model="generalSettings.language" @change="handleLanguageChange">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('settings.theme')">
            <el-select v-model="generalSettings.theme" @change="handleThemeChange">
              <el-option :label="$t('settings.themeLight')" value="light" />
              <el-option :label="$t('settings.themeDark')" value="dark" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('settings.fontSize')">
            <el-select v-model="generalSettings.fontSize">
              <el-option :label="$t('settings.fontSizeSmall')" value="small" />
              <el-option :label="$t('settings.fontSizeMedium')" value="medium" />
              <el-option :label="$t('settings.fontSizeLarge')" value="large" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 部署设置 -->
      <div class="glass-card">
        <h3 class="subtitle">{{ $t('settings.deploymentSettings') }}</h3>
        
        <!-- 本地部署设置 -->
        <div class="deployment-section">
          <h4 class="section-title">{{ $t('settings.localDeployment') }}</h4>
          <el-form
            :model="localDeploymentSettings"
            :rules="localDeploymentRules"
            ref="localDeploymentFormRef"
            label-width="120px"
            class="settings-form"
          >
            <el-form-item :label="$t('settings.dataPath')">
              <el-input v-model="localDeploymentSettings.dataPath" :placeholder="$t('settings.dataPathPlaceholder')" />
              <div class="form-tip">{{ $t('settings.dataPathTip') }}</div>
            </el-form-item>
            <el-form-item :label="$t('settings.backupPath')">
              <el-input v-model="localDeploymentSettings.backupPath" :placeholder="$t('settings.backupPathPlaceholder')" />
              <div class="form-tip">{{ $t('settings.backupPathTip') }}</div>
            </el-form-item>
            <el-form-item :label="$t('settings.runPort')">
              <el-input-number
                v-model="localDeploymentSettings.port"
                :min="1024"
                :max="65535"
                :placeholder="$t('settings.portPlaceholder')"
              />
            </el-form-item>
            <el-form-item :label="$t('settings.runStatus')">
              <el-tag type="success">{{ $t('settings.started') }}</el-tag>
            </el-form-item>
          </el-form>
        </div>

        <!-- 线上部署设置（预留） -->
        <div class="deployment-section">
          <div class="section-header">
            <h4 class="section-title">{{ $t('settings.onlineDeployment') }}</h4>
            <el-button size="small" @click="toggleOnlineDeployment">
              {{ onlineDeploymentEnabled ? $t('settings.collapse') : $t('settings.expand') }}
            </el-button>
          </div>
          <div v-if="onlineDeploymentEnabled" class="online-deployment">
            <el-form
              :model="onlineDeploymentSettings"
              :rules="onlineDeploymentRules"
              ref="onlineDeploymentFormRef"
              label-width="120px"
              class="settings-form"
            >
              <el-form-item :label="$t('settings.serverAddress')">
                <el-input v-model="onlineDeploymentSettings.serverAddress" :placeholder="$t('settings.serverAddressPlaceholder')" />
              </el-form-item>
              <el-form-item :label="$t('settings.serverPort')">
                <el-input-number
                  v-model="onlineDeploymentSettings.port"
                  :min="1024"
                  :max="65535"
                  :placeholder="$t('settings.portPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="$t('settings.dbConfig')">
                <div class="database-config">
                  <el-form-item :label="$t('settings.dbHost')" prop="database.host">
                    <el-input v-model="onlineDeploymentSettings.database.host" :placeholder="$t('settings.dbHostPlaceholder')" />
                  </el-form-item>
                  <el-form-item :label="$t('settings.dbPort')" prop="database.port">
                    <el-input-number
                      v-model="onlineDeploymentSettings.database.port"
                      :min="1024"
                      :max="65535"
                      :placeholder="$t('settings.portPlaceholder')"
                    />
                  </el-form-item>
                  <el-form-item :label="$t('settings.dbUser')" prop="database.username">
                    <el-input v-model="onlineDeploymentSettings.database.username" :placeholder="$t('settings.dbUserPlaceholder')" />
                  </el-form-item>
                  <el-form-item :label="$t('settings.dbPassword')" prop="database.password">
                    <el-input
                      v-model="onlineDeploymentSettings.database.password"
                      type="password"
                      :placeholder="$t('settings.dbPasswordPlaceholder')"
                      show-password
                    />
                  </el-form-item>
                </div>
              </el-form-item>
            </el-form>
            <el-alert
              :title="$t('common.warning')"
              type="info"
              :closable="false"
              show-icon
            >
              {{ $t('settings.onlineDeployTip') }}
            </el-alert>
          </div>
        </div>
      </div>

      <!-- 填写设置 -->
      <div class="glass-card">
        <h3 class="subtitle">{{ $t('settings.fillSettings') }}</h3>
        <el-form
          :model="fillSettings"
          :rules="fillSettingsRules"
          ref="fillSettingsFormRef"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item :label="$t('settings.submitInterval')">
            <el-input-number
              v-model="fillSettings.submitInterval"
              :min="1"
              :max="10"
              :step="1"
              :placeholder="$t('settings.intervalPlaceholder')"
            />
            <span class="unit">{{ $t('settings.unitSecond') }}</span>
            <div class="form-tip">{{ $t('settings.intervalTip') }}</div>
          </el-form-item>
          <el-form-item :label="$t('settings.requiredAlert')">
            <el-select v-model="fillSettings.requiredFieldAlert">
              <el-option :label="$t('settings.alertPopup')" value="popup" />
              <el-option :label="$t('settings.alertTooltip')" value="tooltip" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 版本信息 -->
      <div class="glass-card">
        <h3 class="subtitle">{{ $t('settings.versionInfo') }}</h3>
        <div class="version-info">
          <div class="info-item">
            <span class="label">{{ $t('settings.currentVersion') }}</span>
            <span class="value">{{ versionInfo.current }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('settings.latestVersion') }}</span>
            <span class="value">{{ versionInfo.latest }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('settings.updateStatus') }}</span>
            <span class="value" :class="{ 'update-available': versionInfo.updateAvailable }">
              {{ versionInfo.updateAvailable ? $t('settings.updateAvailable') : $t('settings.isLatest') }}
            </span>
          </div>
          <el-button
            type="primary"
            v-if="versionInfo.updateAvailable"
            @click="handleUpdate"
          >
            <el-icon><Download /></el-icon>
            {{ $t('settings.updateNow') }}
          </el-button>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="save-button-container">
        <el-button type="primary" size="large" @click="saveAllSettings">
          <el-icon><Check /></el-icon>
          {{ $t('settings.save') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSettingsStore } from '../../stores'
import { Check, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 状态管理
const settingsStore = useSettingsStore()

// 响应式数据
const onlineDeploymentEnabled = ref(false)

// 通用设置
const generalSettings = reactive({
  language: 'zh-CN',
  theme: 'light',
  fontSize: 'medium'
})

// 通用设置验证规则
const generalSettingsRules = computed(() => ({
  language: [{ required: true, message: t('settings.validation.selectLanguage'), trigger: 'change' }],
  theme: [{ required: true, message: t('settings.validation.selectTheme'), trigger: 'change' }],
  fontSize: [{ required: true, message: t('settings.validation.selectFontSize'), trigger: 'change' }]
}))

// 本地部署设置
const localDeploymentSettings = reactive({
  dataPath: 'C:/AutoFill/data/',
  backupPath: 'C:/AutoFill/backup/',
  port: 3000
})

// 本地部署验证规则
const localDeploymentRules = computed(() => ({
  dataPath: [{ required: true, message: t('settings.validation.inputDataPath'), trigger: 'blur' }],
  backupPath: [{ required: true, message: t('settings.validation.inputBackupPath'), trigger: 'blur' }],
  port: [{ required: true, message: t('settings.validation.inputPort'), trigger: 'blur' }]
}))

// 线上部署设置
const onlineDeploymentSettings = reactive({
  serverAddress: '',
  port: 8080,
  database: {
    host: '',
    port: 3306,
    username: '',
    password: ''
  }
})

// 线上部署验证规则
const onlineDeploymentRules = computed(() => ({
  serverAddress: [{ required: true, message: t('settings.validation.inputServerAddress'), trigger: 'blur' }],
  port: [{ required: true, message: t('settings.validation.inputPort'), trigger: 'blur' }],
  'database.host': [{ required: true, message: t('settings.validation.inputDbHost'), trigger: 'blur' }],
  'database.port': [{ required: true, message: t('settings.validation.inputDbPort'), trigger: 'blur' }],
  'database.username': [{ required: true, message: t('settings.validation.inputDbUser'), trigger: 'blur' }],
  'database.password': [{ required: true, message: t('settings.validation.inputDbPassword'), trigger: 'blur' }]
}))

// 填写设置
const fillSettings = reactive({
  submitInterval: 2,
  requiredFieldAlert: 'popup'
})

// 填写设置验证规则
const fillSettingsRules = computed(() => ({
  submitInterval: [{ required: true, message: t('settings.validation.inputInterval'), trigger: 'blur' }],
  requiredFieldAlert: [{ required: true, message: t('settings.validation.selectAlert'), trigger: 'change' }]
}))

// 版本信息
const versionInfo = reactive({
  current: '1.0.0',
  latest: '1.0.0',
  updateAvailable: false
})

// 表单引用
const generalSettingsFormRef = ref(null)
const localDeploymentFormRef = ref(null)
const onlineDeploymentFormRef = ref(null)
const fillSettingsFormRef = ref(null)

// 方法
// 切换语言
const handleLanguageChange = (val) => {
  locale.value = val
  localStorage.setItem('language', val)
  settingsStore.updateGeneralSettings({ language: val })
  ElMessage.success(t('settings.languageChanged'))
}

// 切换主题
const handleThemeChange = (theme) => {
  // 这里可以添加切换主题的逻辑
  settingsStore.updateGeneralSettings({ theme })
  ElMessage.success(t('settings.themeChanged'))
}

// 切换线上部署设置显示
const toggleOnlineDeployment = () => {
  onlineDeploymentEnabled.value = !onlineDeploymentEnabled.value
}

// 保存所有设置
const saveAllSettings = async () => {
  try {
    // 验证通用设置
    if (generalSettingsFormRef.value) {
      await generalSettingsFormRef.value.validate()
    }
    
    // 验证本地部署设置
    if (localDeploymentFormRef.value) {
      await localDeploymentFormRef.value.validate()
    }
    
    // 验证线上部署设置（如果启用）
    if (onlineDeploymentEnabled.value && onlineDeploymentFormRef.value) {
      await onlineDeploymentFormRef.value.validate()
    }
    
    // 验证填写设置
    if (fillSettingsFormRef.value) {
      await fillSettingsFormRef.value.validate()
    }
    
    // 保存设置
    await settingsStore.updateGeneralSettings(generalSettings)
    await settingsStore.updateLocalDeploymentSettings(localDeploymentSettings)
    await settingsStore.updateFillSettings(fillSettings)
    
    ElMessage.success(t('settings.saveSuccess'))
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// 处理更新
const handleUpdate = () => {
  ElMessage.info(t('settings.updateDev'))
}

// 生命周期
onMounted(() => {
  // 从store中加载设置
  Object.assign(generalSettings, settingsStore.general)
  Object.assign(localDeploymentSettings, settingsStore.deployment.local)
  Object.assign(fillSettings, settingsStore.fill)
  Object.assign(versionInfo, settingsStore.version)
})
</script>

<style scoped lang="scss">
.settings-page {
  .page-header {
    margin-bottom: var(--spacing-lg);
    padding-left: var(--spacing-sm);
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .settings-form {
    margin-top: var(--spacing-md);
  }

  .form-tip {
    font-size: var(--font-size-xs);
    color: var(--text-color-secondary);
    margin-top: var(--spacing-xs);
  }

  .deployment-section {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color-light);

    &:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .section-title {
      font-size: var(--font-size-sm);
      font-weight: 500;
      margin-bottom: var(--spacing-md);
    }

    .database-config {
      margin-left: var(--spacing-md);
    }

    .online-deployment {
      margin-top: var(--spacing-md);
    }
  }

  .unit {
    margin-left: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
  }

  .version-info {
    margin-top: var(--spacing-md);

    .info-item {
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-sm);

      .label {
        font-weight: 500;
        margin-right: var(--spacing-xs);
      }

      .value {
        &.update-available {
          color: var(--primary-color);
          font-weight: 500;
        }
      }
    }
  }

  .save-button-container {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-lg);
  }
}
</style>