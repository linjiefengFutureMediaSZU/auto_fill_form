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

            <!-- 填报数量图表 -->
            <div class="fill-chart">
              <div class="chart-header">
                <h4 class="chart-title">{{ getChartTitle() }}</h4>
                <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="small">
                  <el-radio-button value="daily">{{ t('data.daily') }}</el-radio-button>
                  <el-radio-button value="weekly">{{ t('data.weekly') }}</el-radio-button>
                  <el-radio-button value="monthly">{{ t('data.monthly') }}</el-radio-button>
                  <el-radio-button value="yearly">{{ t('data.yearly') }}</el-radio-button>
                </el-radio-group>
              </div>
              <div ref="fillDataChartRef" class="chart-container"></div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
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
const viewMode = ref('daily')
const backupLoading = ref(false)
const logLoading = ref(false)
const backupSettingsDialogVisible = ref(false)
const restoreDialogVisible = ref(false)
const selectedBackup = ref(null)
const fillChartRef = ref(null)
const fillDataChartRef = ref(null)

// 获取图表标题
const getChartTitle = () => {
  const titles = {
    daily: t('data.dailyFillCount'),
    weekly: t('data.weeklyFillCount'),
    monthly: t('data.monthlyFillCount'),
    yearly: t('data.yearlyFillCount')
  }
  return titles[viewMode.value] || t('data.dailyFillCount')
}

// 处理视图模式切换
const handleViewModeChange = () => {
  updateFillDataChart()
}
let fillChart = null
let fillDataChart = null

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

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

// 分页后的日志
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// 监听筛选结果变化，重置分页
watch(filteredLogs, () => {
  currentPage.value = 1
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
  
  // 生成最近30天的数据（如果没有数据则填充0）
  const last30Days = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = dailyMap.get(dateStr) || 0
    last30Days.push({ date: dateStr, count })
  }
  
  return last30Days
})

// 按周汇总数据
const weeklyFillData = computed(() => {
  const weeklyMap = new Map()
  
  if (!logs.value || !Array.isArray(logs.value)) return []

  logs.value.forEach(log => {
    if (!log || !log.fill_time) return
    try {
      const dateObj = new Date(log.fill_time)
      if (isNaN(dateObj.getTime())) return
      
      // 获取周的起始日期（周一）
      const day = dateObj.getDay() || 7
      const weekStart = new Date(dateObj)
      weekStart.setDate(dateObj.getDate() - day + 1)
      const weekStr = weekStart.toISOString().split('T')[0]
      
      if (weeklyMap.has(weekStr)) {
        weeklyMap.set(weekStr, weeklyMap.get(weekStr) + 1)
      } else {
        weeklyMap.set(weekStr, 1)
      }
    } catch (e) {
      console.warn('Error parsing log date:', log, e)
    }
  })
  
  // 生成最近12周的数据
  const last12Weeks = []
  const today = new Date()
  const dayOfWeek = today.getDay() || 7
  
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek - (i * 7) + 1)
    const weekStr = weekStart.toISOString().split('T')[0]
    
    const count = weeklyMap.get(weekStr) || 0
    last12Weeks.push({ date: weekStr, count })
  }
  
  return last12Weeks
})

// 按月汇总数据
const monthlyFillData = computed(() => {
  const monthlyMap = new Map()
  
  if (!logs.value || !Array.isArray(logs.value)) return []

  logs.value.forEach(log => {
    if (!log || !log.fill_time) return
    try {
      const dateObj = new Date(log.fill_time)
      if (isNaN(dateObj.getTime())) return
      const monthStr = dateObj.toISOString().slice(0, 7)
      
      if (monthlyMap.has(monthStr)) {
        monthlyMap.set(monthStr, monthlyMap.get(monthStr) + 1)
      } else {
        monthlyMap.set(monthStr, 1)
      }
    } catch (e) {
      console.warn('Error parsing log date:', log, e)
    }
  })
  
  // 生成最近12个月的数据
  const last12Months = []
  const today = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStr = monthDate.toISOString().slice(0, 7)
    
    const count = monthlyMap.get(monthStr) || 0
    last12Months.push({ date: monthStr, count })
  }
  
  return last12Months
})

// 按年汇总数据
const yearlyFillData = computed(() => {
  const yearlyMap = new Map()
  
  if (!logs.value || !Array.isArray(logs.value)) return []

  logs.value.forEach(log => {
    if (!log || !log.fill_time) return
    try {
      const dateObj = new Date(log.fill_time)
      if (isNaN(dateObj.getTime())) return
      const yearStr = dateObj.getFullYear().toString()
      
      if (yearlyMap.has(yearStr)) {
        yearlyMap.set(yearStr, yearlyMap.get(yearStr) + 1)
      } else {
        yearlyMap.set(yearStr, 1)
      }
    } catch (e) {
      console.warn('Error parsing log date:', log, e)
    }
  })
  
  // 生成最近5年的数据
  const last5Years = []
  const today = new Date()
  
  for (let i = 4; i >= 0; i--) {
    const year = today.getFullYear() - i
    const yearStr = year.toString()
    
    const count = yearlyMap.get(yearStr) || 0
    last5Years.push({ date: yearStr, count })
  }
  
  return last5Years
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
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
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
    }).then(async () => {
      // 执行清理过程
      await dataStore.cleanExpiredLogs(0) // 清理所有日志
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
    
    const isDark = settingsStore.general.theme === 'dark'
    const textColor = isDark ? '#f5f5f7' : '#606266'
    const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#eee'

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
        data: dates,
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
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
    // 根据视图模式获取对应的数据
    let data = []
    let seriesName = ''
    let boundaryGap = false
    
    switch (viewMode.value) {
      case 'daily':
        data = dailyFillData.value
        seriesName = t('data.dailyFillCount')
        boundaryGap = false
        break
      case 'weekly':
        data = weeklyFillData.value
        seriesName = t('data.weeklyFillCount')
        boundaryGap = true
        break
      case 'monthly':
        data = monthlyFillData.value
        seriesName = t('data.monthlyFillCount')
        boundaryGap = true
        break
      case 'yearly':
        data = yearlyFillData.value
        seriesName = t('data.yearlyFillCount')
        boundaryGap = true
        break
      default:
        data = dailyFillData.value
        seriesName = t('data.dailyFillCount')
    }
    
    const dates = data.map(item => item.date)
    const counts = data.map(item => item.count)
    
    const isDark = settingsStore.general.theme === 'dark'
    const textColor = isDark ? '#f5f5f7' : '#606266'
    const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#eee'

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
        boundaryGap: boundaryGap,
        data: dates,
        axisLabel: { color: textColor, rotate: viewMode.value === 'yearly' ? 0 : 0 },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        {
          name: seriesName,
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

// Watch for theme changes to update charts
watch(() => settingsStore.general.theme, () => {
  if (fillChart) {
    fillChart.dispose()
    fillChart = echarts.init(fillChartRef.value)
  }
  if (fillDataChart) {
    fillDataChart.dispose()
    fillDataChart = echarts.init(fillDataChartRef.value)
  }
  updateFillChart()
  updateFillDataChart()
})

// Lifecycle
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

<style scoped lang="scss">
.data-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部标题区 */
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

.data-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 0; /* Add this to allow flex shrink/grow properly */
:deep(.el-tabs__content) {
  flex: 1;
  padding: 20px 20px 0 20px;
  overflow: hidden;
  height: 100%;
}/* Ensure content takes full height */
}

:deep(.el-tab-pane) {
  height: 100%; /* Ensure tab pane takes full height */
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
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
  color: var(--text-primary);
}

.fill-data-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fill-data-management .glass-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.stat-card {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-color);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 图表样式 */
.fill-chart {
  margin-top: 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.chart-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

/* 备份列表样式 */
.backup-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.backup-management .glass-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.backup-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.backup-path {
  color: var(--accent-color);
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
  color: var(--text-primary);
}

.backup-data-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 日志管理样式 */
.log-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-management .glass-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.log-search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
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
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 4px;
}

.restore-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.backup-info {
  background-color: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}

.backup-info h4, .restore-options h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: var(--text-primary);
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
  color: var(--text-secondary);
  width: 80px;
}

.info-item .value {
  color: var(--text-primary);
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