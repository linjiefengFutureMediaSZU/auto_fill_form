<template>
  <div class="dynamic-field-manager">
    <!-- 字段管理标题 -->
    <div class="manager-header">
      <h3>{{ $t('fieldManager.title') }}</h3>
      <el-button type="primary" size="small" @click="openAddFieldDialog">{{ $t('fieldManager.addField') }}</el-button>
    </div>

    <!-- 字段列表 -->
    <div class="field-list">
      <div v-for="(field, index) in fields" :key="field.id" class="field-item">
        <div class="field-info">
          <el-tag size="small" :type="getFieldTypeTagType(field.type)">{{ $t(`fieldManager.types.${field.type}`) }}</el-tag>
          <span class="field-label">{{ field.label }}</span>
          <span class="field-name">{{ field.name }}</span>
        </div>
        <div class="field-actions">
          <el-button type="primary" size="small" @click="openEditFieldDialog(field)" style="margin-right: 8px;">{{ $t('common.edit') }}</el-button>
          <el-button type="danger" size="small" @click="removeField(index)">{{ $t('common.delete') }}</el-button>
        </div>
      </div>
      <div v-if="fields.length === 0" class="empty-fields">
        <el-empty :description="$t('fieldManager.noFields')" />
      </div>
    </div>

    <!-- 添加/编辑字段弹窗 -->
    <el-dialog
      v-model="fieldDialogVisible"
      :title="isEditFieldMode ? $t('fieldManager.editField') : $t('fieldManager.addField')"
      width="500px"
    >
      <el-form :model="fieldForm" label-width="100px">
        <el-form-item :label="$t('fieldManager.fieldLabel')">
          <el-input v-model="fieldForm.label" :placeholder="$t('fieldManager.placeholders.label')" />
        </el-form-item>
        <el-form-item :label="$t('fieldManager.fieldName')">
          <el-input v-model="fieldForm.name" :placeholder="$t('fieldManager.placeholders.name')" />
        </el-form-item>
        <el-form-item :label="$t('fieldManager.fieldType')">
          <el-select v-model="fieldForm.type" :placeholder="$t('fieldManager.placeholders.type')">
            <el-option :label="$t('fieldManager.types.text')" value="text" />
            <el-option :label="$t('fieldManager.types.number')" value="number" />
            <el-option :label="$t('fieldManager.types.select')" value="select" />
            <el-option :label="$t('fieldManager.types.multiple_select')" value="multiple_select" />
            <el-option :label="$t('fieldManager.types.switch')" value="switch" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('fieldManager.optionsConfig')" v-if="fieldForm.type === 'select' || fieldForm.type === 'multiple_select'">
          <el-input v-model="fieldForm.options" :placeholder="$t('fieldManager.placeholders.options')" />
        </el-form-item>
        <el-form-item :label="$t('fieldManager.fieldGroup')">
          <el-select v-model="fieldForm.group" :placeholder="$t('fieldManager.placeholders.group')">
            <el-option :label="$t('fieldManager.groups.basic')" value="basic" />
            <el-option :label="$t('fieldManager.groups.data')" value="data" />
            <el-option :label="$t('fieldManager.groups.cooperation')" value="cooperation" />
            <el-option :label="$t('fieldManager.groups.remark')" value="remark" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('fieldManager.placeholder')">
          <el-input v-model="fieldForm.placeholder" :placeholder="$t('fieldManager.placeholders.placeholder')" />
        </el-form-item>
        <el-form-item :label="$t('fieldManager.defaultValue')">
          <el-input v-model="fieldForm.defaultValue" :placeholder="$t('fieldManager.placeholders.defaultValue')" />
        </el-form-item>
        <el-form-item :label="$t('fieldManager.isRequired')">
          <el-switch v-model="fieldForm.required" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="fieldDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveField">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const fields = ref([...props.modelValue])
const fieldDialogVisible = ref(false)
const isEditFieldMode = ref(false)
const editingFieldIndex = ref(-1)

// 字段表单
const fieldForm = reactive({
  label: '',
  name: '',
  type: 'text',
  group: 'basic',
  placeholder: '',
  defaultValue: '',
  options: '',
  required: false
})

// 计算属性
const getFieldTypeTagType = (type) => {
  const typeMap = {
    text: 'info',
    number: 'success',
    select: 'warning',
    multiple_select: 'warning',
    switch: 'danger'
  }
  return typeMap[type] || 'info'
}

// 方法
const openAddFieldDialog = () => {
  isEditFieldMode.value = false
  editingFieldIndex.value = -1
  // 重置表单
  Object.keys(fieldForm).forEach(key => {
    fieldForm[key] = ''
  })
  fieldForm.type = 'text'
  fieldForm.group = 'basic'
  fieldForm.required = false
  fieldForm.options = ''
  fieldDialogVisible.value = true
}

const openEditFieldDialog = (field) => {
  isEditFieldMode.value = true
  editingFieldIndex.value = fields.value.findIndex(f => f.id === field.id)
  // 复制字段数据到表单
  Object.assign(fieldForm, field)
  fieldDialogVisible.value = true
}

const saveField = () => {
  // 验证必填字段
  if (!fieldForm.label || !fieldForm.name) {
    ElMessage.warning(t('fieldManager.messages.labelNameRequired'))
    return
  }

  // 生成唯一ID
  const fieldId = isEditFieldMode.value ? fieldForm.id : Date.now().toString()

  // 构建字段对象
  const newField = {
    id: fieldId,
    label: fieldForm.label,
    name: fieldForm.name,
    type: fieldForm.type,
    group: fieldForm.group,
    placeholder: fieldForm.placeholder,
    defaultValue: fieldForm.defaultValue,
    options: fieldForm.options,
    required: fieldForm.required
  }

  // 保存字段
  if (isEditFieldMode.value) {
    fields.value[editingFieldIndex.value] = newField
  } else {
    fields.value.push(newField)
  }

  // 更新父组件
  emit('update:modelValue', [...fields.value])
  
  // 关闭弹窗
  fieldDialogVisible.value = false
  ElMessage.success(isEditFieldMode.value ? t('fieldManager.messages.editSuccess') : t('fieldManager.messages.addSuccess'))
}

const removeField = (index) => {
  fields.value.splice(index, 1)
  emit('update:modelValue', [...fields.value])
  ElMessage.success(t('fieldManager.messages.deleteSuccess'))
}
</script>

<style scoped lang="scss">
.dynamic-field-manager {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  background-color: var(--bg-color-light);
  transition: all 0.3s ease;

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color-primary);
    }
  }

  .field-list {
    .field-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: var(--bg-color-white);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      margin-bottom: 10px;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary-color);
      }

      .field-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .field-label {
          font-weight: 500;
          min-width: 100px;
          color: var(--text-color-primary);
        }

        .field-name {
          color: var(--text-color-regular);
          font-size: 14px;
        }
      }

      .field-actions {
        display: flex;
      }
    }

    .empty-fields {
      padding: 40px 0;
    }
  }
}

/* 深色模式适配 */
:global(body.dark-theme) .dynamic-field-manager {
  background-color: var(--bg-color-white);
  border-color: var(--border-color);

  .manager-header {
    h3 {
      color: var(--text-color-primary);
    }
  }

  .field-list {
    .field-item {
      background-color: var(--bg-color-light);
      border-color: var(--border-color);

      .field-info {
        .field-label {
          color: var(--text-color-primary);
        }

        .field-name {
          color: var(--text-color-regular);
        }
      }
    }
  }
}
</style>