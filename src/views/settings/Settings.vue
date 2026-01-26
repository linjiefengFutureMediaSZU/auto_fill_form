<template>
  <div class="settings-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">基础设置</h2>
    </div>

    <!-- 设置内容 -->
    <div class="settings-container">
      <!-- 通用设置 -->
      <div class="card">
        <h3 class="subtitle">通用设置</h3>
        <el-form
          :model="generalSettings"
          :rules="generalSettingsRules"
          ref="generalSettingsFormRef"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="界面语言">
            <el-select v-model="generalSettings.language" disabled>
              <el-option label="中文" value="zh-CN" />
            </el-select>
            <div class="form-tip">当前仅支持中文</div>
          </el-form-item>
          <el-form-item label="界面主题">
            <el-select v-model="generalSettings.theme" @change="handleThemeChange">
              <el-option label="浅色主题" value="light" />
              <el-option label="深色主题" value="dark" />
            </el-select>
          </el-form-item>
          <el-form-item label="字体大小">
            <el-select v-model="generalSettings.fontSize">
              <el-option label="小" value="small" />
              <el-option label="中" value="medium" />
              <el-option label="大" value="large" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 部署设置 -->
      <div class="card">
        <h3 class="subtitle">部署设置</h3>
        
        <!-- 本地部署设置 -->
        <div class="deployment-section">
          <h4 class="section-title">本地部署</h4>
          <el-form
            :model="localDeploymentSettings"
            :rules="localDeploymentRules"
            ref="localDeploymentFormRef"
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="数据存储路径">
              <el-input v-model="localDeploymentSettings.dataPath" placeholder="请输入数据存储路径" />
              <div class="form-tip">本地数据文件的存储位置</div>
            </el-form-item>
            <el-form-item label="备份路径">
              <el-input v-model="localDeploymentSettings.backupPath" placeholder="请输入备份路径" />
              <div class="form-tip">备份文件的存储位置</div>
            </el-form-item>
            <el-form-item label="运行端口">
              <el-input-number
                v-model="localDeploymentSettings.port"
                :min="1024"
                :max="65535"
                placeholder="请输入端口号"
              />
            </el-form-item>
            <el-form-item label="运行状态">
              <el-tag type="success">已启动</el-tag>
            </el-form-item>
          </el-form>
        </div>

        <!-- 线上部署设置（预留） -->
        <div class="deployment-section">
          <div class="section-header">
            <h4 class="section-title">线上部署（预留）</h4>
            <el-button size="small" @click="toggleOnlineDeployment">
              {{ onlineDeploymentEnabled ? '收起' : '展开' }}
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
              <el-form-item label="服务器地址">
                <el-input v-model="onlineDeploymentSettings.serverAddress" placeholder="请输入服务器地址" />
              </el-form-item>
              <el-form-item label="服务器端口">
                <el-input-number
                  v-model="onlineDeploymentSettings.port"
                  :min="1024"
                  :max="65535"
                  placeholder="请输入端口号"
                />
              </el-form-item>
              <el-form-item label="数据库配置">
                <div class="database-config">
                  <el-form-item label="主机" prop="database.host">
                    <el-input v-model="onlineDeploymentSettings.database.host" placeholder="请输入数据库主机" />
                  </el-form-item>
                  <el-form-item label="端口" prop="database.port">
                    <el-input-number
                      v-model="onlineDeploymentSettings.database.port"
                      :min="1024"
                      :max="65535"
                      placeholder="请输入端口号"
                    />
                  </el-form-item>
                  <el-form-item label="用户名" prop="database.username">
                    <el-input v-model="onlineDeploymentSettings.database.username" placeholder="请输入数据库用户名" />
                  </el-form-item>
                  <el-form-item label="密码" prop="database.password">
                    <el-input
                      v-model="onlineDeploymentSettings.database.password"
                      type="password"
                      placeholder="请输入数据库密码"
                      show-password
                    />
                  </el-form-item>
                </div>
              </el-form-item>
            </el-form>
            <el-alert
              title="提示"
              type="info"
              :closable="false"
              show-icon
            >
              线上部署功能暂未启用，仅用于后续配置
            </el-alert>
          </div>
        </div>
      </div>

      <!-- 填写设置 -->
      <div class="card">
        <h3 class="subtitle">填写设置</h3>
        <el-form
          :model="fillSettings"
          :rules="fillSettingsRules"
          ref="fillSettingsFormRef"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="提交间隔">
            <el-input-number
              v-model="fillSettings.submitInterval"
              :min="1"
              :max="10"
              :step="1"
              placeholder="请输入间隔时间"
            />
            <span class="unit">秒</span>
            <div class="form-tip">避免触发表单反爬</div>
          </el-form-item>
          <el-form-item label="必填字段提醒">
            <el-select v-model="fillSettings.requiredFieldAlert">
              <el-option label="弹窗提醒" value="popup" />
              <el-option label="提示框" value="tooltip" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 版本信息 -->
      <div class="card">
        <h3 class="subtitle">版本信息</h3>
        <div class="version-info">
          <div class="info-item">
            <span class="label">当前版本：</span>
            <span class="value">{{ versionInfo.current }}</span>
          </div>
          <div class="info-item">
            <span class="label">最新版本：</span>
            <span class="value">{{ versionInfo.latest }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新状态：</span>
            <span class="value" :class="{ 'update-available': versionInfo.updateAvailable }">
              {{ versionInfo.updateAvailable ? '有新版本可用' : '当前为最新版本' }}
            </span>
          </div>
          <el-button
            type="primary"
            v-if="versionInfo.updateAvailable"
            @click="handleUpdate"
          >
            <el-icon><Download /></el-icon>
            立即更新
          </el-button>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="save-button-container">
        <el-button type="primary" size="large" @click="saveAllSettings">
          <el-icon><Check /></el-icon>
          保存所有设置
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

// 状态管理
const settingsStore = useSettingsStore()

// 计算属性
const isDarkTheme = computed(() => {
  return settingsStore.general.theme === 'dark'
})

// 响应式数据
const onlineDeploymentEnabled = ref(false)

// 通用设置
const generalSettings = reactive({
  language: 'zh-CN',
  theme: 'light',
  fontSize: 'medium'
})

// 通用设置验证规则
const generalSettingsRules = {
  language: [{ required: true, message: '请选择语言', trigger: 'change' }],
  theme: [{ required: true, message: '请选择主题', trigger: 'change' }],
  fontSize: [{ required: true, message: '请选择字体大小', trigger: 'change' }]
}

// 本地部署设置
const localDeploymentSettings = reactive({
  dataPath: 'C:/AutoFill/data/',
  backupPath: 'C:/AutoFill/backup/',
  port: 3000
})

// 本地部署验证规则
const localDeploymentRules = {
  dataPath: [{ required: true, message: '请输入数据存储路径', trigger: 'blur' }],
  backupPath: [{ required: true, message: '请输入备份路径', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }]
}

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
const onlineDeploymentRules = {
  serverAddress: [{ required: true, message: '请输入服务器地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  'database.host': [{ required: true, message: '请输入数据库主机', trigger: 'blur' }],
  'database.port': [{ required: true, message: '请输入数据库端口', trigger: 'blur' }],
  'database.username': [{ required: true, message: '请输入数据库用户名', trigger: 'blur' }],
  'database.password': [{ required: true, message: '请输入数据库密码', trigger: 'blur' }]
}

// 填写设置
const fillSettings = reactive({
  submitInterval: 2,
  requiredFieldAlert: 'popup'
})

// 填写设置验证规则
const fillSettingsRules = {
  submitInterval: [{ required: true, message: '请输入提交间隔', trigger: 'blur' }],
  requiredFieldAlert: [{ required: true, message: '请选择提醒方式', trigger: 'change' }]
}

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
// 切换主题
const handleThemeChange = (theme) => {
  // 这里可以添加切换主题的逻辑
  settingsStore.updateGeneralSettings({ theme })
  ElMessage.success('主题已切换，需重启应用生效')
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
    settingsStore.updateGeneralSettings(generalSettings)
    settingsStore.updateLocalDeploymentSettings(localDeploymentSettings)
    settingsStore.updateFillSettings(fillSettings)
    
    ElMessage.success('设置已保存，部分设置需重启应用生效')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理更新
const handleUpdate = () => {
  ElMessage.info('版本更新功能开发中')
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

  /* 深色主题样式 */
  &.dark-theme {
    background-color: #1a1a1a;
    color: #e0e0e0;

    // 全局div样式，确保所有嵌套div都继承深色主题样式
    div {
      &:not(.el-form-item):not(.el-input__wrapper):not(.el-select-dropdown__item):not(.el-alert__content) {
        background-color: inherit;
        color: inherit;
      }
    }

    .page-header {
      .title {
        color: #e0e0e0;
      }
    }

    .settings-container {
      background-color: inherit;
    }

    .card {
      background-color: #242424;
      border-color: #333;

      .subtitle {
        color: #e0e0e0;
        border-bottom: 1px solid #333;
      }
    }

    .settings-form {
      background-color: inherit;
    }

    .deployment-section {
      border-top: 1px solid #333;

      .section-header {
        background-color: inherit;

        .section-title {
          color: #b0b0b0;
        }
      }

      .section-title {
        color: #b0b0b0;
      }

      .database-config {
        background-color: inherit;
      }

      .online-deployment {
        background-color: inherit;
      }
    }

    .form-tip {
      color: #808080;
    }

    .unit {
      color: #808080;
    }

    .version-info {
      background-color: inherit;

      .info-item {
        background-color: inherit;

        .label {
          color: #b0b0b0;
        }

        .value {
          color: #e0e0e0;

          &.update-available {
            color: #409EFF;
          }
        }
      }
    }

    .save-button-container {
      background-color: inherit;
    }

    .el-input__wrapper {
      background-color: #2a2a2a;
      border-color: #333;

      .el-input__inner {
        color: #e0e0e0;
      }

      &:hover {
        border-color: #444;
      }

      &.is-focus {
        border-color: #409EFF;
      }
    }

    .el-select .el-input__wrapper {
      background-color: #2a2a2a;
      border-color: #333;

      .el-input__inner {
        color: #e0e0e0;
      }

      &:hover {
        border-color: #444;
      }

      &.is-focus {
        border-color: #409EFF;
      }
    }

    .el-select-dropdown {
      background-color: #242424;
      border-color: #333;

      .el-select-dropdown__item {
        color: #e0e0e0;

        &:hover {
          background-color: #333;
        }

        &.selected {
          background-color: #409EFF;
        }
      }
    }

    .el-input-number {
      .el-input__wrapper {
        background-color: #2a2a2a;
        border-color: #333;

        .el-input__inner {
          color: #e0e0e0;
        }

        &:hover {
          border-color: #444;
        }

        &.is-focus {
          border-color: #409EFF;
        }
      }
    }

    .el-alert {
      background-color: #2a2a2a;
      border-color: #333;

      .el-alert__title {
        color: #e0e0e0;
      }
      .el-alert__content {
        color: #b0b0b0;
      }
    }
  }
}
</style>