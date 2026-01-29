import { AccountService } from './AccountService.js';
import { FormService } from './FormService.js';
import { DataService } from './DataService.js';
import { SettingService } from './SettingService.js';

export const MigrationService = {
  // 检查是否已经迁移过
  async isMigrated() {
    const isMigrated = await SettingService.getSetting('isMigrated');
    return !!isMigrated;
  },

  // 执行迁移
  async migrate(data) {
    const { 
      accounts, account_groups, 
      form_folders, form_templates, form_field_mappings,
      logs, settings 
    } = data;

    // 1. 迁移账号分组
    if (account_groups) {
      for (const g of account_groups) {
        await AccountService.addGroup(g);
      }
    }

    // 2. 迁移账号
    if (accounts) {
      for (const a of accounts) {
        await AccountService.addAccount(a);
      }
    }

    // 3. 迁移表单文件夹
    if (form_folders) {
      for (const f of form_folders) {
        await FormService.addFolder(f);
      }
    }

    // 4. 迁移表单模板
    if (form_templates) {
      for (const t of form_templates) {
        await FormService.addTemplate(t);
      }
    }

    // 5. 迁移映射规则
    if (form_field_mappings) {
      for (const m of form_field_mappings) {
        await FormService.addMapping(m);
      }
    }

    // 6. 迁移日志
    if (logs) {
      for (const l of logs) {
        await DataService.addLog(l);
      }
    }

    // 7. 迁移设置
    if (settings) {
      for (const key of Object.keys(settings)) {
        await SettingService.setSetting(key, settings[key]);
      }
    }

    // 标记迁移完成
    await SettingService.setSetting('isMigrated', true);

    return { success: true };
  }
};
