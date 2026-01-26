<template>
  <div class="form-list-page" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">表单列表</h2>
      <div class="header-actions">
        <el-tooltip content="新增表单" placement="bottom">
          <el-button circle size="small" type="primary" plain @click="openAddFormDialog">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="批量导入" placement="bottom">
          <el-button circle size="small" type="primary" plain @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="批量导出" placement="bottom">
          <el-button circle size="small" type="success" plain @click="handleBatchExport">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="批量删除" placement="bottom">
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
        <div class="card">
          <div class="section-header">
            <h3 class="subtitle">文件夹管理</h3>
            <div class="header-actions">
              <el-tooltip content="新建文件夹" placement="top">
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
              <span class="node-label">全部表单</span>
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
        <div class="card">
          <div class="section-header">
            <h3 class="subtitle">
              {{ selectedFolder ? selectedFolder.folder_name : '全部表单' }}
            </h3>
            <div class="header-actions">
              <el-input
                v-model="formSearchKeyword"
                placeholder="搜索表单"
                clearable
                class="form-search"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="formSortBy" placeholder="排序">
                <el-option label="创建时间" value="created_at" />
                <el-option label="最后填写时间" value="last_fill_time" />
              </el-select>
            </div>
          </div>

          <!-- 表单列表 -->
          <div class="form-table-container">
            <el-table
              v-loading="formLoading"
              :data="filteredAndSortedForms"
              style="width: 100%"
              @selection-change="handleFormSelectionChange"
              border
            >
              <el-table-column type="selection" width="55" :resizable="false" />
              <el-table-column prop="template_name" label="表单名称" min-width="180" :resizable="false">
                <template #default="scope">
                  <div class="form-name">
                    {{ scope.row.template_name }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="form_type" label="表单类型" width="100" :resizable="false">
                <template #default="scope">
                  <el-tag size="small">{{ scope.row.form_type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="form_url" label="表单链接" min-width="250" :resizable="false">
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
                      <el-tooltip content="复制链接" placement="top">
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
              <el-table-column prop="created_at" label="添加时间" width="160" :resizable="false">
                <template #default="scope">
                  {{ formatDate(scope.row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column prop="last_fill_time" label="最后填写时间" width="160" :resizable="false">
                <template #default="scope">
                  {{ scope.row.last_fill_time ? formatDate(scope.row.last_fill_time) : '-' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right" :resizable="false" align="center">
                <template #default="scope">
                  <div class="table-actions" style="display: flex; justify-content: center; gap: 8px;">
                    <el-tooltip content="去填写" placement="top">
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
                    <el-tooltip content="编辑" placement="top">
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
                    <el-tooltip content="删除" placement="top">
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
              <el-empty description="暂无表单" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑文件夹弹窗 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="isEditFolderMode ? '编辑文件夹' : '新建文件夹'"
      width="400px"
    >
      <el-form
        :model="folderForm"
        :rules="folderRules"
        ref="folderFormRef"
        label-width="80px"
      >
        <el-form-item label="文件夹名称" prop="folder_name">
          <el-input v-model="folderForm.folder_name" placeholder="请输入文件夹名称" />
        </el-form-item>
        <el-form-item label="文件夹描述">
          <el-input
            v-model="folderForm.description"
            type="textarea"
            rows="2"
            placeholder="请输入文件夹描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="folderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFolder">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑表单弹窗 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditFormMode ? '编辑表单' : '新增表单'"
      width="600px"
    >
      <el-form
        :model="formForm"
        :rules="formRules"
        ref="formFormRef"
        label-width="100px"
      >
        <el-form-item label="表单名称" prop="template_name">
          <el-input v-model="formForm.template_name" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="表单链接" prop="form_url">
          <el-input v-model="formForm.form_url" placeholder="请输入表单链接" />
        </el-form-item>
        <el-form-item label="表单类型" prop="form_type">
          <el-select v-model="formForm.form_type" placeholder="请选择表单类型">
            <el-option label="腾讯文档" value="腾讯文档" />
            <el-option label="问卷星" value="问卷星" />
            <el-option label="石墨文档" value="石墨文档" />
            <el-option label="麦克CRM" value="麦克CRM" />
            <el-option label="WPS表单" value="WPS表单" />
            <el-option label="微信小程序" value="微信小程序" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属文件夹" prop="folder_id">
          <el-select v-model="formForm.folder_id" placeholder="请选择文件夹">
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
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="batchImportDialogVisible"
      title="批量导入表单链接"
      width="600px"
    >
      <el-form
        :model="batchImportForm"
        :rules="batchImportRules"
        ref="batchImportFormRef"
        label-width="100px"
      >
        <el-form-item label="表单链接" prop="formUrls">
          <el-input
            v-model="batchImportForm.formUrls"
            type="textarea"
            rows="6"
            placeholder="请输入多个表单链接，每行一个"
          />
          <div class="form-tip">请确保每个链接占据一行</div>
        </el-form-item>
        <el-form-item label="归属文件夹" prop="folder_id">
          <el-select v-model="batchImportForm.folder_id" placeholder="请选择文件夹">
            <el-option
              v-for="folder in sortedFolders"
              :key="folder.id"
              :label="folder.folder_name"
              :value="folder.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="表单类型" prop="form_type">
          <el-select v-model="batchImportForm.form_type" placeholder="请选择表单类型">
            <el-option label="腾讯文档" value="腾讯文档" />
            <el-option label="问卷星" value="问卷星" />
            <el-option label="石墨文档" value="石墨文档" />
            <el-option label="麦克CRM" value="麦克CRM" />
            <el-option label="WPS表单" value="WPS表单" />
            <el-option label="微信小程序" value="微信小程序" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchImportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport">导入</el-button>
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
const folderRules = {
  folder_name: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }]
}

// 表单表单
const formForm = reactive({
  template_name: '',
  form_url: '',
  form_type: '',
  folder_id: ''
})

// 表单表单验证规则
const formRules = {
  template_name: [{ required: true, message: '请输入表单名称', trigger: 'blur' }],
  form_url: [{ required: true, message: '请输入表单链接', trigger: 'blur' }],
  form_type: [{ required: true, message: '请选择表单类型', trigger: 'change' }],
  folder_id: [{ required: true, message: '请选择归属文件夹', trigger: 'change' }]
}

// 批量导入表单
const batchImportForm = reactive({
  formUrls: '',
  folder_id: '',
  form_type: ''
})

// 批量导入表单验证规则
const batchImportRules = {
  formUrls: [{ required: true, message: '请输入表单链接', trigger: 'blur' }],
  folder_id: [{ required: true, message: '请选择归属文件夹', trigger: 'change' }],
  form_type: [{ required: true, message: '请选择表单类型', trigger: 'change' }]
}

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
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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
      formStore.updateFolder(folderForm.id, folderForm)
    } else {
      formStore.addFolder(folderForm)
    }
    
    folderDialogVisible.value = false
    ElMessage.success(isEditFolderMode.value ? '文件夹编辑成功' : '文件夹创建成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 删除文件夹
const handleDeleteFolder = (id) => {
  // 检查文件夹下是否有表单
  const formCount = getFormCountByFolder(id)
  if (formCount > 0) {
    ElMessage.warning(`该文件夹下还有 ${formCount} 个表单，无法删除`)
    return
  }
  
  ElMessageBox.confirm('确定要删除该文件夹吗？删除后不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formStore.deleteFolder(id)
    if (selectedFolderId.value === id) {
      selectedFolderId.value = null
    }
    ElMessage.success('文件夹删除成功')
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
    ElMessage.success(isEditFormMode.value ? '表单编辑成功' : '表单创建成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 删除表单
const handleDeleteForm = (id) => {
  ElMessageBox.confirm('确定要删除该表单吗？删除后不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formStore.deleteTemplate(id)
    ElMessage.success('表单删除成功')
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
        template_name: `表单${index + 1}`,
        form_url: url.trim(),
        form_type: batchImportForm.form_type,
        folder_id: batchImportForm.folder_id
      }
      formStore.addTemplate(formData)
    })
    
    batchImportDialogVisible.value = false
    ElMessage.success(`成功导入 ${urls.length} 个表单`)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 批量导出
const handleBatchExport = () => {
  if (filteredAndSortedForms.value.length === 0) {
    ElMessage.warning('暂无表单可导出')
    return
  }
  ElMessage.info('批量导出功能开发中')
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedFormIds.value.length === 0) {
    ElMessage.warning('请选择要删除的表单')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedFormIds.value.length} 个表单吗？删除后不可恢复`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedFormIds.value.forEach(id => {
      formStore.deleteTemplate(id)
    })
    selectedFormIds.value = []
    ElMessage.success('表单删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 复制表单链接
const copyFormUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制')
  }).catch(() => {
    ElMessage.error('复制失败')
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
    formStore.addFolder({ folder_name: today, description: '今天的表单' })
  }
})
</script>

<style scoped lang="scss">
.form-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding: 0 var(--spacing-xs);

    .title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color-primary);
      position: relative;
      padding-left: 16px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 2px;
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
    }

    .form-link-list {
      flex: 1;
      min-width: 0; // 防止 flex 子项溢出
      display: flex;
      flex-direction: column;
    }
  }

  .card {
    background: var(--bg-color-white);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--box-shadow-light);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: box-shadow 0.3s ease;
    border: 1px solid var(--border-color-lighter);

    &:hover {
      box-shadow: var(--box-shadow);
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
      border-radius: 4px;
    }
    &:hover::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
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
    border-radius: 8px;
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
        border-radius: 0 2px 2px 0;
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
      border-radius: 10px;
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
