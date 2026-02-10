<template>
  <div class="dynamic-form">
    <el-collapse v-model="activeNames">
    <el-collapse-item :title="$t('dynamicForm.basicInfo')" name="basic">
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('basic')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt.value || opt"
                :label="opt.label || opt"
                :value="opt.value || opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>

    <el-collapse-item :title="$t('dynamicForm.dataInfo')" name="data">
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('data')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt.value || opt"
                :label="opt.label || opt"
                :value="opt.value || opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>

    <el-collapse-item :title="$t('dynamicForm.cooperationInfo')" name="cooperation">
      <!-- 固定字段 -->
      <el-form-item :label="$t('dynamicForm.quoteSingle')">
        <div v-for="(item, index) in formData.quote_single" :key="index" class="quote-item">
          <el-input-number v-model="formData.quote_single[index]" :min="0" :step="0.01" :placeholder="$t('dynamicForm.quoteSinglePlaceholder')" style="width: 200px; margin-right: 10px;" />
          <el-button type="danger" size="small" @click="removeQuoteItem(index)" v-if="formData.quote_single.length > 1">{{ $t('dynamicForm.delete') }}</el-button>
        </div>
        <el-button type="primary" size="small" @click="addQuoteItem" style="margin-top: 10px;">{{ $t('dynamicForm.add') }}</el-button>
      </el-form-item>
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('cooperation')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt.value || opt"
                :label="opt.label || opt"
                :value="opt.value || opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>

    <el-collapse-item :title="$t('dynamicForm.remarkInfo')" name="remark">
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('remark')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt.value || opt"
                :label="opt.label || opt"
                :value="opt.value || opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const formData = ref({ ...props.modelValue })
const activeNames = ref(['basic', 'data', 'cooperation', 'remark'])

// 监听 props.modelValue 变化，同步到 formData
// 注意：移除了对 props.modelValue 的深层监听，避免父组件更新导致的回环
watch(() => props.modelValue, (newVal) => {
  // 只在 id 变化（切换账号）或者明确重置时才重新赋值，防止编辑时的回环
  if (newVal.id !== formData.value.id) {
     formData.value = { ...newVal }
  }
}, { deep: true })

// 监听 formData 变化，同步到父组件
watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 计算属性
const getFieldsByGroup = (group) => {
  return props.fields.filter(field => field.group === group)
}

// 方法
const getFieldComponent = (type) => {
  const componentMap = {
    text: 'el-input',
    number: 'el-input-number',
    select: 'el-select',
    multiple_select: 'el-select',
    switch: 'el-switch'
  }
  return componentMap[type] || 'el-input'
}

const getFieldProps = (field) => {
  // 确保字段值存在
  if (formData.value[field.name] === undefined) {
    formData.value[field.name] = field.defaultValue || ''
  }

  const baseProps = {
    modelValue: formData.value[field.name],
    placeholder: field.placeholder || t('account.enter') + field.label,
    'onUpdate:modelValue': (value) => {
      formData.value[field.name] = value
      emit('update:modelValue', { ...formData.value })
    }
  }

  const propsMap = {
    text: {
      ...baseProps
    },
    number: {
      ...baseProps,
      modelValue: formData.value[field.name] || 0,
      min: 0
    },
    select: {
      ...baseProps,
      placeholder: field.placeholder || t('account.select') + field.label
    },
    multiple_select: {
      ...baseProps,
      placeholder: field.placeholder || t('account.select') + field.label,
      multiple: true,
      'collapse-tags': true
    },
    switch: {
      modelValue: formData.value[field.name] || false,
      'onUpdate:modelValue': (value) => {
        formData.value[field.name] = value
        emit('update:modelValue', { ...formData.value })
      }
    }
  }
  return propsMap[field.type] || propsMap.text
}

const getFieldOptions = (field) => {
  if (!field.options) return []
  if (Array.isArray(field.options)) return field.options
  if (typeof field.options === 'string') {
    const parts = field.options.split(/[,，]/).map(opt => opt.trim()).filter(opt => opt)
    
    // Check if any part contains a colon (Label:Value format)
    const hasKeyValue = parts.some(part => part.includes(':') || part.includes('：'))
    
    if (hasKeyValue) {
      return parts.map(part => {
        const [label, value] = part.split(/[:：]/).map(s => s.trim())
        // Try to convert value to number if it looks like one
        const numValue = Number(value)
        return {
          label: label || value,
          value: !isNaN(numValue) && value !== '' ? numValue : value
        }
      })
    }
    
    return parts
  }
  return []
}

// 单条报价相关方法
const addQuoteItem = () => {
  if (!formData.value.quote_single) {
    formData.value.quote_single = [0]
  } else {
    formData.value.quote_single.push(0)
  }
  emit('update:modelValue', { ...formData.value })
}

const removeQuoteItem = (index) => {
  if (formData.value.quote_single && formData.value.quote_single.length > 1) {
    formData.value.quote_single.splice(index, 1)
    emit('update:modelValue', { ...formData.value })
  }
}

// 监听模型变化
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue }
}, { deep: true })
</script>

<style scoped lang="scss">
.dynamic-form {
  .quote-item {
    margin-bottom: 8px;
  }
}
</style>
