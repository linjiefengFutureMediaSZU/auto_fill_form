import { defineStore } from 'pinia'

// 表单管理store
export const useFormStore = defineStore('form', {
  state: () => ({
    folders: [],
    templates: [],
    fieldMappings: [],
    selectedTemplate: null,
    loading: false
  }),
  getters: {
    getTemplatesByFolder: (state) => (folderId) => {
      return state.templates.filter(template => template.folder_id === folderId)
    },
    getFieldMappingsByTemplate: (state) => (templateId) => {
      return state.fieldMappings.filter(mapping => mapping.template_id === templateId)
    }
  },
  actions: {
    // 从数据库加载初始数据
    async loadInitialData() {
      if (!window.electronAPI) return;
      this.loading = true;
      try {
        const [folders, templates] = await Promise.all([
          window.electronAPI.form.getFolders(),
          window.electronAPI.form.getTemplates()
        ]);
        this.folders = folders || [];
        this.templates = templates || [];
      } catch (error) {
        console.error('Failed to load folders/templates:', error);
      } finally {
        this.loading = false;
      }
    },

    // 文件夹操作
    async addFolder(folder) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.form.addFolder(folder);
        this.folders.push({ id: newId, ...folder });
      } catch (error) {
        console.error('Failed to add folder:', error);
        throw error;
      }
    },
    async updateFolder(id, folder) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.form.updateFolder(id, folder);
        const index = this.folders.findIndex(f => f.id === id);
        if (index !== -1) {
          this.folders[index] = { ...this.folders[index], ...folder };
        }
      } catch (error) {
        console.error('Failed to update folder:', error);
        throw error;
      }
    },
    async deleteFolder(id) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.form.deleteFolder(id);
        this.folders = this.folders.filter(f => f.id !== id);
        this.templates = this.templates.filter(t => t.folder_id !== id);
      } catch (error) {
        console.error('Failed to delete folder:', error);
        throw error;
      }
    },

    // 模板操作
    async addTemplate(template) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.form.addTemplate(template);
        this.templates.push({ id: newId, ...template });
      } catch (error) {
        console.error('Failed to add template:', error);
        throw error;
      }
    },
    async updateTemplate(id, template) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.form.updateTemplate(id, template);
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
          this.templates[index] = { ...this.templates[index], ...template };
        }
      } catch (error) {
        console.error('Failed to update template:', error);
        throw error;
      }
    },
    async deleteTemplate(id) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.form.deleteTemplate(id);
        this.templates = this.templates.filter(t => t.id !== id);
        this.fieldMappings = this.fieldMappings.filter(m => m.template_id !== id);
      } catch (error) {
        console.error('Failed to delete template:', error);
        throw error;
      }
    },

    // 映射规则操作
    async loadMappings(templateId) {
      if (!window.electronAPI) return;
      try {
        const mappings = await window.electronAPI.form.getMappings(templateId);
        // 更新 fieldMappings 中属于该模板的规则
        this.fieldMappings = this.fieldMappings.filter(m => m.template_id !== templateId);
        this.fieldMappings.push(...mappings);
        return mappings;
      } catch (error) {
        console.error('Failed to load mappings:', error);
      }
    },
    async addFieldMapping(mapping) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.mapping.add(mapping);
        this.fieldMappings.push({ id: newId, ...mapping });
      } catch (error) {
        console.error('Failed to add mapping:', error);
        throw error;
      }
    },
    async updateFieldMapping(id, mapping) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.mapping.update(id, mapping);
        const index = this.fieldMappings.findIndex(m => m.id === id);
        if (index !== -1) {
          this.fieldMappings[index] = { ...this.fieldMappings[index], ...mapping };
        }
      } catch (error) {
        console.error('Failed to update mapping:', error);
        throw error;
      }
    },
    async deleteFieldMapping(id) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.mapping.delete(id);
        this.fieldMappings = this.fieldMappings.filter(m => m.id !== id);
      } catch (error) {
        console.error('Failed to delete mapping:', error);
        throw error;
      }
    },

    // 选择模板
    async selectTemplate(id) {
      this.selectedTemplate = this.templates.find(t => t.id === id);
      if (this.selectedTemplate) {
        await this.loadMappings(id);
      }
    }
  }
})
