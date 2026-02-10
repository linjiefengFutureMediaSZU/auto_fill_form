<template>
  <div class="help-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ $t('help.title') }}</h2>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="help-tabs">
      <!-- 使用手册标签页 -->
      <el-tab-pane :label="$t('help.manual')" name="manual">
        <div class="manual-content">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">{{ $t('help.guide') }}</h3>
              <el-input
                v-model="manualSearchKeyword"
                :placeholder="$t('help.searchManual')"
                clearable
                class="manual-search"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <!-- 手册内容 -->
            <div class="manual-list">
              <!-- 账号管理 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><User /></el-icon>
                  {{ $t('help.manualContent.accountManagement.title') }}
                </h4>
                <div class="manual-content">
                  <h5>{{ $t('help.manualContent.accountManagement.addAccount.title') }}</h5>
                  <p>{{ $t('help.manualContent.accountManagement.addAccount.content') }}</p>
                  <h5>{{ $t('help.manualContent.accountManagement.editAccount.title') }}</h5>
                  <p>{{ $t('help.manualContent.accountManagement.editAccount.content') }}</p>
                  <h5>{{ $t('help.manualContent.accountManagement.deleteAccount.title') }}</h5>
                  <p>{{ $t('help.manualContent.accountManagement.deleteAccount.content') }}</p>
                  <h5>{{ $t('help.manualContent.accountManagement.accountGroup.title') }}</h5>
                  <p>{{ $t('help.manualContent.accountManagement.accountGroup.content') }}</p>
                  <h5>{{ $t('help.manualContent.accountManagement.batchOperation.title') }}</h5>
                  <p>{{ $t('help.manualContent.accountManagement.batchOperation.content') }}</p>
                </div>
              </div>

              <!-- 表单填写 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><EditPen /></el-icon>
                  {{ $t('help.manualContent.formFilling.title') }}
                </h4>
                <div class="manual-content">
                  <h5>{{ $t('help.manualContent.formFilling.selectAccount.title') }}</h5>
                  <p>{{ $t('help.manualContent.formFilling.selectAccount.content') }}</p>
                  <h5>{{ $t('help.manualContent.formFilling.selectForm.title') }}</h5>
                  <p>{{ $t('help.manualContent.formFilling.selectForm.content') }}</p>
                  <h5>{{ $t('help.manualContent.formFilling.fieldMatch.title') }}</h5>
                  <p>{{ $t('help.manualContent.formFilling.fieldMatch.content') }}</p>
                  <h5>{{ $t('help.manualContent.formFilling.startFill.title') }}</h5>
                  <p>{{ $t('help.manualContent.formFilling.startFill.content') }}</p>
                  <h5>{{ $t('help.manualContent.formFilling.fillSettings.title') }}</h5>
                  <p>{{ $t('help.manualContent.formFilling.fillSettings.content') }}</p>
                </div>
              </div>

              <!-- 表单列表 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><List /></el-icon>
                  {{ $t('help.manualContent.formList.title') }}
                </h4>
                <div class="manual-content">
                  <h5>{{ $t('help.manualContent.formList.addForm.title') }}</h5>
                  <p>{{ $t('help.manualContent.formList.addForm.content') }}</p>
                  <h5>{{ $t('help.manualContent.formList.folderManage.title') }}</h5>
                  <p>{{ $t('help.manualContent.formList.folderManage.content') }}</p>
                  <h5>{{ $t('help.manualContent.formList.batchImport.title') }}</h5>
                  <p>{{ $t('help.manualContent.formList.batchImport.content') }}</p>
                  <h5>{{ $t('help.manualContent.formList.batchExport.title') }}</h5>
                  <p>{{ $t('help.manualContent.formList.batchExport.content') }}</p>
                </div>
              </div>

              <!-- 数据管理 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><DataAnalysis /></el-icon>
                  {{ $t('help.manualContent.dataManage.title') }}
                </h4>
                <div class="manual-content">
                  <h5>{{ $t('help.manualContent.dataManage.manualBackup.title') }}</h5>
                  <p>{{ $t('help.manualContent.dataManage.manualBackup.content') }}</p>
                  <h5>{{ $t('help.manualContent.dataManage.scheduleBackup.title') }}</h5>
                  <p>{{ $t('help.manualContent.dataManage.scheduleBackup.content') }}</p>
                  <h5>{{ $t('help.manualContent.dataManage.restoreBackup.title') }}</h5>
                  <p>{{ $t('help.manualContent.dataManage.restoreBackup.content') }}</p>
                  <h5>{{ $t('help.manualContent.dataManage.logManage.title') }}</h5>
                  <p>{{ $t('help.manualContent.dataManage.logManage.content') }}</p>
                </div>
              </div>

              <!-- 基础设置 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><Setting /></el-icon>
                  {{ $t('help.manualContent.basicSettings.title') }}
                </h4>
                <div class="manual-content">
                  <h5>{{ $t('help.manualContent.basicSettings.generalSettings.title') }}</h5>
                  <p>{{ $t('help.manualContent.basicSettings.generalSettings.content') }}</p>
                  <h5>{{ $t('help.manualContent.basicSettings.deploySettings.title') }}</h5>
                  <p>{{ $t('help.manualContent.basicSettings.deploySettings.content') }}</p>
                  <h5>{{ $t('help.manualContent.basicSettings.fillSettings.title') }}</h5>
                  <p>{{ $t('help.manualContent.basicSettings.fillSettings.content') }}</p>
                  <h5>{{ $t('help.manualContent.basicSettings.accountSecurity.title') }}</h5>
                  <p>{{ $t('help.manualContent.basicSettings.accountSecurity.content') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 常见问题标签页 -->
      <el-tab-pane :label="$t('help.faq')" name="faq">
        <div class="faq-content">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">FAQ</h3>
              <el-select v-model="faqCategory" :placeholder="$t('help.filterByCategory')">
                <el-option :label="$t('help.allQuestions')" value="" />
                <el-option :label="$t('help.accountManagement')" value="account" />
                <el-option :label="$t('help.formFilling')" value="form" />
                <el-option :label="$t('help.formList')" value="formList" />
                <el-option :label="$t('help.dataBackup')" value="data" />
              </el-select>
            </div>

            <!-- FAQ列表 -->
            <div class="faq-list">
              <el-collapse v-model="activeFaqNames">
                <el-collapse-item
                  v-for="faq in filteredFaqs"
                  :key="faq.id"
                  :title="faq.question"
                  :name="faq.id"
                  class="faq-item"
                >
                  <div class="faq-answer">{{ faq.answer }}</div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 反馈提交标签页 -->
      <el-tab-pane :label="$t('help.feedback')" name="feedback">
        <div class="feedback-content">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">{{ $t('help.feedback') }}</h3>
              <p class="feedback-tip">{{ $t('help.feedbackTip') }}</p>
            </div>

            <!-- 反馈表单 -->
            <el-form
              :model="feedbackForm"
              :rules="feedbackRules"
              ref="feedbackFormRef"
              label-width="100px"
              class="feedback-form"
            >
              <el-form-item :label="$t('help.feedbackType')" prop="type">
                <el-select v-model="feedbackForm.type" :placeholder="$t('help.validation.typeRequired')">
                  <el-option :label="$t('help.feedbackTypeOptions.suggestion')" value="suggestion" />
                  <el-option :label="$t('help.feedbackTypeOptions.bug')" value="bug" />
                  <el-option :label="$t('help.feedbackTypeOptions.question')" value="question" />
                  <el-option :label="$t('help.feedbackTypeOptions.other')" value="other" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('help.contact')" prop="contact">
                <el-input v-model="feedbackForm.contact" :placeholder="$t('help.validation.contactRequired')" />
                <div class="form-tip">{{ $t('help.contact') }}</div>
              </el-form-item>
              <el-form-item :label="$t('help.description')" prop="description">
                <el-input
                  v-model="feedbackForm.description"
                  type="textarea"
                  rows="5"
                  :placeholder="$t('help.validation.descRequired')"
                />
              </el-form-item>
              <el-form-item :label="$t('help.screenshot')">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="true"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                >
                  <el-button size="small" type="primary">
                    <el-icon><Upload /></el-icon>
                    {{ $t('help.selectFile') }}
                  </el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      {{ $t('help.uploadTip') }}
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" @click="submitFeedback">
                  <el-icon><Check /></el-icon>
                  {{ $t('help.submitFeedback') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Search, User, EditPen, List, DataAnalysis, Setting, Upload, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 响应式数据
const activeTab = ref('manual')
const manualSearchKeyword = ref('')
const faqCategory = ref('')
const activeFaqNames = ref([])

// 反馈表单
const feedbackForm = reactive({
  type: '',
  contact: '',
  description: '',
  files: []
})

// 反馈表单验证规则
const feedbackRules = computed(() => ({
  type: [{ required: true, message: t('help.validation.typeRequired'), trigger: 'change' }],
  contact: [{ required: true, message: t('help.validation.contactRequired'), trigger: 'blur' }],
  description: [
    { required: true, message: t('help.validation.descRequired'), trigger: 'blur' },
    { min: 10, message: t('help.validation.descMin'), trigger: 'blur' }
  ]
}))

// 常见问题数据
const faqs = computed(() => [
  {
    id: '1',
    category: 'account',
    question: t('help.faqData.q1.question'),
    answer: t('help.faqData.q1.answer')
  },
  {
    id: '2',
    category: 'account',
    question: t('help.faqData.q2.question'),
    answer: t('help.faqData.q2.answer')
  },
  {
    id: '3',
    category: 'form',
    question: t('help.faqData.q3.question'),
    answer: t('help.faqData.q3.answer')
  },
  {
    id: '4',
    category: 'form',
    question: t('help.faqData.q4.question'),
    answer: t('help.faqData.q4.answer')
  },
  {
    id: '5',
    category: 'formList',
    question: t('help.faqData.q5.question'),
    answer: t('help.faqData.q5.answer')
  },
  {
    id: '6',
    category: 'data',
    question: t('help.faqData.q6.question'),
    answer: t('help.faqData.q6.answer')
  },
  {
    id: '7',
    category: 'data',
    question: t('help.faqData.q7.question'),
    answer: t('help.faqData.q7.answer')
  }
])

// 表单引用
const feedbackFormRef = ref(null)

// 计算属性
// 筛选后的FAQ
const filteredFaqs = computed(() => {
  return faqs.value.filter(faq => {
    if (faqCategory.value && faq.category !== faqCategory.value) {
      return false
    }
    return true
  })
})

// 方法
// 处理文件上传
const handleFileChange = (file) => {
  // 这里可以添加文件上传的逻辑
  feedbackForm.files.push(file)
}

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return
  
  try {
    await feedbackFormRef.value.validate()
    
    // 模拟提交反馈
    ElMessage.success(t('help.feedbackMessages.success'))
    
    // 重置表单
    Object.keys(feedbackForm).forEach(key => {
      if (Array.isArray(feedbackForm[key])) {
        feedbackForm[key] = []
      } else {
        feedbackForm[key] = ''
      }
    })
  } catch (error) {
    console.error('Form validation failed:', error)
    ElMessage.error(t('help.feedbackMessages.validateError'))
  }
}
</script>

<style scoped lang="scss">
.help-page {
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

  .help-tabs {
    .el-tabs__content {
      padding-top: var(--spacing-lg);
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .manual-search {
    width: 200px;
  }

  .manual-list {
    max-height: 600px;
    overflow-y: auto;
  }

  .manual-item {
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color-light);

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .manual-title {
      font-size: var(--font-size-md);
      font-weight: 500;
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .manual-content {
      font-size: var(--font-size-sm);
      line-height: 1.6;
      
      h5 {
        font-weight: 500;
        margin: var(--spacing-md) 0 var(--spacing-xs);
        color: var(--text-color-primary);
      }

      p {
        margin: 0;
        color: var(--text-color-secondary);
      }
    }
  }

  .faq-content, .feedback-content {
    .glass-card {
      padding: var(--spacing-lg);
    }
  }

  .faq-item {
    ::v-deep(.el-collapse-item__header) {
      font-size: var(--font-size-base);
      font-weight: 500;
    }

    .faq-answer {
      color: var(--text-color-secondary);
      line-height: 1.6;
    }
  }

  .feedback-tip {
    color: var(--text-color-secondary);
    font-size: var(--font-size-sm);
  }

  .feedback-form {
    max-width: 600px;
    margin-top: var(--spacing-lg);
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--text-color-secondary);
    line-height: 1.2;
    margin-top: 4px;
  }
}
</style>