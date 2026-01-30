<template>
  <div class="data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">数据管理</h2>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="data-tabs">
      <!-- 填报数据管理标签页 -->
      <el-tab-pane label="填报数据管理" name="fillData">
        <div class="fill-data-management">
          <div class="card">
            <div class="section-header">
              <h3 class="subtitle">填报数据概览</h3>
              <div class="header-actions">
                <el-button type="primary" @click="handleExportFillData">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-button>
              </div>
            </div>

            <!-- 数据统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-value">{{ totalFillCount }}</div>
                <div class="stat-label">总填报次数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ successFillCount }}</div>
                <div class="stat-label">成功次数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ failFillCount }}</div>
                <div class="stat-label">失败次数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ successRate }}%</div>
                <div class="stat-label">成功率</div>
              </div>
            </div>

            <!-- 每日填报数量折线图 -->
            <div class="fill-chart">
              <h4 class="chart-title">每日填报表单数量</h4>
              <div ref="fillDataChartRef" class="chart-container"></div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 备份管理标签页 -->
      <el-tab-pane label="备份管理" name="backup">
        <div class="backup-management">
          <div class="card">
            <div class="section-header">
              <h3 class="subtitle">备份列表</h3>
              <div class="header-actions">
                <el-button type="primary" @click="handleManualBackup">
                  <el-icon><Upload /></el-icon>
                  手动备份
                </el-button>
                <el-button @click="openBackupSettingsDialog">
                  <el-icon><Setting /></el-icon>
                  备份设置
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
                <el-table-column prop="backup_time" label="备份时间" width="180">
                  <template #default="scope">
                    {{ formatDateTime(scope.row.backup_time) }}
                  </template>
                </el-table-column>
                <el-table-column prop="backup_path" label="备份路径" min-width="250">
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
                          size="mini"
                          type="primary"
                          @click="copyBackupPath(scope.row.backup_path)"
                        >
                          <el-icon><DocumentCopy /></el-icon>
                  复制路径
                        </el-button>
                      </div>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column prop="backup_size" label="备份大小" width="100">
                  <template #default="scope">
                    {{ scope.row.backup_size }}
                  </template>
                </el-table-column>
                <el-table-column label="包含数据" width="200">
                  <template #default="scope">
                    <div class="backup-data-info">
                      <div>账号: {{ scope.row.account_count }} 个</div>
                      <div>表单: {{ scope.row.template_count }} 个</div>
                      <div>日志: {{ scope.row.log_count }} 条</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="primary"
                      @click="handleRestoreBackup(scope.row)"
                    >
                      <el-icon><Download /></el-icon>
                      恢复
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="handleDeleteBackup(scope.row.id)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 空状态 -->
              <div v-if="backups.length === 0" class="empty-state">
                <el-empty description="暂无备份记录" />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 日志管理标签页 -->
      <el-tab-pane label="日志管理" name="log">
        <div class="log-management">
          <div class="card">
            <div class="section-header">
              <h3 class="subtitle">填写日志</h3>
              <div class="header-actions">
                <el-button @click="handleExportLogs">
                  <el-icon><Download /></el-icon>
                  导出日志
                </el-button>
                <el-button type="danger" @click="handleCleanLogs">
                  <el-icon><Delete /></el-icon>
                  清理日志
                </el-button>
              </div>
            </div>

            <!-- 日志搜索筛选 -->
            <el-form :inline="true" :model="logSearchForm" class="log-search-form">
              <el-form-item label="结果筛选">
                <el-select v-model="logSearchForm.fill_result" placeholder="选择结果" clearable>
                  <el-option label="成功" value="成功" />
                  <el-option label="失败" value="失败" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="logSearchForm.timeRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleLogSearch">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetLogSearch">
                  <el-icon><Refresh /></el-icon>
                  重置
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
                <el-table-column prop="fill_time" label="填写时间" width="180">
                  <template #default="scope">
                    {{ formatDateTime(scope.row.fill_time) }}
                  </template>
                </el-table-column>
                <el-table-column label="账号信息" width="150">
                  <template #default="scope">
                    <div class="account-info">
                      {{ getAccountInfo(scope.row.account_id) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="表单信息" width="200">
                  <template #default="scope">
                    <div class="form-info">
                      {{ getFormInfo(scope.row.template_id) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="fill_result" label="填写结果" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.fill_result === '成功' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.fill_result }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="fail_reason" label="失败原因" min-width="200">
                  <template #default="scope">
                    {{ scope.row.fail_reason || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="submit_count" label="提交次数" width="100">
                  <template #default="scope">
                    {{ scope.row.submit_count }}
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 空状态 -->
              <div v-if="filteredLogs.length === 0" class="empty-state">
                <el-empty description="暂无日志记录" />
              </div>
            </div>

            <!-- 每日填报数量折线图 -->
            <div class="fill-chart">
              <h4 class="chart-title">每日填报表单数量</h4>
              <div ref="fillChartRef" class="chart-container"></div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 备份设置弹窗 -->
    <el-dialog
      v-model="backupSettingsDialogVisible"
      title="备份设置"
      width="500px"
    >
      <el-form
        :model="backupSettings"
        :rules="backupSettingsRules"
        ref="backupSettingsFormRef"
        label-width="120px"
      >
        <el-form-item label="定时备份">
          <el-switch v-model="backupSettings.enabled" />
        </el-form-item>
        <el-form-item label="备份时间" v-if="backupSettings.enabled">
          <el-time-picker
            v-model="backupSettings.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
          />
        </el-form-item>
        <el-form-item label="备份频率" v-if="backupSettings.enabled">
          <el-select v-model="backupSettings.frequency" placeholder="选择频率">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="备份路径" v-if="backupSettings.enabled">
          <el-input v-model="backupSettings.path" placeholder="请输入备份路径" />
          <div class="form-tip">请确保该路径存在且有写入权限</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="backupSettingsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBackupSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 恢复备份弹窗 -->
    <el-dialog
      v-model="restoreDialogVisible"
      title="恢复备份"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="restore-dialog">
        <div class="backup-info">
          <h4>备份信息</h4>
          <div class="info-item">
            <span class="label">备份时间：</span>
            <span class="value">{{ selectedBackup?.backup_time }}</span>
          </div>
          <div class="info-item">
            <span class="label">备份路径：</span>
            <span class="value">{{ selectedBackup?.backup_path }}</span>
          </div>
          <div class="info-item">
            <span class="label">包含数据：</span>
            <span class="value">
              账号 {{ selectedBackup?.account_count }} 个，
              表单 {{ selectedBackup?.template_count }} 个，
              日志 {{ selectedBackup?.log_count }} 条
            </span>
          </div>
        </div>
        <div class="restore-warning">
          <el-alert
            title="恢复警告"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>恢复备份将覆盖当前所有数据，请谨慎操作！</p>
              <p>建议在恢复前先进行一次手动备份。</p>
            </template>
          </el-alert>
        </div>
        <div class="restore-options">
          <h4>恢复选项</h4>
          <el-checkbox v-model="restoreOptions.allData">恢复全部数据</el-checkbox>
          <el-checkbox-group v-model="restoreOptions.dataTypes" v-if="!restoreOptions.allData">
            <el-checkbox label="accounts">账号信息</el-checkbox>
            <el-checkbox label="templates">表单模板</el-checkbox>
            <el-checkbox label="logs">填写日志</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="restoreDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmRestore">确认恢复</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useDataStore, useAccountStore, useFormStore } from '../../stores'
import { useSettingsStore } from '../../stores/settings'
import { Upload, Setting, Download, Delete, DocumentCopy, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

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
const backupSettingsRules = {
  time: [{ required: true, message: '请选择备份时间', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择备份频率', trigger: 'change' }],
  path: [{ required: true, message: '请输入备份路径', trigger: 'blur' }]
}

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
  
  // 按日期分组
  logs.value.forEach(log => {
    const date = new Date(log.fill_time).toISOString().split('T')[0]
    if (dailyMap.has(date)) {
      dailyMap.set(date, dailyMap.get(date) + 1)
    } else {
      dailyMap.set(date, 1)
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
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取账号信息
const getAccountInfo = (accountId) => {
  const account = accountStore.accounts.find(a => a.id === accountId)
  return account ? account.account_nickname : '未知账号'
}

// 获取表单信息
const getFormInfo = (templateId) => {
  const template = formStore.templates.find(t => t.id === templateId)
  return template ? template.template_name : '未知表单'
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
    ElMessage.success('手动备份成功')
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
    ElMessage.success('备份设置保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
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
  ElMessageBox.confirm('确定要恢复此备份吗？恢复后将覆盖当前数据', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟恢复过程
    restoreDialogVisible.value = false
    ElMessage.success('备份恢复成功')
  }).catch(() => {
    // 取消恢复
  })
}

// 删除备份
const handleDeleteBackup = (id) => {
  ElMessageBox.confirm('确定要删除此备份吗？删除后不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataStore.deleteBackup(id)
    ElMessage.success('备份删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 复制备份路径
const copyBackupPath = (path) => {
  navigator.clipboard.writeText(path).then(() => {
    ElMessage.success('路径已复制')
  }).catch(() => {
    ElMessage.error('复制失败')
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
    ElMessage.warning('暂无日志可导出')
    return
  }
  ElMessage.info('日志导出功能开发中')
}

// 清理日志
const handleCleanLogs = () => {
  if (logs.value.length === 0) {
    ElMessage.warning('暂无日志可清理')
    return
  }
  
  ElMessageBox.confirm('确定要清理所有日志吗？清理后不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟清理过程
    dataStore.cleanExpiredLogs(0) // 清理所有日志
    ElMessage.success('日志清理成功')
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
    ElMessage.warning('暂无数据可导出')
    return
  }
  ElMessage.info('数据导出功能开发中')
}

// 初始化填报数据图表（日志管理标签页）
const initFillChart = () => {
  if (fillChartRef.value) {
    fillChart = echarts.init(fillChartRef.value)
    updateFillChart()
  }
}

// 更新填报数据图表（日志管理标签页）
const updateFillChart = () => {
  if (!fillChart) return
  
  const data = dailyFillData.value
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 次'
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
        name: '填报表单数量',
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
}

// 初始化填报数据管理图表
const initFillDataChart = () => {
  if (fillDataChartRef.value) {
    fillDataChart = echarts.init(fillDataChartRef.value)
    updateFillDataChart()
  }
}

// 更新填报数据管理图表
const updateFillDataChart = () => {
  if (!fillDataChart) return
  
  const data = dailyFillData.value
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 次'
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
        name: '填报表单数量',
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
}

// 监听窗口大小变化
const handleResize = () => {
  if (fillChart) {
    fillChart.resize()
  }
  if (fillDataChart) {
    fillDataChart.resize()
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  if (backups.value.length === 0) {
    // 添加默认备份记录
    const defaultBackup = {
      id: 1,
      backup_time: new Date().toISOString(),
      backup_path: 'D:/backup/backup_default.json',
      backup_size: '1.2 MB',
      account_count: accountStore.accounts.length,
      template_count: formStore.templates.length,
      log_count: dataStore.logs.length
    }
    dataStore.addBackup(defaultBackup)
  }
  
  // 初始化图表
  setTimeout(() => {
    initFillChart()
    initFillDataChart()
  }, 100)
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  if (fillChart) {
    fillChart.dispose()
  }
  if (fillDataChart) {
    fillDataChart.dispose()
  }
})
</script>

<style scoped lang="scss">
.data-page {
  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .data-tabs {
    .el-tabs__content {
      padding-top: var(--spacing-lg);
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);

    .stat-card {
      @include glass-card;
      padding: var(--spacing-lg);
      text-align: center;

      .stat-value {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
      }
    }
  }

  .fill-chart {
    margin-top: var(--spacing-lg);

    .chart-title {
      font-size: var(--font-size-md);
      font-weight: 500;
      margin-bottom: var(--spacing-md);
      color: var(--text-color-primary);
    }

    .chart-container {
      width: 100%;
      height: 300px;
      border-radius: var(--border-radius-xl);
      background-color: var(--bg-color-white);
      box-shadow: var(--box-shadow-light);
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .backup-list,
  .log-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .backup-path {
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
    word-break: break-all;
  }

  .backup-data-info {
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
  }

  .log-search-form {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background-color: var(--bg-color-light);
    border-radius: var(--border-radius-md);
  }

  .empty-state {
    padding: var(--spacing-xl) 0;
  }

  .form-tip {
    font-size: var(--font-size-xs);
    color: var(--text-color-secondary);
    margin-top: var(--spacing-xs);
  }

  .restore-dialog {
    .backup-info {
      margin-bottom: var(--spacing-md);

      h4 {
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
      }

      .info-item {
        margin-bottom: var(--spacing-xs);
        font-size: var(--font-size-sm);

        .label {
          font-weight: 500;
          margin-right: var(--spacing-xs);
        }
      }
    }

    .restore-warning {
      margin-bottom: var(--spacing-md);
    }

    .restore-options {
      h4 {
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
      }

      .el-checkbox {
        display: block;
        margin-bottom: var(--spacing-xs);
      }
    }
  }
}
</style>