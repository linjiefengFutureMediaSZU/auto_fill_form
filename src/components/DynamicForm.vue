<template>
  <div class="dynamic-form">
    <!-- 基础信息 -->
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
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)" />
        </el-form-item>
      </template>
    </el-collapse-item>

    <!-- 运营数据 -->
    <el-collapse-item title="运营数据" name="data">
      <!-- 固定字段 -->
      <el-form-item label="粉丝量" prop="fans_count">
        <el-input-number v-model="formData.fans_count" :min="0" placeholder="请输入粉丝量" />
      </el-form-item>
      <el-form-item label="平均阅读量">
        <el-input-number v-model="formData.avg_read_count" :min="0" placeholder="请输入平均阅读量" />
      </el-form-item>
      <el-form-item label="平均点赞量">
        <el-input-number v-model="formData.like_count" :min="0" placeholder="请输入平均点赞量" />
      </el-form-item>
      <el-form-item label="平均评论量">
        <el-input-number v-model="formData.comment_count" :min="0" placeholder="请输入平均评论量" />
      </el-form-item>
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('data')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)" />
        </el-form-item>
      </template>
    </el-collapse-item>

    <!-- 合作信息 -->
    <el-collapse-item title="合作信息" name="cooperation">
      <!-- 固定字段 -->
      <el-form-item label="单条报价">
        <div v-for="(item, index) in formData.quote_single" :key="index" class="quote-item">
          <el-input-number v-model="formData.quote_single[index]" :min="0" :step="0.01" placeholder="请输入单条报价" style="width: 200px; margin-right: 10px;" />
          <el-button type="danger" size="small" @click="removeQuoteItem(index)" v-if="formData.quote_single.length > 1">删除</el-button>
        </div>
        <el-button type="primary" size="small" @click="addQuoteItem" style="margin-top: 10px;">添加</el-button>
      </el-form-item>
      <el-form-item label="套餐报价">
        <el-input-number v-model="formData.quote_package" :min="0" :step="0.01" placeholder="请输入套餐报价" />
      </el-form-item>
      <el-form-item label="合作形式">
        <el-select v-model="formData.cooperation_type" multiple placeholder="请选择合作形式">
          <el-option label="图文" value="图文" />
          <el-option label="视频" value="视频" />
          <el-option label="直播" value="直播" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否接受置换">
        <el-switch v-model="formData.is_swap" />
      </el-form-item>
      <el-form-item label="联系方式">
        <el-input v-model="formData.contact" placeholder="请输入联系方式" />
      </el-form-item>
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('cooperation')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)" />
        </el-form-item>
      </template>
    </el-collapse-item>

    <!-- 备注信息 -->
    <el-collapse-item title="备注信息" name="remark">
      <!-- 固定字段 -->
      <el-form-item label="备注">
        <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注信息" />
      </el-form-item>
      <!-- 动态字段 -->
      <template v-for="field in getFieldsByGroup('remark')" :key="field.id">
        <el-form-item :label="field.label" :prop="field.name">
          <component :is="getFieldComponent(field.type)" v-bind="getFieldProps(field)" />
        </el-form-item>
      </template>
    </el-collapse-item>
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
    switch: 'el-switch'
  }
  return componentMap[type] || 'el-input'
}

const getFieldProps = (field) => {
  // 确保字段值存在
  if (formData.value[field.name] === undefined) {
    formData.value[field.name] = field.defaultValue || ''
  }

  const propsMap = {
    text: {
      modelValue: formData.value[field.name],
      placeholder: field.placeholder || `请输入${field.label}`,
      onChange: (value) => {
        formData.value[field.name] = value
        emit('update:modelValue', { ...formData.value })
      }
    },
    number: {
      modelValue: formData.value[field.name] || 0,
      placeholder: field.placeholder || `请输入${field.label}`,
      min: 0,
      onChange: (value) => {
        formData.value[field.name] = value
        emit('update:modelValue', { ...formData.value })
      }
    },
    select: {
      modelValue: formData.value[field.name] || '',
      placeholder: field.placeholder || `请选择${field.label}`,
      onChange: (value) => {
        formData.value[field.name] = value
        emit('update:modelValue', { ...formData.value })
      }
    },
    switch: {
      modelValue: formData.value[field.name] || false,
      onChange: (value) => {
        formData.value[field.name] = value
        emit('update:modelValue', { ...formData.value })
      }
    }
  }
  return propsMap[field.type] || propsMap.text
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