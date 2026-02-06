<template>
  <div class="dynamic-form">
    <el-collapse v-model="activeNames">
    <el-collapse-item title="基础信息" name="basic">
      <!-- 固定字段 -->
      <el-form-item label="博主姓名" prop="blogger_name">
        <el-input v-model="formData.blogger_name" placeholder="请输入博主姓名" />
      </el-form-item>
      <el-form-item label="账号昵称" prop="account_nickname">
        <el-input v-model="formData.account_nickname" placeholder="请输入账号昵称" />
      </el-form-item>
      <el-form-item label="账号类型" prop="account_type">
        <el-select v-model="formData.account_type" placeholder="请选择账号类型">
          <el-option label="微博" value="weibo" />
          <el-option label="微信" value="wechat" />
          <el-option label="抖音" value="douyin" />
          <el-option label="快手" value="kuaishou" />
          <el-option label="B站" value="bilibili" />
          <el-option label="小红书" value="xiaohongshu" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="账号ID">
        <el-input v-model="formData.account_id" placeholder="请输入账号平台ID" />
      </el-form-item>
      <el-form-item label="主页链接" prop="homepage_url">
        <el-input v-model="formData.homepage_url" placeholder="请输入账号主页链接" />
      </el-form-item>
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('basic')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>

    <el-collapse-item title="运营数据" name="data">
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('data')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>

    <el-collapse-item title="合作信息" name="cooperation">
      <!-- 固定字段 -->
      <el-form-item label="单条报价">
        <div v-for="(item, index) in formData.quote_single" :key="index" class="quote-item">
          <el-input-number v-model="formData.quote_single[index]" :min="0" :step="0.01" placeholder="请输入单条报价" style="width: 200px; margin-right: 10px;" />
          <el-button type="danger" size="small" @click="removeQuoteItem(index)" v-if="formData.quote_single.length > 1">删除</el-button>
        </div>
        <el-button type="primary" size="small" @click="addQuoteItem" style="margin-top: 10px;">添加</el-button>
      </el-form-item>
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('cooperation')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-collapse-item>

    <el-collapse-item title="备注信息" name="remark">
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('remark')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)">
            <template v-if="field.type === 'select' || field.type === 'multiple_select'">
              <el-option
                v-for="opt in getFieldOptions(field)"
                :key="opt"
                :label="opt"
                :value="opt"
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
    placeholder: field.placeholder || `请输入${field.label}`,
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
      placeholder: field.placeholder || `请选择${field.label}`
    },
    multiple_select: {
      ...baseProps,
      placeholder: field.placeholder || `请选择${field.label}`,
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
    return field.options.split(',').map(opt => opt.trim()).filter(opt => opt)
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
