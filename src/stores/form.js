import { defineStore } from 'pinia'

// 表单管理store
export const useFormStore = defineStore('form', {
  state: () => ({
    // 表单文件夹（日期分组）
    folders: [
      {
        id: 1,
        folder_name: '2026-01-22',
        description: '今天的表单'
      },
      {
        id: 2,
        folder_name: '2026-01-21',
        description: '昨天的表单'
      }
    ],
    // 表单模板
    templates: [
      {
        id: 1,
        folder_id: 1,
        template_name: '品牌合作表',
        form_url: 'https://docs.qq.com/form/page/DQ3R4d2pzR3F4c3B4',
        form_type: '腾讯文档',
        is_default: 0,
        last_fill_time: '2026-01-22 10:00:00'
      },
      {
        id: 2,
        folder_id: 1,
        template_name: '问卷调查表',
        form_url: 'https://www.wjx.cn/vm/Q123456.aspx',
        form_type: '问卷星',
        is_default: 0,
        last_fill_time: '2026-01-22 09:00:00'
      }
    ],
    // 表单字段匹配规则
    fieldMappings: [
      {
        id: 1,
        template_id: 1,
        form_field_name: '博主姓名',
        form_field_type: '输入框',
        is_required: 1,
        account_field_name: 'blogger_name',
        is_auto_mapping: 1
      },
      {
        id: 2,
        template_id: 1,
        form_field_name: '账号昵称',
        form_field_type: '输入框',
        is_required: 1,
        account_field_name: 'account_nickname',
        is_auto_mapping: 1
      },
      {
        id: 3,
        template_id: 1,
        form_field_name: '粉丝量',
        form_field_type: '输入框',
        is_required: 1,
        account_field_name: 'fans_count',
        is_auto_mapping: 1
      }
    ],
    // 当前选中的表单模板
    selectedTemplate: null
  }),
  getters: {
    // 根据文件夹获取表单模板
    getTemplatesByFolder: (state) => (folderId) => {
      return state.templates.filter(template => template.folder_id === folderId)
    },
    // 根据模板ID获取字段匹配规则
    getFieldMappingsByTemplate: (state) => (templateId) => {
      return state.fieldMappings.filter(mapping => mapping.template_id === templateId)
    }
  },
  actions: {
    // 添加文件夹
    addFolder(folder) {
      const newId = Math.max(...this.folders.map(f => f.id), 0) + 1
      this.folders.push({ id: newId, ...folder })
    },
    // 更新文件夹
    updateFolder(id, folder) {
      const index = this.folders.findIndex(f => f.id === id)
      if (index !== -1) {
        this.folders[index] = { ...this.folders[index], ...folder }
      }
    },
    // 删除文件夹
    deleteFolder(id) {
      this.folders = this.folders.filter(f => f.id !== id)
      // 同时删除该文件夹下的表单模板
      this.templates = this.templates.filter(t => t.folder_id !== id)
    },
    // 添加表单模板
    addTemplate(template) {
      const newId = Math.max(...this.templates.map(t => t.id), 0) + 1
      this.templates.push({ id: newId, ...template })
    },
    // 更新表单模板
    updateTemplate(id, template) {
      const index = this.templates.findIndex(t => t.id === id)
      if (index !== -1) {
        this.templates[index] = { ...this.templates[index], ...template }
      }
    },
    // 删除表单模板
    deleteTemplate(id) {
      this.templates = this.templates.filter(t => t.id !== id)
      // 同时删除该模板的字段匹配规则
      this.fieldMappings = this.fieldMappings.filter(m => m.template_id !== id)
    },
    // 添加字段匹配规则
    addFieldMapping(mapping) {
      const newId = Math.max(...this.fieldMappings.map(m => m.id), 0) + 1
      this.fieldMappings.push({ id: newId, ...mapping })
    },
    // 更新字段匹配规则
    updateFieldMapping(id, mapping) {
      const index = this.fieldMappings.findIndex(m => m.id === id)
      if (index !== -1) {
        this.fieldMappings[index] = { ...this.fieldMappings[index], ...mapping }
      }
    },
    // 删除字段匹配规则
    deleteFieldMapping(id) {
      this.fieldMappings = this.fieldMappings.filter(m => m.id !== id)
    },
    // 选择表单模板
    selectTemplate(id) {
      this.selectedTemplate = this.templates.find(t => t.id === id)
    }
  }
})
