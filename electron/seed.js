import { AccountService } from './services/AccountService.js';
import { FormService } from './services/FormService.js';
import { DataService } from './services/DataService.js';

export async function seedData() {
  console.log('Checking if data seeding is needed...');

  try {
    // Check if we already have accounts
    const accounts = await AccountService.getAllAccounts();
    if (accounts.length > 5) {
      console.log('Data already exists, skipping seed.');
      return;
    }

    console.log('Seeding data...');

    // 1. Seed Account Groups
    const groups = ['美食', '美妆', '科技', '生活', '旅行'];
    const groupIds = [];
    const existingGroups = await AccountService.getAllGroups();
    
    if (existingGroups.length === 0) {
      for (const g of groups) {
        const id = await AccountService.addGroup({ group_name: g, description: 'Mock Group' });
        groupIds.push({ id, name: g });
      }
    } else {
      existingGroups.forEach(g => groupIds.push({ id: g.id, name: g.group_name }));
    }

    // 2. Seed Accounts
    const platforms = ['小红书', '抖音', 'B站', '微博', '微信公众号'];
    for (let i = 1; i <= 15; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const group = groupIds[Math.floor(Math.random() * groupIds.length)];

      const extraData = {
        wechat: `wx_id_${i}`,
        email: `user${i}@example.com`,
        interaction_rate: (Math.random() * 5).toFixed(2),
        content_type: '图文',
        commission_rate: Math.floor(Math.random() * 20),
        account_features: '优质, 活跃',
        operation_strategy: '日更'
      };

      const account = {
        group_id: group ? group.id : null,
        blogger_name: `博主_${i}_${platform}`,
        account_nickname: `昵称_${i}`,
        account_type: platform,
        account_id: `id_${Date.now()}_${i}`,
        homepage_url: `https://example.com/user/${i}`,
        fans_count: Math.floor(Math.random() * 1000000),
        avg_read_count: Math.floor(Math.random() * 50000),
        like_count: Math.floor(Math.random() * 20000),
        comment_count: Math.floor(Math.random() * 5000),
        quote_single: Math.floor(Math.random() * 50000),
        quote_package: Math.floor(Math.random() * 100000),
        cooperation_type: '图文,视频',
        is_swap: Math.random() > 0.5 ? 1 : 0,
        contact: `138001380${i < 10 ? '0' + i : i}`,
        remark: `这是第 ${i} 个模拟账号`,
        status: 1,
        extra_json: JSON.stringify(extraData)
      };

      await AccountService.addAccount(account);
    }

    // 3. Seed Form Folders & Templates
    let folderId;
    const folders = await FormService.getAllFolders();
    if (folders.length === 0) {
      folderId = await FormService.addFolder({ folder_name: '默认文件夹', description: '自动生成' });
    } else {
      folderId = folders[0].id;
    }

    const templates = [];
    for (let i = 1; i <= 15; i++) {
      const template = {
        folder_id: folderId,
        template_name: `模拟表单_${i}`,
        form_url: `https://example.com/form/${i}`,
        form_type: '问卷星',
        is_default: 0
      };
      const id = await FormService.addTemplate(template);
      templates.push({ id, ...template });
    }

    // 4. Seed Logs
    // Need to re-fetch accounts to get IDs
    const allAccounts = await AccountService.getAllAccounts();
    
    if (allAccounts.length > 0 && templates.length > 0) {
      for (let i = 1; i <= 50; i++) {
        const isSuccess = Math.random() > 0.2;
        const acc = allAccounts[Math.floor(Math.random() * allAccounts.length)];
        const tmpl = templates[Math.floor(Math.random() * templates.length)];

        const log = {
          account_id: acc.id,
          template_id: tmpl.id,
          fill_result: isSuccess ? 'success' : 'fail',
          fail_reason: isSuccess ? '' : '选择器未找到',
          submit_count: 1
        };
        await DataService.addLog(log);
      }
    }

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}
