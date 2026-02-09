<template>
  <div class="account-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ $t('account.title') }}</h2>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-filter glass-card" style="margin-bottom: 20px;">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('account.searchKeyword')">
          <el-input
            v-model="searchForm.keyword"
            :placeholder="$t('account.searchPlaceholder')"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('account.accountType')">
          <el-select v-model="searchForm.account_type" :placeholder="$t('account.selectType')" clearable style="width: 150px;">
            <el-option :label="$t('dynamicForm.types.douyin')" value="douyin" />
            <el-option :label="$t('dynamicForm.types.xiaohongshu')" value="xiaohongshu" />
            <el-option :label="$t('dynamicForm.types.shipinhao')" value="shipinhao" />
            <el-option :label="$t('dynamicForm.types.weibo')" value="weibo" />
            <el-option :label="$t('dynamicForm.types.bilibili')" value="bilibili" />
            <el-option :label="$t('dynamicForm.types.kuaishou')" value="kuaishou" />
            <el-option :label="$t('dynamicForm.types.wechat')" value="wechat" />
            <el-option :label="$t('dynamicForm.types.other')" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('account.accountStatus')">
          <el-select v-model="searchForm.status" :placeholder="$t('account.selectStatus')" clearable style="width: 150px;">
            <el-option :label="$t('account.statusNormal')" value="1" />
            <el-option :label="$t('account.statusPaused')" value="2" />
            <el-option :label="$t('account.statusExpired')" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-tooltip :content="$t('common.search')" placement="top">
            <el-button circle size="small" type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('common.reset')" placement="top">
            <el-button circle size="small" @click="resetSearch">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>

    <!-- 账号管理功能 -->
    <div class="account-management glass-card" style="margin-bottom: 20px;">
      <h3 class="subtitle">{{ $t('account.title') }}</h3>
      <div class="header-actions" style="margin-top: 10px; display: flex; gap: 16px; align-items: center;">
        <el-tooltip :content="$t('account.addAccount')" placement="top">
          <el-button circle size="small" type="primary" plain @click="openAddAccountDialog">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.fieldManager')" placement="top">
          <el-button circle size="small" type="warning" plain @click="toggleFieldManager">
            <el-icon><Edit /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.columnDisplay')" placement="top">
          <el-popover placement="bottom" :title="$t('account.columnDisplay')" :width="200" trigger="click">
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
        <el-tooltip :content="$t('account.batchImport')" placement="top">
          <el-button circle size="small" type="primary" plain @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.batchExport')" placement="top">
          <el-button circle size="small" type="success" plain @click="handleBatchExport">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.batchModify')" placement="top">
          <el-button circle size="small" type="warning" plain @click="handleBatchModify">
            <el-icon><Edit /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.batchDelete')" placement="top">
          <el-button circle size="small" type="danger" plain @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 字段管理面板 -->
    <div v-if="fieldManagerVisible" class="field-manager-panel glass-card" style="margin-bottom: 20px; padding: 20px;">
      <dynamic-field-manager v-model="customFields" />
    </div>

    <!-- 账号列表 -->
    <div class="account-list-area glass-card" style="margin-bottom: 20px;">
      <!-- 账号表格 -->
      <el-table
        v-loading="loading"
        :data="pagedAccounts"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" :resizable="false" />
        <el-table-column v-if="visibleColumns.includes('id')" prop="id" :label="$t('common.id')" width="80" :resizable="false" />
        <el-table-column v-if="visibleColumns.includes('account_nickname')" prop="account_nickname" :label="$t('account.nickname')" min-width="180" :resizable="false">
          <template #default="scope">
            <div class="account-info">
              <span class="nickname">{{ scope.row.account_nickname }}</span>
              <span class="type-tag">{{ getAccountTypeLabel(scope.row.account_type) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.includes('blogger_name')" prop="blogger_name" :label="$t('account.bloggerName')" width="120" :resizable="false" />
        <el-table-column v-if="visibleColumns.includes('fans_count')" prop="fans_count" :label="$t('account.fansCount')" width="120" :resizable="false">
          <template #default="scope">
            {{ formatNumber(scope.row.fans_count) }}
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.includes('quote_single')" prop="quote_single" :label="$t('account.quoteSingle')" width="120" :resizable="false">
          <template #default="scope">
            ¥{{ scope.row.quote_single.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.includes('status')" prop="status" :label="$t('common.status')" width="100" :resizable="false">
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

        <el-table-column :label="$t('common.operation')" width="120" fixed="right" :resizable="false" align="center">
          <template #default="scope">
            <div class="table-actions" style="display: flex; justify-content: center; gap: 8px;">
              <el-tooltip :content="$t('common.edit')" placement="top">
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
              <el-tooltip :content="$t('common.delete')" placement="top">
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
      :title="isEditMode ? $t('account.editAccount') : $t('account.addAccount')"
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
        <el-form-item :label="$t('account.group')">
          <el-select v-model="accountForm.group_id" :placeholder="$t('account.selectGroup')">
            <el-option
              v-for="group in groups"
              :key="group.id"
              :label="group.group_name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('account.accountStatus')">
          <el-select v-model="accountForm.status" :placeholder="$t('account.selectStatus')">
            <el-option :label="$t('account.statusNormal')" value="1" />
            <el-option :label="$t('account.statusPaused')" value="2" />
            <el-option :label="$t('account.statusExpired')" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="accountDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveAccount">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑分组弹窗 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="isEditGroupMode ? $t('account.editGroup') : $t('account.addGroup')"
      width="400px"
    >
      <el-form
        :model="groupForm"
        :rules="groupRules"
        ref="groupFormRef"
        label-width="80px"
      >
        <el-form-item :label="$t('account.groupName')" prop="group_name">
          <el-input v-model="groupForm.group_name" :placeholder="$t('account.inputGroupName')" />
        </el-form-item>
        <el-form-item :label="$t('account.groupDesc')">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            rows="2"
            :placeholder="$t('account.inputGroupDesc')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveGroup">{{ $t('common.save') }}</el-button>
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
const customFields = computed(() => [
  {
    id: '1',
    label: t('account.wechat'),
    name: 'wechat',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.wechat'),
    defaultValue: '',
    required: false
  },
  {
    id: '2',
    label: t('account.email'),
    name: 'email',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.email'),
    defaultValue: '',
    required: false
  },
  {
    id: '3',
    label: t('account.fansCount'),
    name: 'fans_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.fansCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '4',
    label: t('account.avgRead'),
    name: 'avg_read_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.avgRead'),
    defaultValue: 0,
    required: false
  },
  {
    id: '5',
    label: t('account.likeCount'),
    name: 'like_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.likeCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '6',
    label: t('account.commentCount'),
    name: 'comment_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.commentCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '7',
    label: t('account.interactionRate'),
    name: 'interaction_rate',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.interactionRate'),
    defaultValue: '0',
    required: false
  },
  {
    id: '8',
    label: t('account.contentType'),
    name: 'content_type',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.contentType'),
    defaultValue: '',
    required: false
  },
  {
    id: '9',
    label: t('account.quotePackage'),
    name: 'quote_package',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.quotePackage'),
    defaultValue: 0,
    required: false
  },
  {
    id: '10',
    label: t('account.cooperationType'),
    name: 'cooperation_type',
    type: 'multiple_select',
    group: 'cooperation',
    placeholder: t('account.select') + t('account.cooperationType'),
    defaultValue: [],
    options: t('account.cooperationOptions'),
    required: false
  },
  {
    id: '11',
    label: t('account.isSwap'),
    name: 'is_swap',
    type: 'switch',
    group: 'cooperation',
    placeholder: '',
    defaultValue: false,
    required: false
  },
  {
    id: '12',
    label: t('account.contact'),
    name: 'contact',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.contact'),
    defaultValue: '',
    required: false
  },
  {
    id: '13',
    label: t('account.cooperationCount'),
    name: 'cooperation_count',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.cooperationCount'),
    defaultValue: '0',
    required: false
  },
  {
    id: '14',
    label: t('account.commissionRate'),
    name: 'commission_rate',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.commissionRate'),
    defaultValue: '0',
    required: false
  },
  {
    id: '15',
    label: t('common.remark'),
    name: 'remark',
    type: 'text',
    group: 'remark',
    placeholder: t('account.enter') + t('common.remark'),
    defaultValue: '',
    required: false
  },
  {
    id: '16',
    label: t('account.accountFeatures'),
    name: 'account_features',
    type: 'text',
    group: 'remark',
    placeholder: t('account.enter') + t('account.accountFeatures'),
    defaultValue: '',
    required: false
  },
  {
    id: '17',
    label: t('account.operationStrategy'),
    name: 'operation_strategy',
    type: 'text',
    group: 'remark',
    placeholder: t('account.enter') + t('account.operationStrategy'),
    defaultValue: '',
    required: false
  }
])

// 标准列定义
const standardColumns = computed(() => [
  { label: t('common.id'), prop: 'id' },
  { label: t('account.nickname'), prop: 'account_nickname' },
  { label: t('account.bloggerName'), prop: 'blogger_name' },
  { label: t('account.quoteSingle'), prop: 'quote_single' },
  { label: t('common.status'), prop: 'status' }
])

// 可见列设置
const visibleColumns = ref(['id', 'account_nickname', 'blogger_name', 'fans_count', 'quote_single', 'status', 'wechat', 'email'])

// 所有可用列
const availableColumns = computed(() => {
  const customCols = customFields.value.map(f => ({ label: f.label, prop: f.name }))
  return [...standardColumns.value, ...customCols]
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
  wechat: '',
  email: '',
  contact: '',
  remark: '',
  group_id: '',
  status: 1
})

// 账号表单验证规则
const accountRules = computed(() => ({
  blogger_name: [{ required: true, message: t('account.enter') + t('account.bloggerName'), trigger: 'blur' }],
  account_nickname: [{ required: true, message: t('account.enter') + t('account.nickname'), trigger: 'blur' }],
  account_type: [{ required: true, message: t('account.select') + t('account.accountType'), trigger: 'change' }],
  homepage_url: [{ required: true, message: t('account.enter') + t('form.homepageUrl'), trigger: 'blur' }],
  fans_count: [{ required: true, message: t('account.enter') + t('account.fansCount'), trigger: 'blur' }],
  quote_single: [{ required: true, message: t('account.enter') + t('account.quoteSingle'), trigger: 'blur' }]
}))

// 分组表单
const groupForm = reactive({
  group_name: '',
  description: ''
})

// 分组表单验证规则
const groupRules = computed(() => ({
  group_name: [{ required: true, message: t('account.inputGroupName'), trigger: 'blur' }]
}))

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
    return (num / 10000).toFixed(1) + t('common.unitTenThousand')
  }
  return num
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: t('account.statusExpired'),
    1: t('account.statusNormal'),
    2: t('account.statusPaused')
  }
  return statusMap[status] || t('common.unknown')
}

// 获取账号类型显示文本
const getAccountTypeLabel = (type) => {
  if (!type) return ''
  return t(`dynamicForm.types.${type}`)
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
  if (!groupId) return t('account.group.unorganized')
  const group = groups.value.find(g => g.id === groupId)
  return group ? group.group_name : t('account.group.unorganized')
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
  localStorage.setItem('customFields_v3', JSON.stringify(customFields.value))
}

// 从本地存储加载字段配置
const loadFieldConfig = () => {
  const savedFields = localStorage.getItem('customFields_v3')
  if (savedFields) {
    try {
      customFields.value = JSON.parse(savedFields)
    } catch (e) {
      console.error('Failed to load field config:', e)
    }
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
  
  // 解析 extra_json 并合并到表单数据中
  if (account.extra_json) {
    try {
      const extra = JSON.parse(account.extra_json)
      Object.assign(accountForm, extra)
    } catch (e) {
      console.error('Failed to parse extra_json:', e)
    }
  }

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
    
    // 准备提交的数据
    const submitData = { ...accountForm }
    
    // 数据库原生字段列表
    const nativeFields = [
      'id', 'group_id', 'blogger_name', 'account_nickname', 'account_type', 'account_id',
      'homepage_url', 'fans_count', 'avg_read_count', 'like_count', 'comment_count',
      'quote_single', 'quote_package', 'cooperation_type', 'is_swap', 'contact',
      'remark', 'status', 'created_at'
    ]
    
    // 打包自定义字段到 extra_json
    const extraData = {}
    customFields.value.forEach(field => {
      if (!nativeFields.includes(field.name) && accountForm[field.name] !== undefined) {
        extraData[field.name] = accountForm[field.name]
      }
    })
    submitData.extra_json = JSON.stringify(extraData)
    
    // 移除不在数据库字段列表中的属性，避免 SQL 更新错误
    Object.keys(submitData).forEach(key => {
      if (!nativeFields.includes(key) && key !== 'extra_json') {
        delete submitData[key]
      }
    })
    
    if (isEditMode.value) {
      await accountStore.updateAccount(submitData.id, submitData)
    } else {
      await accountStore.addAccount(submitData)
    }
    
    // 恢复原始的报价数组
    accountForm.quote_single = originalQuoteSingle
    
    accountDialogVisible.value = false
    ElMessage.success(isEditMode.value ? t('account.editSuccess') : t('account.addSuccess'))
  } catch (error) {
    console.error(t('account.validateErrorConsole'), error)
  }
}

// 删除账号
const handleDeleteAccount = (id) => {
  ElMessageBox.confirm(t('account.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await accountStore.deleteAccount(id)
    ElMessage.success(t('account.deleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning(t('account.selectDelete'))
    return
  }
  
  ElMessageBox.confirm(t('account.batchDeleteConfirm', { count: selectedAccountIds.value.length }), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    for (const id of selectedAccountIds.value) {
      await accountStore.deleteAccount(id)
    }
    selectedAccountIds.value = []
    ElMessage.success(t('account.deleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 批量导入
const handleBatchImport = async () => {
  if (!window.electronAPI) {
    ElMessage.warning(t('common.desktopOnly'))
    return
  }
  try {
    const count = await window.electronAPI.excel.importAccounts()
    if (count !== null) {
      ElMessage.success(t('account.importSuccess', { count }))
      // 重新加载数据
      await accountStore.loadInitialData()
      handleSearch()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error(t('account.importFailed'))
  }
}

// 批量导出
const handleBatchExport = async () => {
  if (!window.electronAPI) {
    ElMessage.warning(t('common.desktopOnly'))
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
      ElMessage.warning(t('account.noAccountExport'))
      return
    }

    const success = await window.electronAPI.excel.exportAccounts(JSON.parse(JSON.stringify(accountsToExport)))
    if (success) {
      ElMessage.success(t('account.exportSuccess'))
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error(t('common.error'))
  }
}

// 批量修改
const handleBatchModify = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning(t('account.selectAccount'))
    return
  }
  ElMessage.info(t('account.batchModifyDev'))
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
    ElMessage.success(isEditGroupMode.value ? t('account.editSuccess') : t('account.addSuccess'))
  } catch (error) {
    console.error(t('account.validateErrorConsole'), error)
  }
}

// 删除分组
const handleDeleteGroup = (id) => {
  // 检查分组下是否有账号
  const accountCount = getAccountCountByGroup(id)
  if (accountCount > 0) {
    ElMessage.warning(t('account.groupDeleteWarn', { count: accountCount }))
    return
  }
  
  ElMessageBox.confirm(t('account.groupDeleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await accountStore.deleteGroup(id)
    ElMessage.success(t('account.groupDeleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 生命周期
onMounted(async () => {
  // 加载字段配置
  loadFieldConfig()

  // 初始化可见列
  const savedCols = localStorage.getItem('accountVisibleColumns_v3')
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
  localStorage.setItem('accountVisibleColumns_v3', JSON.stringify(visibleColumns.value))
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

/* 通用卡片样式优化 - 使用全局 glass-card */
/* .card removed */

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
      border-radius: var(--border-radius-sm);
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    .el-button {
      margin-left: 0; /* 移除默认左边距 */
      border-radius: var(--border-radius-lg);
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
        border-radius: var(--border-radius-md);
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
