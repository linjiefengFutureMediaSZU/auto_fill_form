<template>
  <div class="data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ t('data.title') }}</h2>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="data-tabs">
      <!-- 填报数据管理标签页 -->
      <el-tab-pane :label="t('data.fillData')" name="fillData">
        <div class="fill-data-management">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">{{ t('data.fillDataOverview') }}</h3>
              <div class="header-actions">
                <el-button type="primary" @click="handleExportFillData">
                  <el-icon><Download /></el-icon>
                  {{ t('data.exportData') }}
                </el-button>
              </div>
            </div>

            <!-- 数据统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-value">{{ totalFillCount }}</div>
                <div class="stat-label">{{ t('data.totalFillCount') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ successFillCount }}</div>
                <div class="stat-label">{{ t('data.successCount') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ failFillCount }}</div>
                <div class="stat-label">{{ t('data.failCount') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ successRate }}%</div>
                <div class="stat-label">{{ t('data.successRate') }}</div>
              </div>
            </div>

            <!-- 每日填报数量折线图 -->
            <div class="fill-chart">
              <h4 class="chart-title">{{ t('data.dailyFillCount') }}</h4>
              <div ref="fillDataChartRef" class="chart-container"></div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 备份管理标签页 -->
      <el-tab-pane :label="t('data.backupManagement')" name="backup">
        <div class="backup-management">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">{{ t('data.backupList') }}</h3>
              <div class="header-actions">
                <el-button type="primary" @click="handleManualBackup">
                  <el-icon><Upload /></el-icon>
                  {{ t('data.manualBackup') }}
                </el-button>
                <el-button @click="openBackupSettingsDialog">
                  <el-icon><Setting /></el-icon>
                  {{ t('data.backupSettings') }}
                </el-button>
              </div>
            </div>

            <!-- 备份列表 -->
            <div class="backup-list">
              <el-table
                v-loading="backupLoading"
                :data="backups"
                style="width: 100%"
                border
              >
                <el-table-column prop="backup_time" :label="t('data.backupTime')" width="180">
                  <template #default="scope">
                    {{ formatDateTime(scope.row.backup_time) }}
                  </template>
                </el-table-column>
                <el-table-column prop="backup_path" :label="t('data.backupPath')" min-width="250">
                  <template #default="scope">
                    <el-popover
                      placement="top"
                      :width="400"
                      trigger="hover"
                    >
                      <template #reference>
                        <span class="backup-path">{{ scope.row.backup_path }}</span>
                      </template>
                      <div class="backup-path-popover">
                        <p>{{ scope.row.backup_path }}</p>
                        <el-button
                          size="small"
                          type="primary"
                          @click="copyBackupPath(scope.row.backup_path)"
                        >
                          <el-icon><DocumentCopy /></el-icon>
                          {{ t('data.copyPath') }}
                        </el-button>
                      </div>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column prop="backup_size" :label="t('data.backupSize')" width="100">
                  <template #default="scope">
                    {{ scope.row.backup_size }}
                  </template>
                </el-table-column>
                <el-table-column :label="t('data.includedData')" width="200">
                  <template #default="scope">
                    <div class="backup-data-info">
                      <div>{{ t('data.account') }}: {{ scope.row.account_count }} </div>
                      <div>{{ t('data.form') }}: {{ scope.row.template_count }} </div>
                      <div>{{ t('data.log') }}: {{ scope.row.log_count }} </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :label="t('data.operation')" width="150" fixed="right">
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="primary"
                      @click="handleRestoreBackup(scope.row)"
                    >
                      <el-icon><Download /></el-icon>
                      {{ t('data.restore') }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="handleDeleteBackup(scope.row.id)"
                    >
                      <el-icon><Delete /></el-icon>
                      {{ t('data.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 空状态 -->
              <div v-if="backups.length === 0" class="empty-state">
                <el-empty :description="t('data.noBackup')" />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 日志管理标签页 -->
      <el-tab-pane :label="t('data.logManagement')" name="log">
        <div class="log-management">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">{{ t('data.fillLog') }}</h3>
              <div class="header-actions">
                <el-button @click="handleExportLogs">
                  <el-icon><Download /></el-icon>
                  {{ t('data.exportLog') }}
                </el-button>
                <el-button type="danger" @click="handleCleanLogs">
                  <el-icon><Delete /></el-icon>
                  {{ t('data.cleanLog') }}
                </el-button>
              </div>
            </div>

            <!-- 日志搜索筛选 -->
            <el-form :inline="true" :model="logSearchForm" class="log-search-form">
              <el-form-item :label="t('data.resultFilter')">
                <el-select v-model="logSearchForm.fill_result" :placeholder="t('data.selectResult')" clearable>
                  <el-option :label="t('data.success')" value="成功" />
                  <el-option :label="t('data.fail')" value="失败" />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('data.timeRange')">
                <el-date-picker
                  v-model="logSearchForm.timeRange"
                  type="daterange"
                  :range-separator="t('to')"
                  :start-placeholder="t('data.startDate')"
                  :end-placeholder="t('data.endDate')"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleLogSearch">
                  <el-icon><Search /></el-icon>
                  {{ t('data.search') }}
                </el-button>
                <el-button @click="resetLogSearch">
                  <el-icon><Refresh /></el-icon>
                  {{ t('data.reset') }}
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 日志列表 -->
            <div class="log-list">
              <el-table
                v-loading="logLoading"
                :data="filteredLogs"
                style="width: 100%"
                border
              >
                <el-table-column prop="fill_time" :label="t('data.fillTime')" width="180">
                  <template #default="scope">
                    {{ formatDateTime(scope.row.fill_time) }}
                  </template>
                </el-table-column>
                <el-table-column :label="t('data.accountInfo')" width="150">
                  <template #default="scope">
                    <div class="account-info">
                      {{ getAccountInfo(scope.row.account_id) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :label="t('data.formInfo')" width="200">
                  <template #default="scope">
                    <div class="form-info">
                      {{ getFormInfo(scope.row.template_id) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="fill_result" :label="t('data.fillResult')" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.fill_result === '成功' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.fill_result === '成功' ? t('data.success') : t('data.fail') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="fail_reason" :label="t('data.failReason')" min-width="200">
                  <template #default="scope">
                    {{ scope.row.fail_reason || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="submit_count" :label="t('data.submitCount')" width="100">
                  <template #default="scope">
                    {{ scope.row.submit_count }}
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 空状态 -->
              <div v-if="filteredLogs.length === 0" class="empty-state">
                <el-empty :description="t('data.noLog')" />
              </div>
            </div>

            <!-- 每日填报数量折线图 -->
            <div class="fill-chart">
              <h4 class="chart-title">{{ t('data.dailyFillCount') }}</h4>
              <div ref="fillChartRef" class="chart-container"></div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 备份设置弹窗 -->
    <el-dialog
      v-model="backupSettingsDialogVisible"
      :title="t('data.backupSettings')"
      width="500px"
    >
      <el-form
        :model="backupSettings"
        :rules="backupSettingsRules"
        ref="backupSettingsFormRef"
        label-width="120px"
      >
        <el-form-item :label="t('data.scheduledBackup')">
          <el-switch v-model="backupSettings.enabled" />
        </el-form-item>
        <el-form-item :label="t('data.backupTime')" v-if="backupSettings.enabled">
          <el-time-picker
            v-model="backupSettings.time"
            format="HH:mm"
            value-format="HH:mm"
            :placeholder="t('data.selectBackupTime')"
          />
        </el-form-item>
        <el-form-item :label="t('data.backupFrequency')" v-if="backupSettings.enabled">
          <el-select v-model="backupSettings.frequency" :placeholder="t('data.selectBackupFrequency')">
            <el-option :label="t('data.daily')" value="daily" />
            <el-option :label="t('data.weekly')" value="weekly" />
            <el-option :label="t('data.monthly')" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('data.backupPath')" v-if="backupSettings.enabled">
          <el-input v-model="backupSettings.path" :placeholder="t('data.enterBackupPath')" />
          <div class="form-tip">{{ t('data.pathTip') }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="backupSettingsDialogVisible = false">{{ t('data.cancel') }}</el-button>
          <el-button type="primary" @click="saveBackupSettings">{{ t('data.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 恢复备份弹窗 -->
    <el-dialog
      v-model="restoreDialogVisible"
      :title="t('data.restore')"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="restore-dialog">
        <div class="backup-info">
          <h4>{{ t('data.backupInfo') }}</h4>
          <div class="info-item">
            <span class="label">{{ t('data.backupTime') }}：</span>
            <span class="value">{{ selectedBackup?.backup_time }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('data.backupPath') }}：</span>
            <span class="value">{{ selectedBackup?.backup_path }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('data.includedData') }}：</span>
            <span class="value">
              {{ t('data.account') }} {{ selectedBackup?.account_count }} ,
              {{ t('data.form') }} {{ selectedBackup?.template_count }} ,
              {{ t('data.log') }} {{ selectedBackup?.log_count }} 
            </span>
          </div>
        </div>
        <div class="restore-warning">
          <el-alert
            :title="t('data.restoreWarning')"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>{{ t('data.restoreWarningContent') }}</p>
              <p>{{ t('data.restoreSuggestion') }}</p>
            </template>
          </el-alert>
        </div>
        <div class="restore-options">
          <h4>{{ t('data.restoreOptions') }}</h4>
          <el-checkbox v-model="restoreOptions.allData">{{ t('data.restoreAll') }}</el-checkbox>
          <el-checkbox-group v-model="restoreOptions.dataTypes" v-if="!restoreOptions.allData">
            <el-checkbox label="accounts">{{ t('data.accountInfo') }}</el-checkbox>
            <el-checkbox label="templates">{{ t('data.formTemplate') }}</el-checkbox>
            <el-checkbox label="logs">{{ t('data.fillLog') }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="restoreDialogVisible = false">{{ t('data.cancel') }}</el-button>
          <el-button type="danger" @click="confirmRestore">{{ t('data.confirmRestore') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDataStore, useAccountStore, useFormStore } from '../../stores'
import { useSettingsStore } from '../../stores/settings'
import { Upload, Setting, Download, Delete, DocumentCopy, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 状态管理
const dataStore = useDataStore()
const accountStore = useAccountStore()
const formStore = useFormStore()
const settingsStore = useSettingsStore()

// 响应式数据
const activeTab = ref('fillData')
const backupLoading = ref(false)
const logLoading = ref(false)
const backupSettingsDialogVisible = ref(false)
const restoreDialogVisible = ref(false)
const selectedBackup = ref(null)
const fillChartRef = ref(null)
const fillDataChartRef = ref(null)
let fillChart = null
let fillDataChart = null

// 日志搜索表单
const logSearchForm = reactive({
  fill_result: '',
  timeRange: []
})

// 备份设置
const backupSettings = reactive({
  enabled: true,
  time: '00:00',
  frequency: 'daily',
  path: 'D:/backup/'
})

// 备份设置验证规则
const backupSettingsRules = computed(() => ({
  time: [{ required: true, message: t('data.selectBackupTime'), trigger: 'change' }],
  frequency: [{ required: true, message: t('data.selectBackupFrequency'), trigger: 'change' }],
  path: [{ required: true, message: t('data.enterBackupPath'), trigger: 'blur' }]
}))

// 恢复选项
const restoreOptions = reactive({
  allData: true,
  dataTypes: ['accounts', 'templates', 'logs']
})

// 表单引用
const backupSettingsFormRef = ref(null)

// 计算属性
const backups = computed(() => dataStore.backups)
const logs = computed(() => dataStore.logs)

// 筛选后的日志
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // 结果筛选
    if (logSearchForm.fill_result && log.fill_result !== logSearchForm.fill_result) {
      return false
    }
    // 时间范围筛选
    if (logSearchForm.timeRange && logSearchForm.timeRange.length === 2) {
      const logDate = new Date(log.fill_time).toISOString().split('T')[0]
      const startDate = logSearchForm.timeRange[0]
      const endDate = logSearchForm.timeRange[1]
      if (logDate < startDate || logDate > endDate) {
        return false
      }
    }
    return true
  })
})

// 填报数据统计
const totalFillCount = computed(() => {
  return logs.value.length
})

const successFillCount = computed(() => {
  return logs.value.filter(log => log.fill_result === '成功').length
})

const failFillCount = computed(() => {
  return logs.value.filter(log => log.fill_result === '失败').length
})

const successRate = computed(() => {
  if (logs.value.length === 0) return 0
  return Math.round((successFillCount.value / totalFillCount.value) * 100)
})

// 每日填报数据
const dailyFillData = computed(() => {
  const dailyMap = new Map()
  
  if (!logs.value || !Array.isArray(logs.value)) return []

  // 按日期分组
  logs.value.forEach(log => {
    if (!log || !log.fill_time) return
    try {
      const dateObj = new Date(log.fill_time)
      if (isNaN(dateObj.getTime())) return
      const date = dateObj.toISOString().split('T')[0]
      if (dailyMap.has(date)) {
        dailyMap.set(date, dailyMap.get(date) + 1)
      } else {
        dailyMap.set(date, 1)
      }
    } catch (e) {
      console.warn('Error parsing log date:', log, e)
    }
  })
  
  // 转换为数组并排序
  const sortedData = Array.from(dailyMap.entries())
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
  
  // 生成最近7天的数据（如果没有数据则填充0）
  const last7Days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = dailyMap.get(dateStr) || 0
    last7Days.push({ date: dateStr, count })
  }
  
  return last7Days
})

// 方法
// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    // Use dynamic locale for date formatting
    return date.toLocaleString(locale.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return '-'
  }
}

// 获取账号信息
const getAccountInfo = (accountId) => {
  if (!accountId) return t('data.unknownAccount')
  const accounts = accountStore.accounts || []
  const account = accounts.find(a => a.id === accountId)
  return account ? (account.account_nickname || t('data.unnamedAccount')) : t('data.unknownAccount')
}

// 获取表单信息
const getFormInfo = (templateId) => {
  if (!templateId) return t('data.unknownForm')
  const templates = formStore.templates || []
  const template = templates.find(t => t.id === templateId)
  return template ? (template.template_name || t('data.unnamedForm')) : t('data.unknownForm')
}

// 手动备份
const handleManualBackup = () => {
  backupLoading.value = true
  // 模拟备份过程
  setTimeout(() => {
    const newBackup = {
      id: Date.now(),
      backup_time: new Date().toISOString(),
      backup_path: `D:/backup/backup_${Date.now()}.json`,
      backup_size: '1.5 MB',
      account_count: accountStore.accounts.length,
      template_count: formStore.templates.length,
      log_count: dataStore.logs.length
    }
    dataStore.addBackup(newBackup)
    backupLoading.value = false
    ElMessage.success(t('data.manualBackupSuccess'))
  }, 1500)
}

// 打开备份设置弹窗
const openBackupSettingsDialog = () => {
  // 复制当前设置到表单
  Object.assign(backupSettings, dataStore.backupSettings)
  backupSettingsDialogVisible.value = true
}

// 保存备份设置
const saveBackupSettings = async () => {
  if (!backupSettingsFormRef.value) return
  
  try {
    if (backupSettings.enabled) {
      await backupSettingsFormRef.value.validate()
    }
    
    dataStore.updateBackupSettings(backupSettings)
    backupSettingsDialogVisible.value = false
    ElMessage.success(t('settings.saveSuccess')) // Reuse settings key if possible or add data key
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// 恢复备份
const handleRestoreBackup = (backup) => {
  selectedBackup.value = backup
  restoreOptions.allData = true
  restoreOptions.dataTypes = ['accounts', 'templates', 'logs']
  restoreDialogVisible.value = true
}

// 确认恢复
const confirmRestore = () => {
  ElMessageBox.confirm(t('data.restoreWarningContent'), t('data.restoreWarning'), {
    confirmButtonText: t('data.confirmRestore'),
    cancelButtonText: t('data.cancel'),
    type: 'warning'
  }).then(() => {
    // 模拟恢复过程
    restoreDialogVisible.value = false
    ElMessage.success(t('data.restore') + t('data.success')) // Simplified
  }).catch(() => {
    // 取消恢复
  })
}

// 删除备份
const handleDeleteBackup = (id) => {
  ElMessageBox.confirm(t('data.restoreWarningContent'), t('data.restoreWarning'), { // Reuse warning for delete
     confirmButtonText: t('data.delete'),
    cancelButtonText: t('data.cancel'),
    type: 'warning'
  }).then(() => {
    dataStore.deleteBackup(id)
    ElMessage.success(t('data.delete') + t('data.success'))
  }).catch(() => {
    // 取消删除
  })
}

// 复制备份路径
const copyBackupPath = (path) => {
  navigator.clipboard.writeText(path).then(() => {
    ElMessage.success(t('data.copyPath') + t('data.success'))
  }).catch(() => {
    ElMessage.error(t('data.copyPath') + t('data.fail'))
  })
}

// 搜索日志
const handleLogSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 重置日志搜索
const resetLogSearch = () => {
  logSearchForm.fill_result = ''
  logSearchForm.timeRange = []
}

// 导出日志
const handleExportLogs = () => {
  if (filteredLogs.value.length === 0) {
    ElMessage.warning(t('data.noLog'))
    return
  }
  ElMessage.info(t('data.exportLog') + '...')
}

// 清理日志
const handleCleanLogs = () => {
  if (logs.value.length === 0) {
    ElMessage.warning(t('data.noLog'))
    return
  }
  
  ElMessageBox.confirm(t('data.restoreWarningContent'), t('data.restoreWarning'), { // Reuse warning
    confirmButtonText: t('data.cleanLog'),
    cancelButtonText: t('data.cancel'),
    type: 'warning'
  }).then(() => {
    // 模拟清理过程
    dataStore.cleanExpiredLogs(0) // 清理所有日志
    ElMessage.success(t('data.cleanLog') + t('data.success'))
    // 更新图表
    updateFillChart()
    updateFillDataChart()
  }).catch(() => {
    // 取消清理
  })
}

// 导出填报数据
const handleExportFillData = () => {
  if (logs.value.length === 0) {
    ElMessage.warning(t('data.noLog'))
    return
  }
  ElMessage.info(t('data.exportData') + '...')
}

// 初始化填报数据图表（日志管理标签页）
const initFillChart = () => {
  try {
    if (fillChartRef.value && activeTab.value === 'log') {
      // 如果已经初始化过，先销毁
      if (fillChart) {
        fillChart.dispose()
      }
      fillChart = echarts.init(fillChartRef.value)
      updateFillChart()
    }
  } catch (error) {
    console.error('Failed to init fill chart:', error)
  }
}

// 更新填报数据图表（日志管理标签页）
const updateFillChart = () => {
  if (!fillChart) return
  
  try {
    const data = dailyFillData.value
    const dates = data.map(item => item.date)
    const counts = data.map(item => item.count)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: `{b}: {c} ${t('data.times')}`
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          name: t('data.dailyFillCount'),
          type: 'line',
          data: counts,
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ])
          }
        }
      ]
    }
    
    fillChart.setOption(option)
  } catch (error) {
    console.error('Failed to update fill chart:', error)
  }
}

// 初始化填报数据管理图表
const initFillDataChart = () => {
  try {
    if (fillDataChartRef.value && activeTab.value === 'fillData') {
      // 如果已经初始化过，先销毁
      if (fillDataChart) {
        fillDataChart.dispose()
      }
      fillDataChart = echarts.init(fillDataChartRef.value)
      updateFillDataChart()
    }
  } catch (error) {
    console.error('Failed to init fill data chart:', error)
  }
}

// 更新填报数据管理图表
const updateFillDataChart = () => {
  if (!fillDataChart) return
  
  try {
    const data = dailyFillData.value
    const dates = data.map(item => item.date)
    const counts = data.map(item => item.count)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: `{b}: {c} ${t('data.times')}`
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          name: t('data.dailyFillCount'),
          type: 'line',
          data: counts,
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ])
          }
        }
      ]
    }
    
    fillDataChart.setOption(option)
  } catch (error) {
    console.error('Failed to update fill data chart:', error)
  }
}

// 监听窗口大小变化
const handleResize = () => {
  try {
    if (fillChart) {
      fillChart.resize()
    }
    if (fillDataChart) {
      fillDataChart.resize()
    }
  } catch (error) {
    console.error('Failed to resize charts:', error)
  }
}

// 监听 Tab 切换
watch(activeTab, (newTab) => {
  nextTick(() => {
    if (newTab === 'fillData') {
      if (!fillDataChart) {
        initFillDataChart()
      } else {
        fillDataChart.resize()
      }
    } else if (newTab === 'log') {
      if (!fillChart) {
        initFillChart()
      } else {
        fillChart.resize()
      }
    }
  })
})

// Watch for locale changes to update charts
watch(locale, () => {
  updateFillChart()
  updateFillDataChart()
})

// 生命周期
onMounted(() => {
  try {
    // 初始化数据
    if (backups.value.length === 0) {
      // 添加默认备份记录
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    
    // 初始化图表
    nextTick(() => {
      initFillDataChart()
    })
  } catch (error) {
    console.error('Mounted error:', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (fillChart) {
    fillChart.dispose()
    fillChart = null
  }
  if (fillDataChart) {
    fillDataChart.dispose()
    fillDataChart = null
  }
})
</script>

<style scoped>
.data-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.data-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.subtitle {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 图表样式 */
.fill-chart {
  margin-top: 30px;
}

.chart-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
}

.chart-container {
  height: 400px;
  width: 100%;
}

/* 备份列表样式 */
.backup-path {
  color: #409EFF;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

.backup-path-popover {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.backup-path-popover p {
  margin: 0;
  word-break: break-all;
}

.backup-data-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

/* 日志管理样式 */
.log-search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.account-info, .form-info {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 40px 0;
}

/* 弹窗样式 */
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}

.restore-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.backup-info {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
}

.backup-info h4, .restore-options h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #909399;
  width: 80px;
}

.info-item .value {
  color: #606266;
  flex: 1;
}

.restore-warning {
  margin: 10px 0;
}

.restore-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>