<template>
  <div class="global-mapping-container">
    <div class="page-header">
      <div class="header-left">
        <div class="title-content">
          <h2 class="title">{{ $t('globalMapping.title') }}</h2>
          <p class="subtitle">{{ $t('globalMapping.subtitle') }}</p>
        </div>
      </div>
      <div class="header-right">
        <el-button 
          type="danger" 
          plain 
          :disabled="selectedRules.length === 0"
          @click="handleBulkDelete"
        >
          <el-icon><Delete /></el-icon>
          {{ $t('common.batchDelete') }}
        </el-button>
        <el-button type="primary" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          {{ $t('common.add') }}
        </el-button>
      </div>
    </div>

    <div class="content-wrapper glass-card">
      <div class="table-container">
        <el-table
          :data="rules"
          style="width: 100%"
          v-loading="loading"
          stripe
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="keyword" :label="$t('globalMapping.keyword')" min-width="180">
            <template #default="{ row }">
              <el-tag effect="plain" type="info">{{ row.keyword }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column :label="$t('globalMapping.arrow')" width="60" align="center">
            <template #default>
              <el-icon><Right /></el-icon>
            </template>
          </el-table-column>
  
          <el-table-column prop="account_field_name" :label="$t('globalMapping.accountField')" min-width="180">
            <template #default="{ row }">
              <el-tag effect="dark" :type="getFieldType(row.account_field_name)">
                {{ getFieldName(row.account_field_name) }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column :label="$t('common.action')" width="150" align="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
          
          <template #empty>
            <el-empty :description="$t('globalMapping.empty')" />
          </template>
        </el-table>
      </div>
    </div>

    <!-- 编辑/添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('globalMapping.editTitle') : $t('globalMapping.addTitle')"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules_validation" label-width="100px">
        <el-form-item :label="$t('globalMapping.keyword')" prop="keyword">
          <el-input 
            v-model="form.keyword" 
            :placeholder="$t('globalMapping.keywordPlaceholder')"
            :disabled="isEdit"
          />
          <div class="form-tip">{{ $t('globalMapping.keywordTip') }}</div>
        </el-form-item>
        
        <el-form-item :label="$t('globalMapping.accountField')" prop="account_field_name">
          <el-select 
            v-model="form.account_field_name" 
            :placeholder="$t('globalMapping.accountFieldPlaceholder')"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="field in accountFields"
              :key="field.id"
              :label="field.label"
              :value="field.name"
            >
              <span style="float: left">{{ field.label }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                {{ field.name }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ $t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Plus, Edit, Delete, Right } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getDefaultAccountFields } from '../../constants/accountFields'

const { t } = useI18n()

// 状态
const loading = ref(false)
const submitting = ref(false)
const rules = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const selectedRules = ref([])

// 表单数据
const form = reactive({
  id: null,
  keyword: '',
  account_field_name: ''
})

// 验证规则
const rules_validation = {
  keyword: [
    { required: true, message: t('globalMapping.keywordRequired'), trigger: 'blur' },
    { min: 2, message: t('globalMapping.keywordMinLength'), trigger: 'blur' }
  ],
  account_field_name: [
    { required: true, message: t('globalMapping.accountFieldRequired'), trigger: 'change' }
  ]
}

// 账号字段列表
const accountFields = ref([])

// 加载账号字段定义
const loadAccountFields = () => {
  const savedFields = localStorage.getItem('customFields_v8')
  if (savedFields) {
    try {
      accountFields.value = JSON.parse(savedFields)
    } catch (e) {
      console.error('Failed to parse custom fields', e)
      accountFields.value = getDefaultAccountFields(t)
    }
  } else {
    accountFields.value = getDefaultAccountFields(t)
  }
}

// 获取字段名称
const getFieldName = (fieldName) => {
  const field = accountFields.value.find(f => f.name === fieldName)
  return field ? field.label : fieldName
}

// 获取字段类型样式（基于字段名生成唯一颜色）
const getFieldType = (fieldName) => {
  // 生成哈希值
  let hash = 0
  for (let i = 0; i < fieldName.length; i++) {
    hash = fieldName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // 预定义的 Element Plus tag 类型
  const types = ['', 'success', 'warning', 'danger', 'info']
  
  // 取模得到索引
  const index = Math.abs(hash) % types.length
  return types[index]
}

// 加载规则列表
const loadRules = async () => {
  loading.value = true
  try {
    const result = await window.electronAPI.db.query('SELECT * FROM global_field_mappings ORDER BY created_at DESC')
    rules.value = result || []
  } catch (error) {
    ElMessage.error(t('common.loadFailed') + ': ' + error.message)
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const handleAddRule = () => {
  isEdit.value = false
  form.id = null
  form.keyword = ''
  form.account_field_name = ''
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.keyword = row.keyword
  form.account_field_name = row.account_field_name
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await window.electronAPI.db.run(
            'UPDATE global_field_mappings SET keyword = ?, account_field_name = ? WHERE id = ?', 
            [form.keyword, form.account_field_name, form.id]
          )
          ElMessage.success(t('common.updateSuccess'))
        } else {
          const parts = (form.keyword || '').split(/[,，\s]+/).map(s => s.trim()).filter(Boolean)
          if (parts.length === 0) throw new Error('EMPTY_KEYWORDS')
          for (const k of parts) {
            try {
              await window.electronAPI.db.run(
                'INSERT INTO global_field_mappings (keyword, account_field_name) VALUES (?, ?)', 
                [k, form.account_field_name]
              )
            } catch (e) {
              if (!e.message.includes('UNIQUE constraint')) throw e
            }
          }
          ElMessage.success(t('common.addSuccess'))
        }
        dialogVisible.value = false
        loadRules()
      } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
          ElMessage.error(t('globalMapping.keywordExists'))
        } else {
          ElMessage.error(t('common.operationFailed') + ': ' + error.message)
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除规则
const handleDelete = (row) => {
  ElMessageBox.confirm(
    t('globalMapping.deleteConfirm', { keyword: row.keyword }),
    t('common.warning'),
    {
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await window.electronAPI.db.run('DELETE FROM global_field_mappings WHERE id = ?', [row.id])
      ElMessage.success(t('common.deleteSuccess'))
      loadRules()
    } catch (error) {
      ElMessage.error(t('common.deleteFailed') + ': ' + error.message)
    }
  })
}

// 批量删除
const handleBulkDelete = () => {
  if (selectedRules.value.length === 0) return
  
  ElMessageBox.confirm(
    t('globalMapping.bulkDeleteConfirm', { count: selectedRules.value.length }),
    t('common.warning'),
    {
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      const ids = selectedRules.value.map(row => row.id)
      for (const id of ids) {
        await window.electronAPI.db.run('DELETE FROM global_field_mappings WHERE id = ?', [id])
      }
      ElMessage.success(t('common.deleteSuccess'))
      loadRules()
      selectedRules.value = []
    } catch (error) {
      ElMessage.error(t('common.deleteFailed') + ': ' + error.message)
    } finally {
      loading.value = false
    }
  })
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRules.value = selection
}

onMounted(() => {
  loadAccountFields()
  loadRules()
})
</script>

<style scoped lang="scss">
.global-mapping-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    padding-left: var(--spacing-sm);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .title-content {
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

        .subtitle {
          margin: 8px 0 0;
          color: var(--text-secondary);
          font-size: 14px;
          padding-left: 18px; /* 对齐标题文字 */
        }
      }
    }
  }

  .content-wrapper {
    flex: 1;
    overflow: hidden;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    padding: 20px;
    display: flex;
    flex-direction: column;

    .table-container {
      flex: 1;
      overflow: hidden;
      
      :deep(.el-table) {
        background: transparent;
        --el-table-tr-bg-color: transparent;
        --el-table-header-bg-color: rgba(255, 255, 255, 0.05);
        
        th.el-table__cell {
          background-color: var(--el-table-header-bg-color);
          color: var(--text-primary);
          font-weight: 600;
        }

        tr {
          background-color: transparent;
        }

        .el-table__inner-wrapper::before {
          display: none;
        }
      }
    }
  }
}

.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 4px;
}
</style>
