import { queryAll, queryRun } from '../database.js';

export const FormService = {
  // 获取所有文件夹
  async getAllFolders() {
    return await queryAll('SELECT * FROM form_folders ORDER BY created_at DESC');
  },

  // 获取所有模板
  async getAllTemplates() {
    return await queryAll('SELECT * FROM form_templates ORDER BY created_at DESC');
  },

  // 获取模板的所有映射规则
  async getMappingsByTemplate(templateId) {
    return await queryAll('SELECT * FROM form_field_mappings WHERE template_id = ?', [templateId]);
  },

  // 添加文件夹
  async addFolder(folder) {
    const { folder_name, description } = folder;
    const result = await queryRun('INSERT INTO form_folders (folder_name, description) VALUES (?, ?)', [folder_name, description]);
    return result.lastID;
  },

  // 更新文件夹
  async updateFolder(id, folder) {
    const { folder_name, description } = folder;
    await queryRun('UPDATE form_folders SET folder_name = ?, description = ? WHERE id = ?', [folder_name, description, id]);
  },

  // 删除文件夹
  async deleteFolder(id) {
    // 获取该文件夹下的所有模板 ID
    const templates = await queryAll('SELECT id FROM form_templates WHERE folder_id = ?', [id]);
    const templateIds = templates.map(t => t.id);

    if (templateIds.length > 0) {
      // 删除映射规则
      const placeholders = templateIds.map(() => '?').join(',');
      await queryRun(`DELETE FROM form_field_mappings WHERE template_id IN (${placeholders})`, templateIds);
      // 删除模板
      await queryRun(`DELETE FROM form_templates WHERE folder_id = ?`, [id]);
    }
    // 删除文件夹
    await queryRun('DELETE FROM form_folders WHERE id = ?', [id]);
  },

  // 添加模板
  async addTemplate(template) {
    const { folder_id, template_name, form_url, form_type, is_default } = template;
    const result = await queryRun(`
      INSERT INTO form_templates (folder_id, template_name, form_url, form_type, is_default)
      VALUES (?, ?, ?, ?, ?)
    `, [folder_id, template_name, form_url, form_type, is_default ? 1 : 0]);
    return result.lastID;
  },

  // 更新模板
  async updateTemplate(id, template) {
    const fields = Object.keys(template).filter(k => k !== 'id' && k !== 'created_at');
    const values = fields.map(k => {
      if (k === 'is_default') return template.is_default ? 1 : 0;
      return template[k];
    });
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await queryRun(`UPDATE form_templates SET ${setClause} WHERE id = ?`, [...values, id]);
  },

  // 删除模板
  async deleteTemplate(id) {
    await queryRun('DELETE FROM form_field_mappings WHERE template_id = ?', [id]);
    await queryRun('DELETE FROM form_templates WHERE id = ?', [id]);
  },

  // 添加映射规则
  async addMapping(mapping) {
    const { template_id, form_field_name, form_field_type, is_required, account_field_name, is_auto_mapping } = mapping;
    const result = await queryRun(`
      INSERT INTO form_field_mappings (template_id, form_field_name, form_field_type, is_required, account_field_name, is_auto_mapping)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [template_id, form_field_name, form_field_type, is_required ? 1 : 0, account_field_name, is_auto_mapping ? 1 : 0]);
    return result.lastID;
  },

  // 更新映射规则
  async updateMapping(id, mapping) {
    const fields = Object.keys(mapping).filter(k => k !== 'id');
    const values = fields.map(k => {
      if (k === 'is_required' || k === 'is_auto_mapping') {
        return mapping[k] ? 1 : 0;
      }
      return mapping[k];
    });

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await queryRun(`UPDATE form_field_mappings SET ${setClause} WHERE id = ?`, [...values, id]);
  },

  // 删除映射规则
  async deleteMapping(id) {
    await queryRun('DELETE FROM form_field_mappings WHERE id = ?', [id]);
  }
};
