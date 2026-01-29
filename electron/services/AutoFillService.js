import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { AccountService } from './AccountService.js';
import { FormService } from './FormService.js';
import { DataService } from './DataService.js';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

// 使用 stealth 插件
chromium.use(stealth());

export const AutoFillService = {
  // 运行中的浏览器实例
  activeBrowsers: new Map(),

  /**
   * 开始填表任务
   * @param {Object} options 
   * @param {number[]} options.accountIds 账号 ID 列表
   * @param {number} options.templateId 模板 ID
   * @param {Object} options.settings 填表设置
   * @param {Function} onProgress 进度回调
   */
  async startTask(options, onProgress) {
    const { accountIds, templateId, settings } = options;
    const { showBrowser = true, submitInterval = 2 } = settings;

    const template = (await FormService.getAllTemplates()).find(t => t.id === templateId);
    if (!template) throw new Error('模板不存在');

    const mappings = await FormService.getMappingsByTemplate(templateId);
    if (!mappings || mappings.length === 0) throw new Error('未配置字段映射规则');

    const accounts = (await AccountService.getAllAccounts()).filter(a => accountIds.includes(a.id));
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const taskId = `task_${Date.now()}_${account.id}`;
      
      onProgress({
        type: 'start',
        accountName: account.account_nickname,
        index: i,
        total: accounts.length
      });

      try {
        await this.fillSingle(account, template, mappings, { showBrowser }, (log) => {
          onProgress({ type: 'log', log, accountId: account.id });
        });

        successCount++;
        // 记录成功日志
        await DataService.addLog({
          account_id: account.id,
          template_id: templateId,
          fill_result: '成功',
          submit_count: 1
        });

      } catch (error) {
        failCount++;
        console.error(`Fill failed for account ${account.account_nickname}:`, error);
        
        // 失败截图
        let screenshotPath = '';
        try {
          const screenshotsDir = path.join(app.getPath('userData'), 'screenshots');
          if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
          screenshotPath = path.join(screenshotsDir, `error_${Date.now()}_${account.id}.png`);
          // 注意：截图逻辑需要在 fillSingle 内部或通过 page 实例执行
        } catch (e) {
          console.error('Failed to create screenshot dir:', e);
        }

        onProgress({ 
          type: 'error', 
          message: error.message, 
          accountId: account.id,
          screenshotPath
        });

        // 记录失败日志
        await DataService.addLog({
          account_id: account.id,
          template_id: templateId,
          fill_result: '失败',
          fail_reason: error.message,
          submit_count: 1
        });
      }

      onProgress({
        type: 'progress',
        percentage: Math.round(((i + 1) / accounts.length) * 100),
        successCount,
        failCount
      });

      // 批量填写间隔
      if (i < accounts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, submitInterval * 1000));
      }
    }

    return { successCount, failCount };
  },

  /**
   * 填写单个账号
   */
  async fillSingle(account, template, mappings, options, logCallback) {
    const { showBrowser } = options;
    const browser = await chromium.launch({ headless: !showBrowser });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      logCallback(`正在跳转至表单: ${template.form_url}`);
      await page.goto(template.form_url, { waitUntil: 'networkidle', timeout: 60000 });

      for (const mapping of mappings) {
        const value = account[mapping.account_field_name];
        if (value === undefined || value === null) continue;

        logCallback(`正在填写字段: ${mapping.form_field_name} -> ${value}`);
        
        try {
          await this.smartFill(page, mapping, value);
        } catch (e) {
          logCallback(`填写字段 ${mapping.form_field_name} 失败: ${e.message}`);
          if (mapping.is_required) throw e;
        }
      }

      logCallback(`账号 ${account.account_nickname} 填写完成`);
      // 这里可以添加自动提交逻辑
      // if (options.autoSubmit) { ... }

      await new Promise(resolve => setTimeout(resolve, 2000)); // 留点时间看一眼结果
    } catch (error) {
      // 捕获截图
      try {
        const screenshotsDir = path.join(app.getPath('userData'), 'screenshots');
        if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
        const screenshotPath = path.join(screenshotsDir, `error_${Date.now()}_${account.id}.png`);
        await page.screenshot({ path: screenshotPath });
        error.screenshotPath = screenshotPath;
      } catch (e) {
        console.error('Failed to capture screenshot:', e);
      }
      throw error;
    } finally {
      await browser.close();
    }
  },

  /**
   * 智能填充逻辑
   */
  async smartFill(page, mapping, value) {
    const { form_field_name, form_field_type } = mapping;
    
    // 尝试多种选择器定位
    const selectors = [
      `text="${form_field_name}"`,
      `label:has-text("${form_field_name}")`,
      `[placeholder*="${form_field_name}"]`,
      `[name*="${form_field_name}"]`,
      `[id*="${form_field_name}"]`
    ];

    let elementFound = false;

    // 基础输入框
    if (form_field_type === '输入框' || !form_field_type) {
      for (const selector of selectors) {
        try {
          // 找到标签后，寻找它旁边的输入框
          const target = page.locator(`${selector} >> xpath=..//input | ${selector} >> xpath=..//textarea | ${selector}`);
          if (await target.count() > 0) {
            await target.first().fill(String(value));
            elementFound = true;
            break;
          }
        } catch (e) {}
      }
    } 
    // 下拉框
    else if (form_field_type === '下拉框') {
      for (const selector of selectors) {
        try {
          const target = page.locator(`${selector} >> xpath=..//select | ${selector}`);
          if (await target.count() > 0) {
            await target.first().selectOption({ label: String(value) });
            elementFound = true;
            break;
          }
          // 现代 UI 下拉框 (点击后选)
          const divTarget = page.locator(`${selector} >> xpath=..//div[contains(@class, "select")] | ${selector}`);
          if (await divTarget.count() > 0) {
            await divTarget.first().click();
            await page.click(`text="${value}"`);
            elementFound = true;
            break;
          }
        } catch (e) {}
      }
    }
    // 单选框
    else if (form_field_type === '单选框') {
      await page.click(`text="${form_field_name}" >> xpath=..//text="${value}"`);
      elementFound = true;
    }

    if (!elementFound) {
      throw new Error(`无法定位字段: ${form_field_name}`);
    }
  },

  /**
   * 拾取网页元素选择器
   * @param {string} url 网页地址
   * @returns {Promise<string>} 选择器
   */
  async pickSelector(url) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      // 注入脚本用于拾取元素
      const selector = await page.evaluate(() => {
        return new Promise((resolve) => {
          const style = document.createElement('style');
          style.innerHTML = `
            .autofill-picker-hover { outline: 2px solid #409eff !important; cursor: crosshair !important; }
          `;
          document.head.appendChild(style);

          const onMouseOver = (e) => e.target.classList.add('autofill-picker-hover');
          const onMouseOut = (e) => e.target.classList.remove('autofill-picker-hover');
          const onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const el = e.target;
            // 简单的选择器生成逻辑
            let selector = '';
            if (el.id) selector = `#${el.id}`;
            else if (el.name) selector = `[name="${el.name}"]`;
            else if (el.placeholder) selector = `[placeholder="${el.placeholder}"]`;
            else {
              // 简化的 css path
              selector = el.tagName.toLowerCase();
              if (el.className) selector += `.${el.className.split(' ').join('.')}`;
            }

            cleanup();
            resolve(selector);
          };

          const cleanup = () => {
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
            document.removeEventListener('click', onClick, true);
            document.head.removeChild(style);
          };

          document.addEventListener('mouseover', onMouseOver);
          document.addEventListener('mouseout', onMouseOut);
          document.addEventListener('click', onClick, true);
        });
      });

      return selector;
    } finally {
      await browser.close();
    }
  }
};
