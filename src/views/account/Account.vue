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
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="视频号" value="视频号" />
            <el-option label="微博" value="微博" />
            <el-option label="B站" value="B站" />
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
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 账号管理功能 -->
    <div class="account-management card" style="margin-bottom: 20px;">
      <h3 class="subtitle">账号管理功能</h3>
      <div class="header-actions" style="margin-top: 10px; display: flex; gap: 16px; align-items: center;">
        <el-button type="primary" @click="openAddAccountDialog">
          <el-icon><Plus /></el-icon>
          新增账号
        </el-button>
        <el-button type="warning" @click="toggleFieldManager">
          <el-icon><Edit /></el-icon>
          字段管理
        </el-button>
        <el-button type="primary" @click="handleBatchImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="success" @click="handleBatchExport">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button type="warning" @click="handleBatchModify">
          <el-icon><Edit /></el-icon>
          批量修改
        </el-button>
        <el-button type="danger" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
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
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="account_nickname" label="账号昵称" min-width="150">
          <template #default="scope">
            <div class="account-info">
              <span class="nickname">{{ scope.row.account_nickname }}</span>
              <span class="type-tag">{{ scope.row.account_type }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="blogger_name" label="博主姓名" width="120" />
        <el-table-column prop="fans_count" label="粉丝量" width="120">
          <template #default="scope">
            {{ formatNumber(scope.row.fans_count) }}
          </template>
        </el-table-column>
        <el-table-column prop="quote_single" label="单条报价" width="120">
          <template #default="scope">
            ¥{{ scope.row.quote_single.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag
              :type="getTagType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="openEditAccountDialog(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteAccount(scope.row.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
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
import { Plus, More, Upload, Download, Edit, Delete, Search, Refresh, ArrowDown } from '@element-plus/icons-vue'
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
      accountStore.updateAccount(accountForm.id, accountForm)
    } else {
      accountStore.addAccount(accountForm)
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
  }).then(() => {
    accountStore.deleteAccount(id)
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
  }).then(() => {
    selectedAccountIds.value.forEach(id => {
      accountStore.deleteAccount(id)
    })
    selectedAccountIds.value = []
    ElMessage.success('账号删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 批量导入
const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中')
}

// 批量导出
const handleBatchExport = () => {
  ElMessage.info('批量导出功能开发中')
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
      accountStore.updateGroup(groupForm.id, groupForm)
    } else {
      accountStore.addGroup(groupForm)
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
  }).then(() => {
    accountStore.deleteGroup(id)
    ElMessage.success('分组删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 生命周期
onMounted(() => {
  // 初始化数据
  if (groups.value.length === 0) {
    // 默认分组
    accountStore.addGroup({ group_name: '默认分组', description: '默认账号分组' })
  }
  // 加载字段配置
  loadFieldConfig()
})

// 监听字段配置变化，自动保存
watch(customFields, () => {
  saveFieldConfig()
}, { deep: true })
</script>

<style scoped lang="scss">
.account-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .search-filter {
    margin-bottom: var(--spacing-lg);
  }

  .account-content {
    display: flex;
    gap: var(--spacing-lg);

    .account-list-area {
      flex: 1;
    }

    .group-management {
      width: 300px;
      min-width: 280px;
    }
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .list-info {
      display: flex;
      gap: var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
    }

    .list-actions {
      display: flex;
      gap: var(--spacing-xs);
    }
  }

  .pagination {
    margin-top: var(--spacing-md);
    display: flex;
    justify-content: flex-end;
  }

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .group-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .group-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .account-count {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      margin-left: var(--spacing-xs);
    }

    .group-node-actions {
      display: flex;
      gap: var(--spacing-xs);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover .group-node-actions {
      opacity: 1;
    }
  }

  .account-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    .nickname {
      font-weight: 500;
    }

    .type-tag {
      font-size: var(--font-size-xs);
      color: var(--primary-color);
      background-color: rgba(64, 158, 255, 0.1);
      padding: 2px 6px;
      border-radius: var(--border-radius-sm);
    }
  }

  .account-form {
    .form-collapse {
      margin-bottom: var(--spacing-md);
    }
  }

  .field-manager-panel {
    margin-bottom: var(--spacing-md);
    .dynamic-field-manager {
      .manager-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
      }
      .field-list {
        margin-top: var(--spacing-md);
        .field-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xs);
          &:hover {
            background-color: var(--bg-color-light);
          }
        }
      }
    }
  }

  @media (max-width: 1200px) {
    .account-content {
      flex-direction: column;

      .group-management {
        width: 100%;
      }

      .group-list {
        max-height: 300px;
      }
    }
  }
}
</style>
