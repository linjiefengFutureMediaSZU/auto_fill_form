<template>
  <div class="form-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">表单填写</h2>
      <div class="header-actions">
        <el-tooltip content="刷新表单列表" placement="bottom">
          <el-button circle size="small" type="primary" plain @click="refreshFormList">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 三列布局 -->
    <div class="form-fill-container">
      <!-- 左列：账号选择区 -->
      <div class="account-selection">
        <div class="card">
          <div class="section-header">
            <h3 class="subtitle">账号选择</h3>
            <div class="header-actions">
              <el-select v-model="selectedGroupId" placeholder="按分组筛选">
                <el-option label="全部账号" value="" />
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
            placeholder="搜索账号"
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
              <el-empty description="暂无账号" />
            </div>
          </div>

          <!-- 账号选择统计 -->
          <div class="selection-footer">
            <div class="selected-count">已选择 {{ selectedAccountIds.length }} 个账号</div>
            <div class="selection-actions">
              <el-button size="small" @click="toggleSelectAll">{{ isAllSelected ? '取消全选' : '全选' }}</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 中列：表单链接区 -->
      <div class="form-link-selection">
        <div class="card">
          <div class="section-header">
            <h3 class="subtitle">表单选择</h3>
            <div class="header-actions">
              <el-select v-model="selectedFolderId" placeholder="按文件夹筛选">
                <el-option label="全部表单" value="" />
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
                <div class="form-type">{{ template.form_type }}</div>
              </div>
              <div class="form-meta">
                <div class="last-fill-time" v-if="template.last_fill_time">
                  最后填写：{{ formatDate(template.last_fill_time) }}
                </div>
              </div>
              <div class="form-actions">
                <el-tooltip content="编辑字段匹配" placement="top">
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
              <el-empty description="暂无表单" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右列：表单预览&填写区 -->
      <div class="form-preview-fill">
        <div class="glass-card">
          <div class="section-header">
            <h3 class="subtitle">
              {{ selectedTemplate ? selectedTemplate.template_name : '表单预览' }}
            </h3>
            <div class="header-actions" v-if="selectedTemplate">
              <el-tooltip content="自动匹配" placement="top">
                <el-button circle size="small" type="primary" plain @click="autoMapFields">
                  <el-icon><MagicStick /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="预览匹配" placement="top">
                <el-button circle size="small" type="primary" plain @click="previewMapping">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <!-- 表单预览区 -->
          <div v-if="selectedTemplate" class="form-preview">
            <div class="form-url">
              <el-tag size="small" class="form-type-tag">{{ selectedTemplate.form_type }}</el-tag>
              <a :href="selectedTemplate.form_url" target="_blank" class="form-link">{{ selectedTemplate.form_url }}</a>
            </div>
            
            <!-- 表单嵌入预览 -->
            <div class="form-iframe-preview">
              <h4 class="preview-title">表单预览</h4>
              <div class="iframe-container">
                <iframe :src="selectedTemplate.form_url" frameborder="0" class="form-iframe"></iframe>
              </div>
            </div>
            
            <!-- 字段匹配区 -->
            <div class="field-mapping">
              <h4 class="mapping-title">字段匹配规则</h4>
              <div class="mapping-list">
                <div
                  v-for="(mapping, index) in fieldMappings"
                  :key="mapping.id || index"
                  class="mapping-item"
                >
                  <div class="form-field">
                    <span class="field-name">{{ mapping.form_field_name }}</span>
                    <el-tag size="small" v-if="mapping.is_required" type="danger">必填</el-tag>
                  </div>
                  <div class="account-field">
                    <el-select v-model="mapping.account_field_name" placeholder="选择账号字段">
                      <el-option label="博主姓名" value="blogger_name" />
                      <el-option label="账号昵称" value="account_nickname" />
                      <el-option label="账号类型" value="account_type" />
                      <el-option label="账号ID" value="account_id" />
                      <el-option label="主页链接" value="homepage_url" />
                      <el-option label="粉丝量" value="fans_count" />
                      <el-option label="平均阅读量" value="avg_read_count" />
                      <el-option label="平均点赞量" value="like_count" />
                      <el-option label="平均评论量" value="comment_count" />
                      <el-option label="单条报价" value="quote_single" />
                      <el-option label="套餐报价" value="quote_package" />
                      <el-option label="合作形式" value="cooperation_type" />
                      <el-option label="联系方式" value="contact" />
                    </el-select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 填写设置 -->
            <div class="fill-settings">
              <h4 class="settings-title">填写设置</h4>
              <el-form :inline="true" :model="fillSettings" class="settings-form">
                <el-form-item label="提交间隔">
                  <el-input-number
                    v-model="fillSettings.submitInterval"
                    :min="1"
                    :max="10"
                    :step="1"
                    placeholder="秒"
                  />
                  <span class="unit">秒</span>
                </el-form-item>
                <el-form-item label="自动提交">
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
                一键填写（单个）
              </el-button>
              <el-button
                type="success"
                size="large"
                :disabled="selectedAccountIds.length === 0"
                @click="startBatchFill"
                class="action-button"
              >
                <el-icon><CopyDocument /></el-icon>
                批量填写（多个）
              </el-button>
            </div>
          </div>

          <!-- 未选择表单时的提示 -->
          <div v-else class="no-template-selected">
            <el-empty
              description="请选择一个表单模板"
              image-size="200"
            >
              <el-button type="primary" @click="$router.push('/formList')">
                去表单列表添加
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- 字段匹配编辑弹窗 -->
    <el-dialog
      v-model="fieldMappingDialogVisible"
      title="编辑字段匹配规则"
      width="600px"
    >
      <div class="field-mapping-edit">
        <div
          v-for="(mapping, index) in editableFieldMappings"
          :key="mapping.id || index"
          class="mapping-item-edit"
        >
          <el-form :inline="true" :model="mapping">
            <el-form-item label="表单字段">
              <el-input v-model="mapping.form_field_name" placeholder="表单字段名称" />
            </el-form-item>
            <el-form-item label="字段类型">
              <el-select v-model="mapping.form_field_type" placeholder="选择字段类型">
                <el-option label="输入框" value="输入框" />
                <el-option label="下拉框" value="下拉框" />
                <el-option label="单选框" value="单选框" />
                <el-option label="复选框" value="复选框" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否必填">
              <el-switch v-model="mapping.is_required" />
            </el-form-item>
            <el-form-item label="匹配账号字段">
              <el-select v-model="mapping.account_field_name" placeholder="选择账号字段">
                <el-option label="博主姓名" value="blogger_name" />
                <el-option label="账号昵称" value="account_nickname" />
                <el-option label="账号类型" value="account_type" />
                <el-option label="账号ID" value="account_id" />
                <el-option label="主页链接" value="homepage_url" />
                <el-option label="粉丝量" value="fans_count" />
                <el-option label="平均阅读量" value="avg_read_count" />
                <el-option label="平均点赞量" value="like_count" />
                <el-option label="平均评论量" value="comment_count" />
                <el-option label="单条报价" value="quote_single" />
                <el-option label="套餐报价" value="quote_package" />
                <el-option label="合作形式" value="cooperation_type" />
                <el-option label="联系方式" value="contact" />
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
        <el-tooltip content="添加字段" placement="top">
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
          <el-button @click="fieldMappingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFieldMappings">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 填写进度弹窗 -->
    <el-dialog
      v-model="fillProgressDialogVisible"
      title="填写进度"
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
            成功：{{ fillProgress.successCount }} | 失败：{{ fillProgress.failCount }} | 总数：{{ selectedAccountIds.length }}
          </div>
        </div>
        <div class="progress-log" v-if="fillProgress.logs.length > 0">
          <h4 class="log-title">填写日志</h4>
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
            关闭
          </el-button>
          <el-button
            v-if="fillProgress.isRunning"
            type="danger"
            @click="stopFillProcess"
          >
            停止填写
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
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 刷新表单列表
const refreshFormList = () => {
  // 这里可以添加刷新表单列表的逻辑
  ElMessage.success('表单列表已刷新')
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
    form_field_type: '输入框',
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
const saveFieldMappings = () => {
  // 这里可以添加保存字段匹配规则的逻辑
  ElMessage.success('字段匹配规则已保存')
  fieldMappingDialogVisible.value = false
}

// 自动匹配字段
const autoMapFields = () => {
  // 这里可以添加自动匹配字段的逻辑
  ElMessage.success('字段已自动匹配')
}

// 预览匹配结果
const previewMapping = () => {
  // 这里可以添加预览匹配结果的逻辑
  ElMessage.info('预览匹配结果功能开发中')
}

// 开始单个填写
const startSingleFill = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning('请选择至少一个账号')
    return
  }
  if (!selectedTemplateId.value) {
    ElMessage.warning('请选择一个表单模板')
    return
  }
  
  // 开始填写流程
  startFillProcess(false)
}

// 开始批量填写
const startBatchFill = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning('请选择至少一个账号')
    return
  }
  if (!selectedTemplateId.value) {
    ElMessage.warning('请选择一个表单模板')
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
  fillProgress.currentStatus = '准备开始填写...'
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
        fillProgress.currentStatus = `正在准备填写：${progress.accountName}`;
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: `开始处理账号：${progress.accountName}`,
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
          content: `错误: ${progress.message}`,
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
    fillProgress.currentStatus = '自动化任务已结束';
    fillProgress.logs.push({
      time: new Date().toLocaleTimeString(),
      content: `任务总结：成功 ${result.successCount} 个，失败 ${result.failCount} 个`,
      status: 'success'
    });

  } catch (error) {
    fillProgress.isRunning = false;
    fillProgress.status = 'exception';
    fillProgress.currentStatus = '任务异常终止';
    fillProgress.logs.push({
      time: new Date().toLocaleTimeString(),
      content: `核心引擎错误: ${error.message}`,
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
      fillProgress.currentStatus = '填写完成'
      fillProgress.logs.push({
        time: new Date().toLocaleTimeString(),
        content: `填写完成：成功 ${fillProgress.successCount} 个，失败 ${fillProgress.failCount} 个`,
        status: 'success'
      })
      return
    }
    
    const accountId = selectedAccountIds.value[currentIndex]
    const account = accounts.value.find(a => a.id === accountId)
    
    // 更新进度
    fillProgress.percentage = Math.round((currentIndex / totalAccounts) * 100)
    fillProgress.currentStatus = `正在填写账号：${account.account_nickname}`
    fillProgress.logs.push({
      time: new Date().toLocaleTimeString(),
      content: `开始填写账号：${account.account_nickname}`,
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
          content: `账号 ${account.account_nickname} 填写成功`,
          status: 'success'
        })
      } else {
        fillProgress.failCount++
        fillProgress.logs.push({
          time: new Date().toLocaleTimeString(),
          content: `账号 ${account.account_nickname} 填写失败：网络异常`,
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
  fillProgress.currentStatus = '填写已停止'
  fillProgress.logs.push({
    time: new Date().toLocaleTimeString(),
    content: '填写过程已手动停止',
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
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card > .section-header {
    flex-shrink: 0;
  }

  .card > .account-search {
    flex-shrink: 0;
  }

  .card > .account-list {
    flex: 1;
    overflow-y: auto;
  }

  .card > .form-list {
    flex: 1;
    overflow-y: auto;
  }

  .card > .form-preview {
    flex: 1;
    overflow-y: auto;
  }

  .card > .selection-footer {
    flex-shrink: 0;
  }

  .form-fill-container {
    display: flex;
    gap: var(--spacing-lg);
    height: calc(100vh - 200px);

    .account-selection {
      flex: 0.7;
      min-width: 260px;
      max-width: 350px;
    }

    .form-link-selection {
      flex: 0.7;
      min-width: 260px;
      max-width: 350px;
    }

    .form-preview-fill {
      flex: 1.6;
      min-width: 300px;
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
    max-height: 400px;
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
    max-height: 500px;
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

  // 深色主题样式
  &.dark-theme {
    background-color: #1a1a1a;
    color: #e0e0e0;

    /* 确保所有div元素都有合适的背景色和文字颜色 */
    div {
      &:not(.el-table__cell):not(.el-form-item):not(.el-dialog__body):not(.el-dialog__footer):not(.el-collapse-item__content):not(.el-tree-node__content):not(.el-time-spinner__item):not(.el-date-table__cell):not(.log-item):not(.mapping-item):not(.form-item):not(.account-item) {
        background-color: inherit;
        color: inherit;
      }
    }

    .page-header {
      background-color: transparent;
    }

    .header-actions {
      background-color: transparent;
    }

    .form-fill-container {
      background-color: transparent;

      .account-selection,
      .form-link-selection,
      .form-preview-fill {
        background-color: transparent;
      }
    }

    .card {
      background-color: #242424;
      border-color: #333;
      box-shadow: none;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }

    .section-header {
      background-color: transparent;
      color: #e0e0e0;

      .subtitle {
        color: #e0e0e0;
      }
    }

    .account-search {
      background-color: transparent;

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

    .account-list {
      background-color: transparent;

      .empty-state {
        background-color: transparent;
      }
    }

    .account-item {
      display: block;
      margin-bottom: var(--spacing-xs);
      padding: var(--spacing-xs) 0;

      &:hover {
        background-color: #2c2c2c;
      }

      &.selected {
        background-color: rgba(64, 158, 255, 0.2);
      }

      .account-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: transparent;

        &.inactive {
          opacity: 0.5;
        }

        .account-name {
          font-weight: 500;
          color: #e0e0e0;
        }

        .account-type {
          font-size: var(--font-size-xs);
          color: #b0b0b0;
          background-color: #333;
          padding: 2px 6px;
          border-radius: var(--border-radius-sm);
        }
      }
    }

    .selection-footer {
      background-color: transparent;
      border-top: 1px solid #333;

      .selected-count {
        font-size: var(--font-size-sm);
        color: #b0b0b0;
      }

      .selection-actions {
        background-color: transparent;
      }
    }

    .form-list {
      background-color: transparent;

      .empty-state {
        background-color: transparent;
      }
    }

    .form-item {
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      margin-bottom: var(--spacing-xs);
      transition: all 0.3s ease;
      border: 1px solid transparent;
      background-color: transparent;

      &:hover {
        background-color: #2c2c2c;
        border-color: #444;
      }

      &.selected {
        background-color: rgba(64, 158, 255, 0.2);
        border-color: #409EFF;
      }

      .form-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);
        background-color: transparent;

        .form-name {
          font-weight: 500;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #e0e0e0;
        }

        .form-type {
          font-size: var(--font-size-xs);
          color: #b0b0b0;
          background-color: #333;
          padding: 2px 6px;
          border-radius: var(--border-radius-sm);
        }
      }

      .form-meta {
        font-size: var(--font-size-xs);
        color: #b0b0b0;
        margin-bottom: var(--spacing-xs);
        background-color: transparent;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        background-color: transparent;
      }
    }

    .form-preview {
      background-color: transparent;

      .form-url {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
        padding: var(--spacing-sm);
        background-color: #2c2c2c;
        border-radius: var(--border-radius-md);
        word-break: break-all;

        .form-type-tag {
          flex-shrink: 0;
          background-color: #333;
          color: #b0b0b0;
        }

        .form-link {
          flex: 1;
          font-size: var(--font-size-sm);
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .form-iframe-preview {
        margin-bottom: var(--spacing-lg);
        background-color: transparent;

        .preview-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          margin-bottom: var(--spacing-md);
          color: #e0e0e0;
        }

        .iframe-container {
          border: 1px solid #333;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          min-height: 500px;
          background-color: #242424;

          .form-iframe {
            width: 100%;
            height: 100%;
            min-height: 500px;
          }
        }
      }

      .field-mapping {
        margin-bottom: var(--spacing-lg);
        background-color: transparent;

        .mapping-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          margin-bottom: var(--spacing-md);
          color: #e0e0e0;
        }

        .mapping-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #333;
          border-radius: var(--border-radius-md);
          padding: var(--spacing-sm);
          background-color: #242424;

          .mapping-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
            padding: var(--spacing-xs);
            background-color: #2a2a2a;
            border-radius: var(--border-radius-sm);

            .form-field {
              flex: 1;
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);

              .field-name {
                color: #e0e0e0;
              }
            }

            .account-field {
              flex: 1;

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
            }
          }
        }
      }

      .fill-settings {
        margin-bottom: var(--spacing-lg);
        background-color: transparent;

        .settings-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          margin-bottom: var(--spacing-md);
          color: #e0e0e0;
        }

        .settings-form {
          display: flex;
          gap: var(--spacing-md);
          background-color: transparent;

          .unit {
            margin-left: var(--spacing-xs);
            font-size: var(--font-size-sm);
            color: #b0b0b0;
          }
        }
      }

      .fill-actions {
        display: flex;
        gap: var(--spacing-md);
        margin-top: var(--spacing-lg);
        background-color: transparent;

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
      background-color: transparent;
    }

    .field-mapping-edit {
      background-color: transparent;

      .mapping-item-edit {
        margin-bottom: var(--spacing-md);
        padding: var(--spacing-sm);
        background-color: #2c2c2c;
        border-radius: var(--border-radius-md);

        .el-form {
          background-color: transparent;

          .el-form-item {
            background-color: transparent;

            .el-form-item__label {
              color: #b0b0b0;
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
          }
        }
      }

      .add-mapping-button {
        background-color: transparent;
      }
    }

    .fill-progress {
      background-color: transparent;

      .progress-info {
        margin-top: var(--spacing-md);
        margin-bottom: var(--spacing-md);
        background-color: transparent;

        .current-status {
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
          color: #e0e0e0;
        }

        .fill-stats {
          font-size: var(--font-size-sm);
          color: #b0b0b0;
        }
      }

      .log-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #333;
        border-radius: var(--border-radius-md);
        padding: var(--spacing-sm);
        background-color: #242424;

        .log-item {
          display: block;
          margin-bottom: var(--spacing-xs);
          padding: var(--spacing-xs);
          border-radius: var(--border-radius-sm);

          &.success {
            background-color: rgba(103, 194, 58, 0.2);
            color: #67c23a;
          }

          &.error {
            background-color: rgba(245, 108, 108, 0.2);
            color: #f56c6c;
          }

          .log-time {
            font-size: var(--font-size-xs);
            color: #b0b0b0;
            margin-right: var(--spacing-sm);
          }

          .log-content {
            color: inherit;
          }
        }
      }
    }

    // Element Plus 组件样式覆盖
    .el-select {
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
    }

    .el-input {
      .el-input__wrapper {
        background-color: #2a2a2a;
        border-color: #333;
        box-shadow: none;

        .el-input__inner {
          color: #e0e0e0;
        }

        &:hover {
          border-color: #444;
        }

        &.is-focus {
          border-color: #409EFF;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }

    .el-checkbox {
      .el-checkbox__label {
        color: #e0e0e0;
      }

      .el-checkbox__input {
        .el-checkbox__inner {
          border-color: #409eff;
          background-color: #2c2c2c;

          &:hover {
            border-color: #66b1ff;
          }
        }

        &.is-checked {
          .el-checkbox__inner {
            border-color: #409eff;
            background-color: #409eff;
          }
        }
      }
    }

    .el-radio {
      .el-radio__label {
        color: #e0e0e0;
      }

      .el-radio__input {
        .el-radio__inner {
          border-color: #409eff;
          background-color: #2c2c2c;

          &:hover {
            border-color: #66b1ff;
          }
        }

        &.is-checked {
          .el-radio__inner {
            border-color: #409eff;
            background-color: #409eff;
          }
        }
      }
    }

    .el-dialog {
      background-color: #242424;
      border-color: #333;

      .el-dialog__header {
        border-bottom: 1px solid #333;

        .el-dialog__title {
          color: #e0e0e0;
        }
      }

      .el-dialog__body {
        color: #e0e0e0;
      }

      .el-dialog__footer {
        border-top: 1px solid #333;
      }
    }

    .el-empty {
      .el-empty__description {
        color: #b0b0b0;
      }
    }

    .el-button {
      &:not(.el-button--primary) {
        background-color: #2a2a2a;
        border-color: #333;
        color: #e0e0e0;

        &:hover {
          background-color: #2c2c2c;
          border-color: #444;
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

    .el-switch {
      .el-switch__core {
        background-color: #333;

        &:checked {
          background-color: #409EFF;
        }
      }
    }
  }
}
</style>
