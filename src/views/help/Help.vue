<template>
  <div class="help-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">帮助与反馈</h2>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="help-tabs">
      <!-- 使用手册标签页 -->
      <el-tab-pane label="使用手册" name="manual">
        <div class="manual-content">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">使用指南</h3>
              <el-input
                v-model="manualSearchKeyword"
                placeholder="搜索教程内容"
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
                  账号管理
                </h4>
                <div class="manual-content">
                  <h5>1. 新增账号</h5>
                  <p>点击"新增账号"按钮，填写账号基础信息、运营数据、合作信息和备注信息，点击保存即可。</p>
                  <h5>2. 编辑账号</h5>
                  <p>在账号列表中，点击对应账号的"编辑"按钮，修改信息后点击保存。</p>
                  <h5>3. 删除账号</h5>
                  <p>在账号列表中，点击对应账号的"删除"按钮，确认后即可删除。</p>
                  <h5>4. 账号分组</h5>
                  <p>在右侧分组管理中，点击"新增分组"按钮创建分组，然后在编辑账号时选择对应分组。</p>
                  <h5>5. 批量操作</h5>
                  <p>勾选多个账号后，点击"批量操作"下拉菜单，可进行批量导入、导出、修改和删除操作。</p>
                </div>
              </div>

              <!-- 表单填写 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><EditPen /></el-icon>
                  表单填写
                </h4>
                <div class="manual-content">
                  <h5>1. 选择账号</h5>
                  <p>在左侧账号选择区，勾选需要填写的账号。</p>
                  <h5>2. 选择表单</h5>
                  <p>在中间表单链接区，选择目标表单模板。</p>
                  <h5>3. 字段匹配</h5>
                  <p>在右侧表单预览区，点击"自动匹配"按钮，系统会自动匹配表单字段与账号信息字段。</p>
                  <h5>4. 开始填写</h5>
                  <p>点击"一键填写"按钮填写单个账号，或点击"批量填写"按钮填写多个账号。</p>
                  <h5>5. 填写设置</h5>
                  <p>可设置提交间隔，避免触发表单反爬机制。</p>
                </div>
              </div>

              <!-- 表单列表 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><List /></el-icon>
                  表单列表
                </h4>
                <div class="manual-content">
                  <h5>1. 新增表单</h5>
                  <p>点击"新增表单"按钮，填写表单名称、链接、类型和归属文件夹，点击保存即可。</p>
                  <h5>2. 文件夹管理</h5>
                  <p>在左侧文件夹管理中，点击"新建文件夹"按钮创建文件夹，默认按日期命名。</p>
                  <h5>3. 批量导入</h5>
                  <p>点击"批量操作"下拉菜单，选择"批量导入"，粘贴多个表单链接，选择归属文件夹和表单类型，点击导入即可。</p>
                  <h5>4. 批量导出</h5>
                  <p>选择需要导出的表单，点击"批量操作"下拉菜单，选择"批量导出"即可。</p>
                </div>
              </div>

              <!-- 数据管理 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><DataAnalysis /></el-icon>
                  数据管理
                </h4>
                <div class="manual-content">
                  <h5>1. 手动备份</h5>
                  <p>在备份管理标签页，点击"手动备份"按钮，系统会自动备份当前所有数据。</p>
                  <h5>2. 定时备份</h5>
                  <p>点击"备份设置"按钮，开启定时备份，设置备份时间和频率。</p>
                  <h5>3. 恢复备份</h5>
                  <p>在备份列表中，找到需要恢复的备份，点击"恢复"按钮，确认后即可恢复数据。</p>
                  <h5>4. 日志管理</h5>
                  <p>在日志管理标签页，可查看填写日志，支持按结果和时间范围筛选。</p>
                </div>
              </div>

              <!-- 基础设置 -->
              <div class="manual-item">
                <h4 class="manual-title">
                  <el-icon><Setting /></el-icon>
                  基础设置
                </h4>
                <div class="manual-content">
                  <h5>1. 通用设置</h5>
                  <p>可设置界面主题和字体大小。</p>
                  <h5>2. 部署设置</h5>
                  <p>可设置本地数据存储路径、备份路径和运行端口。</p>
                  <h5>3. 填写设置</h5>
                  <p>可设置批量填写时的提交间隔，避免触发表单反爬。</p>
                  <h5>4. 账号安全</h5>
                  <p>可设置工具登录密码和预留邮箱，用于找回密码。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 常见问题标签页 -->
      <el-tab-pane label="常见问题" name="faq">
        <div class="faq-content">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">FAQ</h3>
              <el-select v-model="faqCategory" placeholder="按分类筛选">
                <el-option label="全部问题" value="" />
                <el-option label="账号管理" value="account" />
                <el-option label="表单填写" value="form" />
                <el-option label="表单列表" value="formList" />
                <el-option label="数据备份" value="data" />
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
      <el-tab-pane label="反馈提交" name="feedback">
        <div class="feedback-content">
          <div class="glass-card">
            <div class="section-header">
              <h3 class="subtitle">问题反馈</h3>
              <p class="feedback-tip">请详细描述您遇到的问题，我们会尽快处理</p>
            </div>

            <!-- 反馈表单 -->
            <el-form
              :model="feedbackForm"
              :rules="feedbackRules"
              ref="feedbackFormRef"
              label-width="100px"
              class="feedback-form"
            >
              <el-form-item label="反馈类型" prop="type">
                <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
                  <el-option label="功能建议" value="suggestion" />
                  <el-option label="Bug反馈" value="bug" />
                  <el-option label="使用问题" value="question" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
              <el-form-item label="联系方式" prop="contact">
                <el-input v-model="feedbackForm.contact" placeholder="请输入邮箱或手机号" />
                <div class="form-tip">方便我们联系您解决问题</div>
              </el-form-item>
              <el-form-item label="问题描述" prop="description">
                <el-input
                  v-model="feedbackForm.description"
                  type="textarea"
                  rows="5"
                  placeholder="请详细描述您遇到的问题"
                />
              </el-form-item>
              <el-form-item label="截图上传">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="true"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                >
                  <el-button size="small" type="primary">
                    <el-icon><Upload /></el-icon>
                    选择文件
                  </el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持上传JPG、PNG格式图片，单张不超过2MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" @click="submitFeedback">
                  <el-icon><Check /></el-icon>
                  提交反馈
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
const feedbackRules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  description: [{ required: true, message: '请描述问题', trigger: 'blur' }, { min: 10, message: '描述至少10个字符', trigger: 'blur' }]
}

// 常见问题数据
const faqs = [
  {
    id: '1',
    category: 'account',
    question: '如何批量导入账号信息？',
    answer: '点击"批量操作"下拉菜单，选择"批量导入"，然后按照模板格式填写Excel或CSV文件，上传后系统会自动导入账号信息。'
  },
  {
    id: '2',
    category: 'account',
    question: '账号状态为暂停，如何恢复？',
    answer: '在账号列表中，找到状态为暂停的账号，点击"编辑"按钮，将账号状态修改为"正常"，然后保存即可。'
  },
  {
    id: '3',
    category: 'form',
    question: '表单填写失败怎么办？',
    answer: '首先检查网络连接是否正常，然后检查表单链接是否有效。如果问题仍然存在，可以查看填写日志中的失败原因，根据提示进行修复。'
  },
  {
    id: '4',
    category: 'form',
    question: '如何自定义字段匹配规则？',
    answer: '在表单填写页面，选择表单后，点击"编辑表单匹配规则"按钮，在弹出的对话框中，为每个表单字段选择对应的账号字段，然后保存即可。'
  },
  {
    id: '5',
    category: 'formList',
    question: '如何批量导入表单链接？',
    answer: '点击"批量导入"按钮，在弹出的对话框中，粘贴多个表单链接（每行一个），选择归属文件夹和表单类型，点击导入即可。'
  },
  {
    id: '6',
    category: 'data',
    question: '备份文件保存在哪里？',
    answer: '备份文件默认保存在"D:/backup/"目录下，您可以在基础设置中的部署设置里修改备份路径。'
  },
  {
    id: '7',
    category: 'data',
    question: '如何恢复备份数据？',
    answer: '在数据管理页面的备份管理标签页，找到需要恢复的备份，点击"恢复"按钮，在弹出的对话框中选择恢复选项，确认后即可恢复数据。'
  }
]

// 表单引用
const feedbackFormRef = ref(null)

// 计算属性
// 筛选后的FAQ
const filteredFaqs = computed(() => {
  return faqs.filter(faq => {
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
    ElMessage.success('反馈提交成功，我们会尽快处理')
    
    // 重置表单
    Object.keys(feedbackForm).forEach(key => {
      if (Array.isArray(feedbackForm[key])) {
        feedbackForm[key] = []
      } else {
        feedbackForm[key] = ''
      }
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped lang="scss">
.help-page {
  .page-header {
    margin-bottom: var(--spacing-lg);
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
        margin-top: var(--spacing-md);
        margin-bottom: var(--spacing-xs);
      }

      p {
        margin-bottom: var(--spacing-xs);
        color: var(--text-color-regular);
      }
    }
  }

  .faq-list {
    max-height: 600px;
    overflow-y: auto;
  }

  .faq-item {
    margin-bottom: var(--spacing-xs);

    .el-collapse-item__content {
      padding: var(--spacing-sm);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--text-color-regular);
      background-color: var(--bg-color-light);
      border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
    }
  }

  .feedback-tip {
    font-size: var(--font-size-sm);
    color: var(--text-color-secondary);
  }

  .feedback-form {
    margin-top: var(--spacing-md);
  }

  .form-tip {
    font-size: var(--font-size-xs);
    color: var(--text-color-secondary);
    margin-top: var(--spacing-xs);
  }

  .avatar-uploader {
    margin-top: var(--spacing-sm);
  }
}
</style>
