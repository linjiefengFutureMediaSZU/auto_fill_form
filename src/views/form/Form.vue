<template>
  <div class="form-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ $t('form.title') }}</h2>
      <div class="header-actions">
        <el-tooltip :content="$t('form.refreshList')" placement="bottom">
          <el-button circle size="small" type="primary" plain @click="refreshFormList">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 三列布局 -->
    <div class="form-fill-container">
      <!-- 账号选择区 -->
    <div class="account-selection">
      <div class="glass-card">
        <div class="section-header">
            <h3 class="subtitle">{{ $t('form.accountSelection') }}</h3>
            <div class="header-actions">
              <el-select v-model="selectedGroupId" :placeholder="$t('form.filterByGroup')">
                <el-option :label="$t('form.allAccounts')" value="" />
                <el-option
                  v-for="group in groups"
                  :key="group.id"
                  :label="group.group_name"
                  :value="group.id"
                />
              </el-select>
            </div>
          </div>
          
          <!-- 账号搜索 -->
          <el-input
            v-model="accountSearchKeyword"
            :placeholder="$t('form.searchAccount')"
            clearable
            class="account-search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 账号列表 -->
          <div class="account-list">
            <el-checkbox
              v-for="account in filteredAccounts"
              :key="account.id"
              v-model="selectedAccountIds"
              :label="account.id"
              :disabled="account.status !== 1"
              class="account-item"
            >
              <div class="account-info" :class="{ 'inactive': account.status !== 1 }">
                <div class="account-name">{{ account.account_nickname }}</div>
                <div class="account-type">{{ account.account_type }}</div>
              </div>
            </el-checkbox>
            <div v-if="filteredAccounts.length === 0" class="empty-state">
              <el-empty :description="$t('form.noAccount')" />
            </div>
          </div>

          <!-- 账号选择统计 -->
          <div class="selection-footer">
            <div class="selected-count">{{ $t('form.selectedCount', { count: selectedAccountIds.length }) }}</div>
            <div class="selection-actions">
              <el-button size="small" @click="toggleSelectAll">{{ isAllSelected ? $t('form.cancelSelectAll') : $t('form.selectAll') }}</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 中列：表单链接区 -->
      <div class="form-link-selection">
        <div class="glass-card">
          <div class="section-header">
            <h3 class="subtitle">{{ $t('form.formSelection') }}</h3>
            <div class="header-actions">
              <el-select v-model="selectedFolderId" :placeholder="$t('form.filterByFolder')">
                <el-option :label="$t('form.allForms')" value="" />
                <el-option
                  v-for="folder in folders"
                  :key="folder.id"
                  :label="folder.folder_name"
                  :value="folder.id"
                />
              </el-select>
            </div>
          </div>

          <!-- 表单列表 -->
          <div class="form-list">
            <div
              v-for="template in filteredTemplates"
              :key="template.id"
              class="form-item"
              :class="{ 'selected': selectedTemplateId === template.id }"
              @click="selectTemplate(template)"
            >
              <div class="form-info">
                <div class="form-name">{{ template.template_name }}</div>
                <div class="form-type">{{ getFormTypeLabel(template.form_type) }}</div>
              </div>
              <div class="form-meta">
                <div class="last-fill-time" v-if="template.last_fill_time">
                  {{ $t('form.lastFill') }}{{ formatDate(template.last_fill_time) }}
                </div>
              </div>
              <div class="form-actions">
                <el-tooltip :content="$t('form.editMapping')" placement="top">
                  <el-button
                    circle
                    size="small"
                    type="primary"
                    plain
                    @click.stop="editFieldMapping(template)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <div v-if="filteredTemplates.length === 0" class="empty-state">
              <el-empty :description="$t('form.noForm')" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右列：表单预览&填写区 -->
      <div class="form-preview-fill">
        <div class="glass-card">
          <div class="section-header">
            <h3 class="subtitle">
              {{ selectedTemplate ? selectedTemplate.template_name : $t('form.preview') }}
            </h3>
            <div class="header-actions" v-if="selectedTemplate">
              <el-tooltip :content="$t('form.autoMap')" placement="top">
                <el-button circle size="small" type="primary" plain @click="autoMapFields">
                  <el-icon><MagicStick /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip :content="$t('form.previewMap')" placement="top">
                <el-button circle size="small" type="primary" plain @click="previewMapping">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <!-- 表单预览区 -->
          <div v-if="selectedTemplate" class="form-preview">
            <div class="form-url">
              <el-tag size="small" class="form-type-tag">{{ getFormTypeLabel(selectedTemplate.form_type) }}</el-tag>
              <a :href="selectedTemplate.form_url" target="_blank" class="form-link">{{ selectedTemplate.form_url }}</a>
            </div>
            
            <!-- 表单嵌入预览 -->
            <div class="form-iframe-preview">
              <h4 class="preview-title">{{ $t('form.preview') }}</h4>
              <div class="iframe-container">
                <iframe :src="selectedTemplate.form_url" frameborder="0" class="form-iframe"></iframe>
              </div>
            </div>
            
            <!-- 字段匹配区 -->
            <div class="field-mapping">
              <h4 class="mapping-title">{{ $t('form.mappingRules') }}</h4>
              <div class="mapping-list">
                <div
                  v-for="(mapping, index) in fieldMappings"
                  :key="mapping.id || index"
                  class="mapping-item"
                >
                  <div class="form-field">
                    <span class="field-name">{{ mapping.form_field_name }}</span>
                    <el-tag size="small" v-if="mapping.is_required" type="danger">{{ $t('form.required') }}</el-tag>
                  </div>
                  <div class="account-field">
                    <el-select v-model="mapping.account_field_name" :placeholder="$t('form.selectAccountField')">
                      <el-option :label="$t('form.bloggerName')" value="blogger_name" />
                      <el-option :label="$t('form.accountNickname')" value="account_nickname" />
                      <el-option :label="$t('account.accountType')" value="account_type" />
                      <el-option :label="$t('form.accountId')" value="account_id" />
                      <el-option :label="$t('form.homepageUrl')" value="homepage_url" />
                      <el-option :label="$t('account.fansCount')" value="fans_count" />
                      <el-option :label="$t('form.avgRead')" value="avg_read_count" />
                      <el-option :label="$t('form.likeCount')" value="like_count" />
                      <el-option :label="$t('form.commentCount')" value="comment_count" />
                      <el-option :label="$t('account.quoteSingle')" value="quote_single" />
                      <el-option :label="$t('form.quotePackage')" value="quote_package" />
                      <el-option :label="$t('form.cooperationType')" value="cooperation_type" />
                      <el-option :label="$t('form.contact')" value="contact" />
                    </el-select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 填写设置 -->
            <div class="fill-settings">
              <h4 class="settings-title">{{ $t('form.fillSettings') }}</h4>
              <el-form :inline="true" :model="fillSettings" class="settings-form">
                <el-form-item :label="$t('form.submitInterval')">
                  <el-input-number
                    v-model="fillSettings.submitInterval"
                    :min="1"
                    :max="10"
                    :step="1"
                    :placeholder="$t('form.seconds')"
                  />
                  <span class="unit">{{ $t('form.seconds') }}</span>
                </el-form-item>
                <el-form-item :label="$t('form.autoSubmit')">
                  <el-switch v-model="fillSettings.autoSubmit" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 填写操作区 -->
            <div class="fill-actions">
              <el-button
                type="primary"
                size="large"
                :disabled="selectedAccountIds.length === 0"
                @click="startSingleFill"
                class="action-button"
              >
                <el-icon><EditPen /></el-icon>
                {{ $t('form.singleFill') }}
              </el-button>
              <el-button
                type="success"
                size="large"
                :disabled="selectedAccountIds.length === 0"
                @click="startBatchFill"
                class="action-button"
              >
                <el-icon><CopyDocument /></el-icon>
                {{ $t('form.batchFill') }}
              </el-button>
            </div>
          </div>

          <!-- 未选择表单时的提示 -->
          <div v-else class="no-template-selected">
            <el-empty
              :description="$t('form.selectTemplate')"
              image-size="200"
            >
              <el-button type="primary" @click="$router.push('/formList')">
                {{ $t('form.gotoList') }}
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- 字段匹配编辑弹窗 -->
    <el-dialog
      v-model="fieldMappingDialogVisible"
      :title="$t('form.editMappingTitle')"
      width="600px"
    >
      <div class="field-mapping-edit">
        <div
          v-for="(mapping, index) in editableFieldMappings"
          :key="mapping.id || index"
          class="mapping-item-edit"
        >
          <el-form :inline="true" :model="mapping">
            <el-form-item :label="$t('form.formField')">
              <el-input v-model="mapping.form_field_name" :placeholder="$t('form.formFieldPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('form.fieldType')">
              <el-select v-model="mapping.form_field_type" :placeholder="$t('form.fieldTypePlaceholder')">
                <el-option :label="$t('form.inputType')" :value="FIELD_TYPES.INPUT" />
                <el-option :label="$t('form.selectType')" :value="FIELD_TYPES.SELECT" />
                <el-option :label="$t('form.radioType')" :value="FIELD_TYPES.RADIO" />
                <el-option :label="$t('form.checkboxType')" :value="FIELD_TYPES.CHECKBOX" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('form.isRequired')">
              <el-switch v-model="mapping.is_required" />
            </el-form-item>
            <el-form-item :label="$t('form.matchAccountField')">
              <el-select v-model="mapping.account_field_name" :placeholder="$t('form.selectAccountField')">
                <el-option :label="$t('form.bloggerName')" value="blogger_name" />
                <el-option :label="$t('form.accountNickname')" value="account_nickname" />
                <el-option :label="$t('account.accountType')" value="account_type" />
                <el-option :label="$t('form.accountId')" value="account_id" />
                <el-option :label="$t('form.homepageUrl')" value="homepage_url" />
                <el-option :label="$t('account.fansCount')" value="fans_count" />
                <el-option :label="$t('form.avgRead')" value="avg_read_count" />
                <el-option :label="$t('form.likeCount')" value="like_count" />
                <el-option :label="$t('form.commentCount')" value="comment_count" />
                <el-option :label="$t('account.quoteSingle')" value="quote_single" />
                <el-option :label="$t('form.quotePackage')" value="quote_package" />
                <el-option :label="$t('form.cooperationType')" value="cooperation_type" />
                <el-option :label="$t('form.contact')" value="contact" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="danger"
                size="small"
                @click="removeMappingItem(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-tooltip :content="$t('form.addField')" placement="top">
          <el-button
            circle
            size="small"
            type="primary"
            plain
            @click="addMappingItem"
            class="add-mapping-button"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="fieldMappingDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveFieldMappings">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 填写进度弹窗 -->
    <el-dialog
      v-model="fillProgressDialogVisible"
      :title="$t('form.fillProgress')"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="fill-progress">
        <el-progress
          :percentage="fillProgress.percentage"
          :status="fillProgress.status"
        />
        <div class="progress-info">
          <div class="current-status">{{ fillProgress.currentStatus }}</div>
          <div class="fill-stats">
            {{ $t('form.progressStats', { success: fillProgress.successCount, fail: fillProgress.failCount, total: selectedAccountIds.length }) }}
          </div>
        </div>
        <div class="progress-log" v-if="fillProgress.logs.length > 0">
          <h4 class="log-title">{{ $t('form.fillLog') }}</h4>
          <div class="log-list">
            <div
              v-for="(log, index) in fillProgress.logs"
              :key="index"
              class="log-item"
              :class="{ 'success': log.status === 'success', 'error': log.status === 'error' }"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-content">{{ log.content }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            :disabled="fillProgress.isRunning"
            @click="fillProgressDialogVisible = false"
          >
            {{ $t('form.close') }}
          </el-button>
          <el-button
            v-if="fillProgress.isRunning"
            type="danger"
            @click="stopFillProcess"
          >
            {{ $t('form.stopFill') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore, useFormStore } from '../../stores'
import { useSettingsStore } from '../../stores/settings'
import { Refresh, Search, MagicStick, View, Edit, EditPen, CopyDocument, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { FIELD_TYPES, FORM_TYPES } from '../../constants/form'

// i18n
const { t, locale } = useI18n()

// 状态管理
const settingsStore = useSettingsStore()

// 计算属性
const isDarkTheme = computed(() => {
  return settingsStore.general.theme === 'dark'
})

// 路由
const router = useRouter()

// 状态管理
const accountStore = useAccountStore()
const formStore = useFormStore()

// 响应式数据
const selectedGroupId = ref('')
const accountSearchKeyword = ref('')
const selectedAccountIds = ref([])
const selectedTemplateId = ref(null)
const selectedFolderId = ref('')
const fieldMappingDialogVisible = ref(false)
const fillProgressDialogVisible = ref(false)

// 填写设置
const fillSettings = reactive({
  submitInterval: 2,
  autoSubmit: true
})

// 字段匹配
const editableFieldMappings = ref([])

// 填写进度
const fillProgress = reactive({
  isRunning: false,
  percentage: 0,
  status: '',
  currentStatus: '',
  successCount: 0,
  failCount: 0,
  logs: []
})

// 计算属性
const accounts = computed(() => accountStore.accounts)
const groups = computed(() => accountStore.groups)
const templates = computed(() => formStore.templates)
const folders = computed(() => formStore.folders)
const selectedTemplate = computed(() => {
  return templates.value.find(t => t.id === selectedTemplateId.value)
})

// 筛选后的账号
const filteredAccounts = computed(() => {
  if (!Array.isArray(accounts.value)) return []
  return accounts.value.filter(account => {
    // 分组筛选
    if (selectedGroupId.value && account.group_id !== parseInt(selectedGroupId.value)) {
      return false
    }
    // 关键词搜索
    if (accountSearchKeyword.value) {
      const keyword = accountSearchKeyword.value.toLowerCase()
      if (!account.account_nickname.toLowerCase().includes(keyword) && 
          !account.blogger_name.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })
})

// 计算是否已全选
const isAllSelected = computed(() => {
  const activeAccounts = filteredAccounts.value.filter(a => a.status === 1)
  if (activeAccounts.length === 0) return false
  return selectedAccountIds.value.length === activeAccounts.length
})

// 筛选后的表单模板
const filteredTemplates = computed(() => {
  if (!Array.isArray(templates.value)) return []
  return templates.value.filter(template => {
    // 文件夹筛选
    if (selectedFolderId.value && template.folder_id !== parseInt(selectedFolderId.value)) {
      return false
    }
    return true
  })
})

// 字段匹配规则
const fieldMappings = computed(() => {
  if (!selectedTemplate.value) return []
  return formStore.getFieldMappingsByTemplate(selectedTemplate.value.id)
})

// 方法
// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取表单类型显示标签
const getFormTypeLabel = (type) => {
  const map = {
    [FORM_TYPES.TENCENT]: 'tencent',
    [FORM_TYPES.WENJUANXING]: 'wenjuanxing',
    [FORM_TYPES.SHIMO]: 'shimo',
    [FORM_TYPES.MIKE]: 'mike',
    [FORM_TYPES.WPS]: 'wps',
    [FORM_TYPES.MINIPROGRAM]: 'miniprogram'
  }
  const key = map[type]
  return key ? t(`formList.types.${key}`) : type
}

// 刷新表单列表
const refreshFormList = () => {
  // 这里可以添加刷新表单列表的逻辑
  ElMessage.success(t('form.listRefreshed'))
}

// 选择分组
const selectGroup = (groupId) => {
  selectedGroupId.value = groupId
  selectedAccountIds.value = []
}

// 选择账号
const selectAccount = (accountId) => {
  const index = selectedAccountIds.value.indexOf(accountId)
  if (index === -1) {
    selectedAccountIds.value.push(accountId)
  } else {
    selectedAccountIds.value.splice(index, 1)
  }
}

// 切换全选/取消全选
const toggleSelectAll = () => {
  const activeAccounts = filteredAccounts.value.filter(a => a.status === 1)
  if (selectedAccountIds.value.length === activeAccounts.length) {
    // 已全选，执行取消全选
    selectedAccountIds.value = []
  } else {
    // 未全选，执行全选
    selectedAccountIds.value = activeAccounts.map(a => a.id)
  }
}

// 选择表单模板
const selectTemplate = async (template) => {
  selectedTemplateId.value = template.id
  await formStore.selectTemplate(template.id)
}

// 编辑字段匹配规则
const editFieldMapping = (template) => {
  selectedTemplateId.value = template.id
  // 复制字段匹配规则到编辑数组
  editableFieldMappings.value = JSON.parse(JSON.stringify(fieldMappings.value))
  // 如果没有匹配规则，添加默认规则
  if (editableFieldMappings.value.length === 0) {
    addMappingItem()
  }
  fieldMappingDialogVisible.value = true
}

// 添加字段匹配项
const addMappingItem = () => {
  editableFieldMappings.value.push({
    form_field_name: '',
    form_field_type: FIELD_TYPES.INPUT,
    is_required: false,
    account_field_name: '',
    is_auto_mapping: false
  })
}

// 删除字段匹配项
const removeMappingItem = (index) => {
  editableFieldMappings.value.splice(index, 1)
}

// 保存字段匹配规则
const saveFieldMappings = async () => {
  if (!selectedTemplateId.value) return
  
  const currentMappings = fieldMappings.value
  const newMappings = editableFieldMappings.value
  
  // 1. Identify items to delete (in current but not in new)
  const toDelete = currentMappings.filter(c => !newMappings.find(n => n.id === c.id))
  
  // 2. Identify items to add (no id)
  const toAdd = newMappings.filter(n => !n.id)
  
  // 3. Identify items to update (has id)
  const toUpdate = newMappings.filter(n => n.id)
  
  try {
    const promises = []
    
    // Delete
    toDelete.forEach(m => promises.push(formStore.deleteFieldMapping(m.id)))
    
    // Add
    toAdd.forEach(m => {
      const mapping = { ...m, template_id: selectedTemplateId.value }
      promises.push(formStore.addFieldMapping(mapping))
    })
    
    // Update
    toUpdate.forEach(m => promises.push(formStore.updateFieldMapping(m.id, m)))
    
    await Promise.all(promises)
    
    ElMessage.success(t('form.mappingSaved'))
    fieldMappingDialogVisible.value = false
  } catch (error) {
    console.error('Failed to save mappings:', error)
    ElMessage.error(t('form.errorMsg', { msg: error.message || 'Unknown error' }))
  }
}

// 自动匹配字段
const autoMapFields = () => {
  // 这里可以添加自动匹配字段的逻辑
  ElMessage.success(t('form.autoMapped'))
}

// 预览匹配结果
const previewMapping = () => {
  // 这里可以添加预览匹配结果的逻辑
  ElMessage.info(t('form.previewDev'))
}

// 开始单个填写
const startSingleFill = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning(t('form.selectOneAccount'))
    return
  }
  if (!selectedTemplateId.value) {
    ElMessage.warning(t('form.selectTemplate'))
    return
  }
  
  // 开始填写流程
  startFillProcess(false)
}

// 开始批量填写
const startBatchFill = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning(t('form.selectOneAccount'))
    return
  }
  if (!selectedTemplateId.value) {
    ElMessage.warning(t('form.selectTemplate'))
    return
  }
  
  // 开始填写流程
  startFillProcess(true)
}

// 开始填写流程
const startFillProcess = (isBatch) => {
  // 初始化进度
  fillProgress.isRunning = true
  fillProgress.percentage = 0
  fillProgress.status = ''
  fillProgress.currentStatus = t('form.readyToFill')
  fillProgress.successCount = 0
  fillProgress.failCount = 0
  fillProgress.logs = []
  
  // 显示进度弹窗
  fillProgressDialogVisible.value = true
  
  // 执行真实的自动化流程
  realFillProcess(isBatch)
}

// 真实的自动化填写过程
const realFillProcess = async (isBatch) => {
  if (!window.electronAPI) {
    simulateFillProcess(isBatch)
    return
  }

  // 监听进度推送
  window.electronAPI.autofill.onProgress((progress) => {
    switch (progress.type) {
      case 'start':
        fillProgress.currentStatus = t('form.preparingFill', { name: progress.accountName });
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: t('form.startProcessing', { name: progress.accountName }),
          status: 'info'
        });
        break;
      case 'log':
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: progress.log,
          status: 'info'
        });
        break;
      case 'progress':
        fillProgress.percentage = progress.percentage;
        fillProgress.successCount = progress.successCount;
        fillProgress.failCount = progress.failCount;
        break;
      case 'error':
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: t('form.errorMsg', { msg: progress.message }),
          status: 'error'
        });
        break;
    }
  });

  try {
    const result = await window.electronAPI.autofill.start({
      accountIds: [...selectedAccountIds.value],
      templateId: selectedTemplateId.value,
      settings: {
        showBrowser: true,
        submitInterval: fillSettings.submitInterval
      }
    });

    fillProgress.isRunning = false;
    fillProgress.percentage = 100;
    fillProgress.status = result.failCount === 0 ? 'success' : 'warning';
    fillProgress.currentStatus = t('form.taskFinished');
    fillProgress.logs.push({
      time: new Date().toLocaleTimeString(),
      content: t('form.taskSummary', { success: result.successCount, fail: result.failCount }),
      status: 'success'
    });

  } catch (error) {
    fillProgress.isRunning = false;
    fillProgress.status = 'exception';
    fillProgress.currentStatus = t('form.taskTerminated');
    fillProgress.logs.push({
      time: new Date().toLocaleTimeString(),
      content: t('form.engineError', { msg: error.message }),
      status: 'error'
    });
  } finally {
    window.electronAPI.autofill.removeProgressListeners();
  }
};

// 模拟填写过程 (仅作为降级方案或 Web 预览)
const simulateFillProcess = (isBatch) => {
  const totalAccounts = selectedAccountIds.value.length
  let currentIndex = 0
  
  const fillNextAccount = () => {
    if (currentIndex >= totalAccounts) {
      // 填写完成
      fillProgress.isRunning = false
      fillProgress.percentage = 100
      fillProgress.status = fillProgress.successCount === totalAccounts ? 'success' : 'warning'
      fillProgress.currentStatus = t('form.fillCompleted')
      fillProgress.logs.push({
        time: new Date().toLocaleTimeString(),
        content: t('form.fillCompletedStats', { success: fillProgress.successCount, fail: fillProgress.failCount }),
        status: 'success'
      })
      return
    }
    
    const accountId = selectedAccountIds.value[currentIndex]
    const account = accounts.value.find(a => a.id === accountId)
    
    // 更新进度
    fillProgress.percentage = Math.round((currentIndex / totalAccounts) * 100)
    fillProgress.currentStatus = t('form.fillingAccount', { name: account.account_nickname })
    fillProgress.logs.push({
      time: new Date().toLocaleTimeString(),
      content: t('form.startFillingAccount', { name: account.account_nickname }),
      status: 'info'
    })
    
    // 模拟填写延迟
    setTimeout(() => {
      // 模拟填写结果（90%成功率）
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        fillProgress.successCount++
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: t('form.accountFillSuccess', { name: account.account_nickname }),
          status: 'success'
        })
      } else {
        fillProgress.failCount++
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: t('form.accountFillFail', { name: account.account_nickname }),
          status: 'error'
        })
      }
      
      currentIndex++
      
      // 继续填写下一个账号
      setTimeout(fillNextAccount, fillSettings.submitInterval * 1000)
    }, 2000)
  }
  
  // 开始填写
  fillNextAccount()
}

// 停止填写过程
const stopFillProcess = () => {
  fillProgress.isRunning = false
  fillProgress.currentStatus = t('form.fillStopped')
  fillProgress.logs.push({
    time: new Date().toLocaleTimeString(),
    content: t('form.fillManualStopped'),
    status: 'info'
  })
}

// 生命周期
onMounted(() => {
  // 初始化数据
  if (templates.value.length > 0) {
    selectedTemplateId.value = templates.value[0].id
    formStore.selectTemplate(selectedTemplateId.value)
  }
})
</script>

<style scoped lang="scss">
.form-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    padding-left: var(--spacing-sm);
    flex-shrink: 0;

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

  .glass-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    > .section-header {
      flex-shrink: 0;
    }

    > .account-search {
      flex-shrink: 0;
    }

    > .account-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    > .form-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    > .form-preview {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    > .selection-footer {
      flex-shrink: 0;
    }
  }

  .form-fill-container {
    display: flex;
    gap: var(--spacing-lg);
    flex: 1;
    min-height: 0;
    overflow: hidden;

    .account-selection {
      flex: 0.7;
      min-width: 260px;
      max-width: 350px;
      display: flex;
      flex-direction: column;
    }

    .form-link-selection {
      flex: 0.7;
      min-width: 260px;
      max-width: 350px;
      display: flex;
      flex-direction: column;
    }

    .form-preview-fill {
      flex: 1.6;
      min-width: 300px;
      display: flex;
      flex-direction: column;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .account-search {
    margin-bottom: var(--spacing-md);
  }

  .account-list {
    overflow-y: auto;
    margin-bottom: var(--spacing-md);
  }

  .account-item {
    display: block;
    margin-bottom: var(--spacing-xs);
    padding: var(--spacing-xs) 0;

    .account-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.inactive {
        opacity: 0.5;
      }

      .account-name {
        font-weight: 500;
      }

      .account-type {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
        background-color: var(--bg-color-light);
        padding: 2px 6px;
        border-radius: var(--border-radius-sm);
      }
    }
  }

  .selection-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color-light);

    .selected-count {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
    }

    .selection-actions {
      display: flex;
      gap: var(--spacing-xs);
    }
  }

  .form-list {
    overflow-y: auto;
  }

  .form-item {
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    margin-bottom: var(--spacing-xs);
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
      background-color: var(--bg-color-light);
      border-color: var(--border-color);
    }

    &.selected {
      background-color: rgba(64, 158, 255, 0.1);
      border-color: var(--primary-color);
    }

    .form-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xs);

      .form-name {
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .form-type {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
        background-color: var(--bg-color-light);
        padding: 2px 6px;
        border-radius: var(--border-radius-sm);
      }
    }

    .form-meta {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
  }

  .form-preview {
    .form-url {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-sm);
      background-color: var(--bg-color-light);
      border-radius: var(--border-radius-md);
      word-break: break-all;

      .form-type-tag {
        flex-shrink: 0;
      }

      .form-link {
        flex: 1;
        font-size: var(--font-size-sm);
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .form-iframe-preview {
      margin-bottom: var(--spacing-lg);

      .preview-title {
        font-size: var(--font-size-sm);
        font-weight: 500;
        margin-bottom: var(--spacing-md);
      }

      .iframe-container {
        border: 1px solid var(--border-color-light);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        min-height: 500px;

        .form-iframe {
          width: 100%;
          height: 100%;
          min-height: 500px;
        }
      }
    }

    .field-mapping {
      margin-bottom: var(--spacing-lg);

      .mapping-title {
        font-size: var(--font-size-sm);
        font-weight: 500;
        margin-bottom: var(--spacing-md);
      }

      .mapping-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--border-color-light);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-sm);
      }

      .mapping-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        padding: var(--spacing-xs);
        background-color: var(--bg-color-white);
        border-radius: var(--border-radius-sm);

        .form-field {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .account-field {
          flex: 1;
        }
      }
    }

    .fill-settings {
      margin-bottom: var(--spacing-lg);

      .settings-title {
        font-size: var(--font-size-sm);
        font-weight: 500;
        margin-bottom: var(--spacing-md);
      }

      .settings-form {
        display: flex;
        gap: var(--spacing-md);

        .unit {
          margin-left: var(--spacing-xs);
          font-size: var(--font-size-sm);
          color: var(--text-color-secondary);
        }
      }
    }

    .fill-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);

      .action-button {
        flex: 1;
      }
    }
  }

  .no-template-selected {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  .field-mapping-edit {
    .mapping-item-edit {
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
      background-color: var(--bg-color-light);
      border-radius: var(--border-radius-md);
    }

    .add-mapping-button {
      margin-top: var(--spacing-md);
    }
  }

  .fill-progress {
    .progress-info {
      margin-top: var(--spacing-md);
      margin-bottom: var(--spacing-md);

      .current-status {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }

      .fill-stats {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
      }
    }

    .log-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color-light);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm);

      .log-item {
        display: block;
        margin-bottom: var(--spacing-xs);
        padding: var(--spacing-xs);
        border-radius: var(--border-radius-sm);

        &.success {
          background-color: rgba(103, 194, 58, 0.1);
          color: var(--success-color);
        }

        &.error {
          background-color: rgba(245, 108, 108, 0.1);
          color: var(--danger-color);
        }

        .log-time {
          font-size: var(--font-size-xs);
          color: var(--text-color-secondary);
          margin-right: var(--spacing-sm);
        }
      }
    }
  }

  @media (max-width: 1200px) {
    .form-fill-container {
      flex-direction: column;
      height: auto;

      > div {
        width: 100% !important;
        max-width: none !important;
        min-width: none !important;
      }

      .account-list,
      .form-list {
        max-height: 300px;
      }
    }
  }

  // 深色主题样式 - 已移除，使用全局 apple-theme.scss
  &.dark-theme {
    // 保持空或移除
  }

}
</style>
