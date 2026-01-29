<template>
  <div class="account-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">账号管理</h2>
    </div>



    <!-- 搜索筛选区 -->
    <div class="search-filter card" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="账号昵称/博主姓名"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="账号类型">
          <el-select v-model="searchForm.account_type" placeholder="选择账号类型" clearable style="width: 150px;">
            <el-option label="抖音" value="douyin" />
            <el-option label="小红书" value="xiaohongshu" />
            <el-option label="视频号" value="shipinhao" />
            <el-option label="微博" value="weibo" />
            <el-option label="B站" value="bilibili" />
            <el-option label="快手" value="kuaishou" />
            <el-option label="微信" value="wechat" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.status" placeholder="选择账号状态" clearable style="width: 150px;">
            <el-option label="正常" value="1" />
            <el-option label="暂停" value="2" />
            <el-option label="过期" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-tooltip content="搜索" placement="top">
            <el-button circle size="small" type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重置" placement="top">
            <el-button circle size="small" @click="resetSearch">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>

    <!-- 账号管理功能 -->
    <div class="account-management card" style="margin-bottom: 20px;">
      <h3 class="subtitle">账号管理功能</h3>
      <div class="header-actions" style="margin-top: 10px; display: flex; gap: 16px; align-items: center;">
        <el-tooltip content="新增账号" placement="top">
          <el-button circle size="small" type="primary" plain @click="openAddAccountDialog">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="字段管理" placement="top">
          <el-button circle size="small" type="warning" plain @click="toggleFieldManager">
            <el-icon><Edit /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="列展示" placement="top">
          <el-popover placement="bottom" title="列展示设置" :width="200" trigger="click">
            <template #reference>
              <el-button circle size="small" type="info" plain>
                <el-icon><Setting /></el-icon>
              </el-button>
            </template>
            <el-checkbox-group v-model="visibleColumns">
              <div v-for="col in availableColumns" :key="col.prop" style="margin-bottom: 5px;">
                <el-checkbox :label="col.prop">{{ col.label }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </el-popover>
        </el-tooltip>
        <el-tooltip content="批量导入" placement="top">
          <el-button circle size="small" type="primary" plain @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="批量导出" placement="top">
          <el-button circle size="small" type="success" plain @click="handleBatchExport">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="批量修改" placement="top">
          <el-button circle size="small" type="warning" plain @click="handleBatchModify">
            <el-icon><Edit /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="批量删除" placement="top">
          <el-button circle size="small" type="danger" plain @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 字段管理面板 -->
    <div v-if="fieldManagerVisible" class="field-manager-panel card" style="margin-bottom: 20px; padding: 20px;">
      <dynamic-field-manager v-model="customFields" />
    </div>

    <!-- 账号列表 -->
    <div class="account-list-area card" style="margin-bottom: 20px;">
      <!-- 账号表格 -->
      <el-table
        v-loading="loading"
        :data="pagedAccounts"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" :resizable="false" />
        <el-table-column v-if="visibleColumns.includes('id')" prop="id" label="ID" width="80" :resizable="false" />
        <el-table-column v-if="visibleColumns.includes('account_nickname')" prop="account_nickname" label="账号昵称" min-width="180" :resizable="false">
          <template #default="scope">
            <div class="account-info">
              <span class="nickname">{{ scope.row.account_nickname }}</span>
              <span class="type-tag">{{ scope.row.account_type }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.includes('blogger_name')" prop="blogger_name" label="博主姓名" width="120" :resizable="false" />
        <el-table-column v-if="visibleColumns.includes('fans_count')" prop="fans_count" label="粉丝量" width="120" :resizable="false">
          <template #default="scope">
            {{ formatNumber(scope.row.fans_count) }}
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.includes('quote_single')" prop="quote_single" label="单条报价" width="120" :resizable="false">
          <template #default="scope">
            ¥{{ scope.row.quote_single.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.includes('status')" prop="status" label="状态" width="100" :resizable="false">
          <template #default="scope">
            <el-tag
              :type="getTagType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 自定义字段 -->
        <template v-for="field in customFields" :key="field.id">
          <el-table-column
            v-if="visibleColumns.includes(field.name)"
            :prop="field.name"
            :label="field.label"
            min-width="120"
            :resizable="false"
            show-overflow-tooltip
          />
        </template>

        <el-table-column label="操作" width="120" fixed="right" :resizable="false" align="center">
          <template #default="scope">
            <div class="table-actions" style="display: flex; justify-content: center; gap: 8px;">
              <el-tooltip content="编辑" placement="top">
                <el-button
                  circle
                  size="small"
                  type="primary"
                  plain
                  @click="openEditAccountDialog(scope.row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  circle
                  size="small"
                  type="danger"
                  plain
                  @click="handleDeleteAccount(scope.row.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑账号弹窗 -->
    <el-dialog
      v-model="accountDialogVisible"
      :title="isEditMode ? '编辑账号' : '新增账号'"
      width="800px"
    >
      <el-form
        :model="accountForm"
        :rules="accountRules"
        ref="accountFormRef"
        label-width="100px"
        class="account-form"
      >
        <!-- 动态表单 -->
        <dynamic-form v-model="accountForm" :fields="customFields" />


        <!-- 分组和状态 -->
        <el-form-item label="账号分组">
          <el-select v-model="accountForm.group_id" placeholder="请选择账号分组">
            <el-option
              v-for="group in groups"
              :key="group.id"
              :label="group.group_name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="accountForm.status" placeholder="请选择账号状态">
            <el-option label="正常" value="1" />
            <el-option label="暂停" value="2" />
            <el-option label="过期" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="accountDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAccount">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑分组弹窗 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="isEditGroupMode ? '编辑分组' : '新增分组'"
      width="400px"
    >
      <el-form
        :model="groupForm"
        :rules="groupRules"
        ref="groupFormRef"
        label-width="80px"
      >
        <el-form-item label="分组名称" prop="group_name">
          <el-input v-model="groupForm.group_name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            rows="2"
            placeholder="请输入分组描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGroup">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useAccountStore } from '../../stores'
import { Plus, More, Upload, Download, Edit, Delete, Search, Refresh, ArrowDown, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DynamicFieldManager from '../../components/DynamicFieldManager.vue'
import DynamicForm from '../../components/DynamicForm.vue'

// 状态管理
const accountStore = useAccountStore()

// 响应式数据
const loading = ref(false)
const groupLoading = ref(false)
const accountDialogVisible = ref(false)
const groupDialogVisible = ref(false)
const isEditMode = ref(false)
const isEditGroupMode = ref(false)
const selectedAccountIds = ref([])
const activeCollapseNames = ref(['basic'])
const fieldManagerVisible = ref(false)
const customFields = ref([
  {
    id: '1',
    label: '微信号',
    name: 'wechat',
    type: 'text',
    group: 'basic',
    placeholder: '请输入微信号',
    defaultValue: '',
    required: false
  },
  {
    id: '2',
    label: '邮箱',
    name: 'email',
    type: 'text',
    group: 'basic',
    placeholder: '请输入邮箱地址',
    defaultValue: '',
    required: false
  },
  {
    id: '3',
    label: '平均互动率',
    name: 'interaction_rate',
    type: 'number',
    group: 'data',
    placeholder: '请输入平均互动率',
    defaultValue: '0',
    required: false
  },
  {
    id: '4',
    label: '内容类型',
    name: 'content_type',
    type: 'text',
    group: 'data',
    placeholder: '请输入内容类型',
    defaultValue: '',
    required: false
  },
  {
    id: '5',
    label: '合作次数',
    name: 'cooperation_count',
    type: 'number',
    group: 'cooperation',
    placeholder: '请输入合作次数',
    defaultValue: '0',
    required: false
  },
  {
    id: '6',
    label: '返点比例',
    name: 'commission_rate',
    type: 'number',
    group: 'cooperation',
    placeholder: '请输入返点比例',
    defaultValue: '0',
    required: false
  },
  {
    id: '7',
    label: '账号特点',
    name: 'account_features',
    type: 'text',
    group: 'remark',
    placeholder: '请输入账号特点',
    defaultValue: '',
    required: false
  },
  {
    id: '8',
    label: '运营策略',
    name: 'operation_strategy',
    type: 'text',
    group: 'remark',
    placeholder: '请输入运营策略',
    defaultValue: '',
    required: false
  }
])

// 标准列定义
const standardColumns = [
  { label: 'ID', prop: 'id' },
  { label: '账号昵称', prop: 'account_nickname' },
  { label: '博主姓名', prop: 'blogger_name' },
  { label: '粉丝量', prop: 'fans_count' },
  { label: '单条报价', prop: 'quote_single' },
  { label: '状态', prop: 'status' }
]

// 可见列设置
const visibleColumns = ref(['id', 'account_nickname', 'blogger_name', 'fans_count', 'quote_single', 'status'])

// 所有可用列
const availableColumns = computed(() => {
  const customCols = customFields.value.map(f => ({ label: f.label, prop: f.name }))
  return [...standardColumns, ...customCols]
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  account_type: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 账号表单
const accountForm = reactive({
  blogger_name: '',
  account_nickname: '',
  account_type: '',
  account_id: '',
  homepage_url: '',
  fans_count: 0,
  avg_read_count: 0,
  like_count: 0,
  comment_count: 0,
  quote_single: [0],
  quote_package: 0,
  cooperation_type: [],
  is_swap: false,
  contact: '',
  remark: '',
  group_id: '',
  status: 1
})

// 账号表单验证规则
const accountRules = {
  blogger_name: [{ required: true, message: '请输入博主姓名', trigger: 'blur' }],
  account_nickname: [{ required: true, message: '请输入账号昵称', trigger: 'blur' }],
  account_type: [{ required: true, message: '请选择账号类型', trigger: 'change' }],
  homepage_url: [{ required: true, message: '请输入主页链接', trigger: 'blur' }],
  fans_count: [{ required: true, message: '请输入粉丝量', trigger: 'blur' }],
  quote_single: [{ required: true, message: '请输入单条报价', trigger: 'blur' }]
}

// 分组表单
const groupForm = reactive({
  group_name: '',
  description: ''
})

// 分组表单验证规则
const groupRules = {
  group_name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
}

// 表单引用
const accountFormRef = ref(null)
const groupFormRef = ref(null)

// 计算属性
const accounts = computed(() => accountStore.accounts)
const groups = computed(() => accountStore.groups)

// 筛选后的账号
const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    // 关键词搜索
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      if (!account.account_nickname.toLowerCase().includes(keyword) && 
          !account.blogger_name.toLowerCase().includes(keyword)) {
        return false
      }
    }
    // 账号类型筛选
    if (searchForm.account_type && account.account_type !== searchForm.account_type) {
      return false
    }
    // 状态筛选
    if (searchForm.status && account.status.toString() !== searchForm.status) {
      return false
    }
    return true
  })
})

// 分页后的账号
const pagedAccounts = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredAccounts.value.slice(start, end)
})

// 分组树属性
const groupTreeProps = {
  children: 'children',
  label: 'group_name'
}

// 方法
// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '过期',
    1: '正常',
    2: '暂停'
  }
  return statusMap[status] || '未知'
}

// 获取标签类型
const getTagType = (status) => {
  const typeMap = {
    0: 'danger',
    1: 'success',
    2: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取分组名称
const getGroupName = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  return group ? group.group_name : '未分组'
}

// 获取分组下的账号数量
const getAccountCountByGroup = (groupId) => {
  return accounts.value.filter(account => account.group_id === groupId).length
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.currentPage = 1
}

// 分页处理
const handlePageSizeChange = (size) => {
  pagination.pageSize = size
}

const handleCurrentPageChange = (current) => {
  pagination.currentPage = current
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedAccountIds.value = selection.map(item => item.id)
}

// 全选
const selectAllAccounts = () => {
  accountStore.selectAllAccounts()
  selectedAccountIds.value = accountStore.selectedAccounts
}

// 取消全选
const clearAllSelection = () => {
  accountStore.unselectAllAccounts()
  selectedAccountIds.value = []
}

// 分组点击
const handleGroupClick = (data) => {
  // 这里可以添加按分组筛选的逻辑
  console.log('Group clicked:', data)
}

// 切换字段管理面板
const toggleFieldManager = () => {
  fieldManagerVisible.value = !fieldManagerVisible.value
}

// 保存字段配置到本地存储
const saveFieldConfig = () => {
  localStorage.setItem('customFields', JSON.stringify(customFields.value))
}

// 从本地存储加载字段配置
const loadFieldConfig = () => {
  const savedFields = localStorage.getItem('customFields')
  if (savedFields) {
    customFields.value = JSON.parse(savedFields)
  }
}

// 添加单条报价项
const addQuoteItem = () => {
  accountForm.quote_single.push(0)
}

// 删除单条报价项
const removeQuoteItem = (index) => {
  accountForm.quote_single.splice(index, 1)
}

// 打开新增账号弹窗
const openAddAccountDialog = () => {
  isEditMode.value = false
  // 重置表单
  Object.keys(accountForm).forEach(key => {
    if (Array.isArray(accountForm[key])) {
      accountForm[key] = []
    } else {
      accountForm[key] = ''
    }
  })
  accountForm.fans_count = 0
  accountForm.avg_read_count = 0
  accountForm.like_count = 0
  accountForm.comment_count = 0
  accountForm.quote_single = [0]
  accountForm.quote_package = 0
  accountForm.is_swap = false
  accountForm.status = 1
  accountDialogVisible.value = true
}

// 打开编辑账号弹窗
const openEditAccountDialog = (account) => {
  isEditMode.value = true
  // 复制账号数据到表单
  Object.assign(accountForm, account)
  // 处理合作形式数组
  if (typeof accountForm.cooperation_type === 'string') {
    accountForm.cooperation_type = accountForm.cooperation_type.split(',')
  }
  // 处理单条报价数组
  if (!Array.isArray(accountForm.quote_single)) {
    accountForm.quote_single = [accountForm.quote_single || 0]
  }
  accountDialogVisible.value = true
}

// 保存账号
const saveAccount = async () => {
  if (!accountFormRef.value) return
  
  try {
    await accountFormRef.value.validate()
    
    // 处理合作形式
    if (Array.isArray(accountForm.cooperation_type)) {
      accountForm.cooperation_type = accountForm.cooperation_type.join(',')
    }
    
    // 处理单条报价（取第一个值用于存储）
    const originalQuoteSingle = [...accountForm.quote_single]
    if (Array.isArray(accountForm.quote_single)) {
      accountForm.quote_single = accountForm.quote_single[0] || 0
    }
    
    if (isEditMode.value) {
      await accountStore.updateAccount(accountForm.id, accountForm)
    } else {
      await accountStore.addAccount(accountForm)
    }
    
    // 恢复原始的报价数组
    accountForm.quote_single = originalQuoteSingle
    
    accountDialogVisible.value = false
    ElMessage.success(isEditMode.value ? '账号编辑成功' : '账号新增成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 删除账号
const handleDeleteAccount = (id) => {
  ElMessageBox.confirm('确定要删除该账号吗？删除后不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await accountStore.deleteAccount(id)
    ElMessage.success('账号删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning('请选择要删除的账号')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedAccountIds.value.length} 个账号吗？删除后不可恢复`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    for (const id of selectedAccountIds.value) {
      await accountStore.deleteAccount(id)
    }
    selectedAccountIds.value = []
    ElMessage.success('账号删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 批量导入
const handleBatchImport = async () => {
  if (!window.electronAPI) {
    ElMessage.warning('请在桌面端使用此功能')
    return
  }
  try {
    const count = await window.electronAPI.excel.importAccounts()
    if (count !== null) {
      ElMessage.success(`成功导入 ${count} 个账号`)
      // 重新加载数据
      await accountStore.loadInitialData()
      handleSearch()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请检查文件格式')
  }
}

// 批量导出
const handleBatchExport = async () => {
  if (!window.electronAPI) {
    ElMessage.warning('请在桌面端使用此功能')
    return
  }
  try {
    // 优先导出选中的账号，如果没有选中则导出所有账号
    let accountsToExport = []
    if (selectedAccountIds.value.length > 0) {
      accountsToExport = accounts.value.filter(a => selectedAccountIds.value.includes(a.id))
    } else {
      accountsToExport = accountStore.accounts
    }
    
    if (accountsToExport.length === 0) {
      ElMessage.warning('暂无账号可导出')
      return
    }

    const success = await window.electronAPI.excel.exportAccounts(JSON.parse(JSON.stringify(accountsToExport)))
    if (success) {
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 批量修改
const handleBatchModify = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning('请选择要修改的账号')
    return
  }
  ElMessage.info('批量修改功能开发中')
}

// 打开新增分组弹窗
const openAddGroupDialog = () => {
  isEditGroupMode.value = false
  // 重置表单
  Object.keys(groupForm).forEach(key => {
    groupForm[key] = ''
  })
  groupDialogVisible.value = true
}

// 打开编辑分组弹窗
const openEditGroupDialog = (group) => {
  isEditGroupMode.value = true
  // 复制分组数据到表单
  Object.assign(groupForm, group)
  groupDialogVisible.value = true
}

// 保存分组
const saveGroup = async () => {
  if (!groupFormRef.value) return
  
  try {
    await groupFormRef.value.validate()
    
    if (isEditGroupMode.value) {
      await accountStore.updateGroup(groupForm.id, groupForm)
    } else {
      await accountStore.addGroup(groupForm)
    }
    
    groupDialogVisible.value = false
    ElMessage.success(isEditGroupMode.value ? '分组编辑成功' : '分组新增成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 删除分组
const handleDeleteGroup = (id) => {
  // 检查分组下是否有账号
  const accountCount = getAccountCountByGroup(id)
  if (accountCount > 0) {
    ElMessage.warning(`该分组下还有 ${accountCount} 个账号，无法删除`)
    return
  }
  
  ElMessageBox.confirm('确定要删除该分组吗？删除后不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await accountStore.deleteGroup(id)
    ElMessage.success('分组删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 生命周期
onMounted(async () => {
  // 加载字段配置
  loadFieldConfig()

  // 初始化可见列
  const savedCols = localStorage.getItem('accountVisibleColumns')
  if (savedCols) {
    visibleColumns.value = JSON.parse(savedCols)
  } else {
    // 默认显示所有标准列和自定义列
    const allProps = availableColumns.value.map(c => c.prop)
    visibleColumns.value = allProps
  }
})

// 监听可见列变化，自动保存
watch(visibleColumns, () => {
  localStorage.setItem('accountVisibleColumns', JSON.stringify(visibleColumns.value))
}, { deep: true })

// 监听字段配置变化，自动保存
watch(customFields, () => {
  saveFieldConfig()
}, { deep: true })
</script>

<style scoped lang="scss">
/* 统一的页面容器 */
.account-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0; /* 移除可能的默认内边距 */
}

/* 顶部标题区 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

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
      border-radius: 3px;
    }
  }
}

/* 通用卡片样式优化 */
.card {
  background: var(--bg-color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--box-shadow-light);
  border: 1px solid var(--border-color-light);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--box-shadow);
  }
}

/* 搜索筛选区 */
.search-filter {
  padding: 24px 24px 0; /* 底部padding由margin-bottom撑开 */
  
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .el-form-item {
      margin-bottom: 24px; /* 统一底部间距 */
      margin-right: 0;
    }
  }
}

/* 账号管理功能区 */
.account-management {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .subtitle {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 16px;
      background: var(--primary-color);
      border-radius: 2px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    .el-button {
      margin-left: 0; /* 移除默认左边距 */
      border-radius: 8px;
      padding: 10px 20px;
      height: auto;
      font-weight: 500;

      .el-icon {
        margin-right: 6px;
      }
    }

    /* 圆形按钮图标居中 */
    .el-button.is-circle {
      position: relative;
      display: block;
      padding: 0;
      width: 36px;
      height: 36px;
    }

    /* 强制span、i和svg完全居中 */
    .el-button.is-circle > span {
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 20px !important;
      height: 20px !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .el-button.is-circle > span > .el-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .el-button.is-circle > span > .el-icon > svg {
      display: block !important;
      margin: 0 auto !important;
      padding: 0 !important;
      width: 16px !important;
      height: 16px !important;
    }


  }
}

/* 表格操作列按钮样式 - 与账号管理功能按钮一致 */
.table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;

  .el-button {
    &.is-circle {
      position: relative;
      display: block;
      padding: 0;
      width: 36px;
      height: 36px;

      > span {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 20px !important;
        height: 20px !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        > .el-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;

          > svg {
            display: block !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 16px !important;
            height: 16px !important;
          }
        }
      }
    }
  }
}

/* 账号列表区 */
.account-list-area {
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px; /* 最小高度 */

  /* 表格样式覆盖 */
  :deep(.el-table) {
    flex: 1;
    --el-table-header-bg-color: var(--bg-color-light);
    --el-table-header-text-color: var(--text-color-primary);
    --el-table-row-hover-bg-color: var(--primary-color-light-9);

    th.el-table__cell {
      font-weight: 600;
      height: 54px;
      background-color: var(--bg-color-light);
    }

    .el-table__row {
      height: 60px; /* 增加行高 */
    }

    /* 账号信息组合样式 */
    .account-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .nickname {
        font-weight: 500;
        font-size: 14px;
        color: var(--text-color-primary);
      }

      .type-tag {
        font-size: 12px;
        color: var(--text-color-secondary);
        background: var(--bg-color-page);
        padding: 2px 6px;
        border-radius: 4px;
        width: fit-content;
      }
    }
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .search-filter .search-form {
    flex-direction: column;
    
    .el-form-item {
      width: 100%;
      margin-right: 0;
      
      .el-input, .el-select {
        width: 100% !important;
      }
    }
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
