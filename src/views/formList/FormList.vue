<template>
  <div class="form-list-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ $t('formList.title') }}</h2>
      <div class="header-actions">
        <el-tooltip :content="$t('formList.addForm')" placement="bottom">
          <el-button circle size="small" type="primary" plain @click="openAddFormDialog">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('formList.batchImport')" placement="bottom">
          <el-button circle size="small" type="primary" plain @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('formList.batchExport')" placement="bottom">
          <el-button circle size="small" type="success" plain @click="handleBatchExport">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('formList.batchDelete')" placement="bottom">
          <el-button circle size="small" type="danger" plain @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 两列布局 -->
    <div class="form-list-container">
      <!-- 左列：日期文件夹管理 -->
      <div class="folder-management">
        <div class="glass-card">
          <div class="section-header">
            <h3 class="subtitle">{{ $t('formList.folderManagement') }}</h3>
            <div class="header-actions">
              <el-tooltip :content="$t('formList.newFolder')" placement="top">
                <el-button circle size="small" type="primary" plain @click="openAddFolderDialog">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <!-- 文件夹列表 -->
          <div class="folder-list">
            <!-- 全部表单选项 -->
            <div 
              class="folder-node all-forms-node" :class="{ active: !selectedFolderId }"
              @click="handleAllFormsClick"
            >
              <span class="node-label">{{ $t('formList.allForms') }}</span>
              <span class="form-count">({{ forms.length }})</span>
            </div>
            <el-tree
              v-loading="folderLoading"
              :data="sortedFolders"
              :props="folderTreeProps"
              node-key="id"
              default-expand-all
              @node-click="handleFolderClick"
              class="folder-tree"
            >
              <template #default="{ node, data }">
                <div class="folder-node">
                  <span class="node-label">{{ node.label }}</span>
                  <span class="form-count">({{ getFormCountByFolder(data.id) }})</span>
                  <div class="folder-node-actions">
                    <el-button
                      circle
                      size="small"
                      type="primary"
                      plain
                      @click.stop="openEditFolderDialog(data)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      circle
                      size="small"
                      type="danger"
                      plain
                      @click.stop="handleDeleteFolder(data.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </div>

      <!-- 右列：表单链接列表 -->
      <div class="form-link-list">
        <div class="glass-card">
          <div class="section-header">
            <h3 class="subtitle">
              {{ selectedFolder ? selectedFolder.folder_name : $t('formList.allForms') }}
            </h3>
            <div class="header-actions">
              <el-input
                v-model="formSearchKeyword"
                :placeholder="$t('formList.searchForm')"
                clearable
                class="form-search"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="formSortBy" :placeholder="$t('formList.sortBy')">
                <el-option :label="$t('formList.sortCreated')" value="created_at" />
                <el-option :label="$t('formList.sortLastFilled')" value="last_fill_time" />
              </el-select>
            </div>
          </div>

          <!-- 表单列表 -->
          <div class="form-table-container">
            <el-table
              v-loading="formLoading"
              :data="filteredAndSortedForms"
              style="width: 100%; height: 100%;"
              height="100%"
              @selection-change="handleFormSelectionChange"
              border
            >
              <el-table-column type="selection" width="55" :resizable="false" />
              <el-table-column prop="template_name" :label="$t('formList.formName')" min-width="180" :resizable="false">
                <template #default="scope">
                  <div class="form-name">
                    {{ scope.row.template_name }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="form_type" :label="$t('formList.formType')" width="100" :resizable="false">
                <template #default="scope">
                  <el-tag size="small">{{ getFormTypeLabel(scope.row.form_type) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="form_url" :label="$t('formList.formUrl')" min-width="250" :resizable="false">
                <template #default="scope">
                  <el-popover
                    placement="top"
                    :width="300"
                    trigger="hover"
                  >
                    <template #reference>
                      <a :href="scope.row.form_url" target="_blank" class="form-link">{{ scope.row.form_url }}</a>
                    </template>
                    <div class="form-url-popover">
                      <p>{{ scope.row.form_url }}</p>
                      <el-tooltip :content="$t('formList.copyUrl')" placement="top">
                        <el-button
                          circle
                          size="small"
                          type="primary"
                          plain
                          @click="copyFormUrl(scope.row.form_url)"
                        >
                          <el-icon><DocumentCopy /></el-icon>
                        </el-button>
                      </el-tooltip>
                    </div>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" :label="$t('formList.addTime')" width="160" :resizable="false">
                <template #default="scope">
                  {{ formatDate(scope.row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column prop="last_fill_time" :label="$t('formList.lastFillTime')" width="160" :resizable="false">
                <template #default="scope">
                  {{ scope.row.last_fill_time ? formatDate(scope.row.last_fill_time) : '-' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('formList.operation')" width="160" fixed="right" :resizable="false" align="center">
                <template #default="scope">
                  <div class="table-actions" style="display: flex; justify-content: center; gap: 8px;">
                    <el-tooltip :content="$t('formList.goToFill')" placement="top">
                      <el-button
                        circle
                        size="small"
                        type="primary"
                        plain
                        @click="navigateToFill(scope.row.id)"
                      >
                        <el-icon><EditPen /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('common.edit')" placement="top">
                      <el-button
                        circle
                        size="small"
                        type="warning"
                        plain
                        @click="openEditFormDialog(scope.row)"
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
                        @click="handleDeleteForm(scope.row.id)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 空状态 -->
            <div v-if="filteredAndSortedForms.length === 0" class="empty-state">
              <el-empty :description="$t('formList.noForms')" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑文件夹弹窗 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="isEditFolderMode ? $t('formList.editFolderTitle') : $t('formList.newFolderTitle')"
      width="400px"
    >
      <el-form
        :model="folderForm"
        :rules="folderRules"
        ref="folderFormRef"
        label-width="80px"
      >
        <el-form-item :label="$t('formList.folderName')" prop="folder_name">
          <el-input v-model="folderForm.folder_name" :placeholder="$t('formList.folderNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('formList.folderDesc')">
          <el-input
            v-model="folderForm.description"
            type="textarea"
            rows="2"
            :placeholder="$t('formList.folderDescPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="folderDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveFolder">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑表单弹窗 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditFormMode ? $t('formList.editFormTitle') : $t('formList.addFormTitle')"
      width="600px"
    >
      <el-form
        :model="formForm"
        :rules="formRules"
        ref="formFormRef"
        label-width="100px"
      >
        <el-form-item :label="$t('formList.formName')" prop="template_name">
          <el-input v-model="formForm.template_name" :placeholder="$t('formList.formNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('formList.formUrl')" prop="form_url">
          <el-input v-model="formForm.form_url" :placeholder="$t('formList.formUrlPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('formList.formType')" prop="form_type">
          <el-select v-model="formForm.form_type" :placeholder="$t('formList.formTypePlaceholder')">
            <el-option :label="$t('formList.types.tencent')" :value="FORM_TYPES.TENCENT" />
            <el-option :label="$t('formList.types.wenjuanxing')" :value="FORM_TYPES.WENJUANXING" />
            <el-option :label="$t('formList.types.shimo')" :value="FORM_TYPES.SHIMO" />
            <el-option :label="$t('formList.types.mike')" :value="FORM_TYPES.MIKE" />
            <el-option :label="$t('formList.types.wps')" :value="FORM_TYPES.WPS" />
            <el-option :label="$t('formList.types.miniprogram')" :value="FORM_TYPES.MINIPROGRAM" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('formList.folderBelong')" prop="folder_id">
          <el-select v-model="formForm.folder_id" :placeholder="$t('formList.folderSelectPlaceholder')">
              <el-option
                v-for="folder in sortedFolders"
                :key="folder.id"
                :label="folder.folder_name"
                :value="folder.id"
              />
            </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveForm">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="batchImportDialogVisible"
      :title="$t('formList.batchImportTitle')"
      width="600px"
    >
      <el-form
        :model="batchImportForm"
        :rules="batchImportRules"
        ref="batchImportFormRef"
        label-width="100px"
      >
        <el-form-item :label="$t('formList.formUrl')" prop="formUrls">
          <el-input
            v-model="batchImportForm.formUrls"
            type="textarea"
            rows="6"
            :placeholder="$t('formList.batchImportPlaceholder')"
          />
          <div class="form-tip">{{ $t('formList.batchImportTip') }}</div>
        </el-form-item>
        <el-form-item :label="$t('formList.folderBelong')" prop="folder_id">
          <el-select v-model="batchImportForm.folder_id" :placeholder="$t('formList.folderSelectPlaceholder')">
            <el-option
              v-for="folder in sortedFolders"
              :key="folder.id"
              :label="folder.folder_name"
              :value="folder.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('formList.formType')" prop="form_type">
          <el-select v-model="batchImportForm.form_type" :placeholder="$t('formList.formTypePlaceholder')">
            <el-option :label="$t('formList.types.tencent')" :value="FORM_TYPES.TENCENT" />
            <el-option :label="$t('formList.types.wenjuanxing')" :value="FORM_TYPES.WENJUANXING" />
            <el-option :label="$t('formList.types.shimo')" :value="FORM_TYPES.SHIMO" />
            <el-option :label="$t('formList.types.mike')" :value="FORM_TYPES.MIKE" />
            <el-option :label="$t('formList.types.wps')" :value="FORM_TYPES.WPS" />
            <el-option :label="$t('formList.types.miniprogram')" :value="FORM_TYPES.MINIPROGRAM" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchImportDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleImport">{{ $t('formList.import') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../../stores'
import { useSettingsStore } from '../../stores/settings'
import { Plus, More, Upload, Download, Delete, ArrowDown, Search, EditPen, Edit, DocumentCopy, Folder, FolderOpened, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { FORM_TYPES } from '../../constants/form'

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
const formStore = useFormStore()

// 响应式数据
const folderLoading = ref(false)
const formLoading = ref(false)
const folderDialogVisible = ref(false)
const formDialogVisible = ref(false)
const batchImportDialogVisible = ref(false)
const isEditFolderMode = ref(false)
const isEditFormMode = ref(false)
const selectedFolderId = ref(null)
const formSearchKeyword = ref('')
const formSortBy = ref('created_at')
const selectedFormIds = ref([])

// 文件夹表单
const folderForm = reactive({
  folder_name: '',
  description: ''
})

// 文件夹表单验证规则
const folderRules = computed(() => ({
  folder_name: [{ required: true, message: t('formList.folderNamePlaceholder'), trigger: 'blur' }]
}))

// 表单表单
const formForm = reactive({
  template_name: '',
  form_url: '',
  form_type: '',
  folder_id: ''
})

// 表单表单验证规则
const formRules = computed(() => ({
  template_name: [{ required: true, message: t('formList.formNamePlaceholder'), trigger: 'blur' }],
  form_url: [{ required: true, message: t('formList.formUrlPlaceholder'), trigger: 'blur' }],
  form_type: [{ required: true, message: t('formList.formTypePlaceholder'), trigger: 'change' }],
  folder_id: [{ required: true, message: t('formList.folderSelectPlaceholder'), trigger: 'change' }]
}))

// 批量导入表单
const batchImportForm = reactive({
  formUrls: '',
  folder_id: '',
  form_type: ''
})

// 批量导入表单验证规则
const batchImportRules = computed(() => ({
  formUrls: [{ required: true, message: t('formList.formUrlPlaceholder'), trigger: 'blur' }],
  folder_id: [{ required: true, message: t('formList.folderSelectPlaceholder'), trigger: 'change' }],
  form_type: [{ required: true, message: t('formList.formTypePlaceholder'), trigger: 'change' }]
}))

// 表单引用
const folderFormRef = ref(null)
const formFormRef = ref(null)
const batchImportFormRef = ref(null)

// 计算属性
const folders = computed(() => formStore.folders)
const sortedFolders = computed(() => {
  return [...folders.value].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at)
  })
})
const forms = computed(() => formStore.templates)
const selectedFolder = computed(() => {
  return folders.value.find(f => f.id === selectedFolderId.value)
})

// 筛选后的表单
const filteredForms = computed(() => {
  return forms.value.filter(form => {
    // 文件夹筛选
    if (selectedFolderId.value && form.folder_id !== selectedFolderId.value) {
      return false
    }
    // 关键词搜索
    if (formSearchKeyword.value) {
      const keyword = formSearchKeyword.value.toLowerCase()
      if (!form.template_name.toLowerCase().includes(keyword) && 
          !form.form_url.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })
})

// 筛选并排序后的表单
const filteredAndSortedForms = computed(() => {
  const sorted = [...filteredForms.value]
  sorted.sort((a, b) => {
    if (formSortBy.value === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (formSortBy.value === 'last_fill_time') {
      const timeA = a.last_fill_time ? new Date(a.last_fill_time) : new Date(0)
      const timeB = b.last_fill_time ? new Date(b.last_fill_time) : new Date(0)
      return timeB - timeA
    }
    return 0
  })
  return sorted
})

// 文件夹树属性
const folderTreeProps = {
  children: 'children',
  label: 'folder_name'
}

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

// 获取文件夹下的表单数量
const getFormCountByFolder = (folderId) => {
  return forms.value.filter(form => form.folder_id === folderId).length
}

// 点击文件夹
const handleFolderClick = (folder) => {
  selectedFolderId.value = folder.id
}

// 点击全部表单
const handleAllFormsClick = () => {
  selectedFolderId.value = null
}

// 选择表单
const handleFormSelectionChange = (selection) => {
  selectedFormIds.value = selection.map(item => item.id)
}

// 打开新增文件夹弹窗
const openAddFolderDialog = () => {
  isEditFolderMode.value = false
  // 重置表单
  Object.keys(folderForm).forEach(key => {
    folderForm[key] = ''
  })
  // 默认填充当前日期
  const today = new Date().toISOString().split('T')[0]
  folderForm.folder_name = today
  folderDialogVisible.value = true
}

// 打开编辑文件夹弹窗
const openEditFolderDialog = (folder) => {
  isEditFolderMode.value = true
  // 复制文件夹数据到表单
  Object.assign(folderForm, folder)
  folderDialogVisible.value = true
}

// 保存文件夹
const saveFolder = async () => {
  if (!folderFormRef.value) return
  
  try {
    await folderFormRef.value.validate()
    
    if (isEditFolderMode.value) {
      await formStore.updateFolder(folderForm.id, folderForm)
    } else {
      await formStore.addFolder(folderForm)
    }
    
    folderDialogVisible.value = false
    ElMessage.success(isEditFolderMode.value ? t('formList.folderEditSuccess') : t('formList.folderCreateSuccess'))
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// 删除文件夹
const handleDeleteFolder = (id) => {
  // 检查文件夹下是否有表单
  const formCount = getFormCountByFolder(id)
  if (formCount > 0) {
    ElMessage.warning(t('formList.folderDeleteWarn', { count: formCount }))
    return
  }
  
  ElMessageBox.confirm(t('formList.folderDeleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    formStore.deleteFolder(id)
    if (selectedFolderId.value === id) {
      selectedFolderId.value = null
    }
    ElMessage.success(t('formList.folderDeleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 打开新增表单弹窗
const openAddFormDialog = () => {
  isEditFormMode.value = false
  // 重置表单
  Object.keys(formForm).forEach(key => {
    formForm[key] = ''
  })
  // 默认选中当前文件夹
  if (selectedFolderId.value) {
    formForm.folder_id = selectedFolderId.value
  }
  formDialogVisible.value = true
}

// 打开编辑表单弹窗
const openEditFormDialog = (form) => {
  isEditFormMode.value = true
  // 复制表单数据到表单
  Object.assign(formForm, form)
  formDialogVisible.value = true
}

// 保存表单
const saveForm = async () => {
  if (!formFormRef.value) return
  
  try {
    await formFormRef.value.validate()
    
    if (isEditFormMode.value) {
      formStore.updateTemplate(formForm.id, formForm)
    } else {
      formStore.addTemplate(formForm)
    }
    
    formDialogVisible.value = false
    ElMessage.success(isEditFormMode.value ? t('formList.formEditSuccess') : t('formList.formCreateSuccess'))
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// 删除表单
const handleDeleteForm = (id) => {
  ElMessageBox.confirm(t('formList.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    formStore.deleteTemplate(id)
    ElMessage.success(t('formList.deleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 批量导入
const handleBatchImport = () => {
  // 重置批量导入表单
  batchImportForm.formUrls = ''
  batchImportForm.folder_id = selectedFolderId.value || (sortedFolders.value.length > 0 ? sortedFolders.value[0].id : '')
  batchImportForm.form_type = ''
  batchImportDialogVisible.value = true
}

// 处理导入
const handleImport = async () => {
  if (!batchImportFormRef.value) return
  
  try {
    await batchImportFormRef.value.validate()
    
    // 解析表单链接
    const urls = batchImportForm.formUrls.split('\n').filter(url => url.trim())
    
    // 批量添加表单
    urls.forEach((url, index) => {
      const formData = {
        template_name: `${t('formList.formDefaultName')}${index + 1}`,
        form_url: url.trim(),
        form_type: batchImportForm.form_type,
        folder_id: batchImportForm.folder_id
      }
      formStore.addTemplate(formData)
    })
    
    batchImportDialogVisible.value = false
    ElMessage.success(t('formList.importSuccessCount', { count: urls.length }))
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// 批量导出
const handleBatchExport = () => {
  if (filteredAndSortedForms.value.length === 0) {
    ElMessage.warning(t('formList.noFormExport'))
    return
  }
  ElMessage.info(t('formList.exportDev'))
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedFormIds.value.length === 0) {
    ElMessage.warning(t('formList.selectDelete'))
    return
  }
  
  ElMessageBox.confirm(t('formList.batchDeleteConfirm', { count: selectedFormIds.value.length }), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    selectedFormIds.value.forEach(id => {
      formStore.deleteTemplate(id)
    })
    selectedFormIds.value = []
    ElMessage.success(t('formList.deleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 复制表单链接
const copyFormUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success(t('common.copySuccess'))
  }).catch(() => {
    ElMessage.error(t('common.copyFailed'))
  })
}

// 跳转到填写页面
const navigateToFill = (formId) => {
  router.push(`/form`)
  // 这里可以添加跳转到填写页面后自动选择该表单的逻辑
}

// 生命周期
onMounted(() => {
  // 初始化数据
  if (folders.value.length === 0) {
    // 默认创建今天的文件夹
    const today = new Date().toISOString().split('T')[0]
    formStore.addFolder({ folder_name: today, description: t('formList.todayFolderDesc') })
  }
})
</script>

<style scoped lang="scss">
.form-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  box-sizing: border-box;

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

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .form-list-container {
    display: flex;
    gap: var(--spacing-lg);
    flex: 1;
    overflow: hidden; // 防止整体滚动

    .folder-management {
      width: 360px;
      min-width: 360px;
      display: flex;
      flex-direction: column;

      .glass-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    }

    .form-link-list {
      flex: 1;
      min-width: 0; // 防止 flex 子项溢出
      display: flex;
      flex-direction: column;

      .glass-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    }
  }

  .section-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color-lighter);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .subtitle {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color-primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  }

  .folder-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
  }

  // 自定义滚动条
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: var(--border-radius-md);
    }
    &:hover::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: var(--border-radius-md);
    }
  }

  // 文件夹节点样式重构
  :deep(.el-tree) {
    background: transparent;
  }
  
  :deep(.el-tree-node__content) {
    height: auto; // 让内容决定高度
    padding: 0 !important; // 移除默认 padding，我们在内部控制
    background: transparent !important;
    margin-bottom: 4px;
  }

  .folder-node,
  .all-forms-node {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 12px;
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color-regular);
    position: relative;
    user-select: none;

    &:hover {
      background-color: var(--bg-color-light);
      color: var(--primary-color);
      
      .folder-node-actions {
        opacity: 1;
        transform: translateX(0);
      }
    }

    &.active {
      background-color: rgba(64, 158, 255, 0.08);
      color: var(--primary-color);
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: var(--primary-color);
        border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
      }
    }

    .node-icon {
      font-size: 18px;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .node-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      min-width: 0; // 确保 flex 子项可以正确收缩
    }

    .form-count {
      font-size: 12px;
      color: var(--text-color-secondary);
      background: var(--bg-color-light);
      padding: 2px 6px;
      border-radius: var(--border-radius-xl);
      margin-left: 8px;
    }

    .folder-node-actions {
      display: flex;
      gap: 4px;
      margin-left: 8px;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.2s ease;
    }
  }

  .all-forms-node {
    margin-bottom: 4px;
  }

  .form-table-container {
    flex: 1;
    overflow-y: auto;
    padding: 0; // 表格贴边

    :deep(.el-table) {
      --el-table-border-color: var(--border-color-lighter);
      
      th.el-table__cell {
        background-color: var(--bg-color-light);
        color: var(--text-color-regular);
        font-weight: 600;
        height: 50px;
      }

      .el-table__row {
        height: 60px; // 增加行高
      }
    }
  }

  .form-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--text-color-primary);
  }

  .form-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 13px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }

  .table-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .empty-state {
    padding: 60px 0;
    display: flex;
    justify-content: center;
  }

  // 响应式
  @media (max-width: 1200px) {
    .form-list-container {
      flex-direction: column;
      overflow-y: auto;
      
      .folder-management,
      .form-link-list {
        width: 100%;
        min-height: 400px;
      }
    }
  }
}
</style>
