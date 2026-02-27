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

// 字段自动匹配字典 (需与前端保持同步，或通过 IPC 传递，这里硬编码作为备份)
const FIELD_MATCH_DICT = {
  'blogger_name': ['博主姓名', '姓名', 'Name', 'Blogger', '博主', '达人'],
  'account_nickname': ['账号昵称', '昵称', 'Nickname', '博主昵称', '达人昵称'],
  'account_type': ['账号类型', '平台', 'Type', '达人类型', '博主类型'],
  'account_id': ['账号ID', 'ID', '平台ID', '小红书ID', '抖音ID', 'B站ID'],
  'homepage_url': ['主页链接', '主页', 'Homepage', 'Link', 'URL', '链接', '个人主页'],
  'fans_count': ['粉丝量', '粉丝数', 'Fans', '粉丝', '关注数'],
  'avg_read_count': ['平均阅读量', '阅读量', 'Read Count', '阅读'],
  'like_count': ['平均点赞量', '点赞量', 'Like Count', '点赞', '赞藏量', '点藏量'],
  'comment_count': ['平均评论量', '评论量', 'Comment Count', '评论'],
  'quote_single': ['单条报价', '报价', 'Quote', 'Price', '图文报价', '报备图文价', '图文价', '直发价'],
  'quote_package': ['套餐报价', 'Package Price', '打包价'],
  'cooperation_type': ['合作形式', 'Cooperation Type', '合作类型'],
  'contact': ['联系方式', '联系人', 'Contact', 'Phone', 'Mobile', 'WeChat', 'Email', '电话', '手机', '微信', '邮箱'],
  'total_like_collect': ['总赞藏数', 'Total Likes', '赞藏总数', '获赞与收藏'],
  'avg_interaction_count': ['平均互动量', 'Interaction', '互动量', '互动'],
  'content_tags': ['内容标签', 'Tags', '标签', '擅长领域', '垂类'],
  'note_price_video': ['视频报价', 'Video Price', '视频价', '报备视频价'],
  'shipping_address': ['收货地址', '地址', 'Address', '寄送地址', '收件地址'],
  'id_card': ['身份证号', '身份证', 'ID Card', '证件号'],
  'bank_card': ['银行卡号', '银行卡', 'Bank Card', '卡号'],
  'alipay_name': ['支付宝姓名', 'Alipay Name', '支付宝'],
  'city': ['所在城市', '城市', 'City', 'Location', '居住地', '常驻地'],
  'promotion_type': ['推广形式', 'Promotion Type', '推广类型']
};

export const AutoFillService = {
  // 运行中的浏览器实例 (key: taskId or 'global')
  activeBrowsers: new Map(),

  /**
   * 获取或创建浏览器实例
   * @param {string} id 实例标识
   * @param {boolean} headless 是否无头
   * @returns {Promise<import('playwright').Browser>}
   */
  async getOrCreateBrowser(id = 'global', headless = false) {
    if (this.activeBrowsers.has(id)) {
      const browser = this.activeBrowsers.get(id);
      if (browser.isConnected()) return browser;
      this.activeBrowsers.delete(id);
    }
    
    const browser = await chromium.launch({ headless });
    this.activeBrowsers.set(id, browser);
    
    // 监听关闭事件
    browser.on('disconnected', () => {
      if (this.activeBrowsers.get(id) === browser) {
        this.activeBrowsers.delete(id);
      }
    });
    
    return browser;
  },

  /**
   * 关闭浏览器实例
   */
  async closeBrowser(id = 'global') {
    if (this.activeBrowsers.has(id)) {
      const browser = this.activeBrowsers.get(id);
      await browser.close().catch(() => {});
      this.activeBrowsers.delete(id);
    }
  },

  /**
   * 开始填表任务
   * @param {Object} options 
   * @param {number[]} options.accountIds 账号 ID 列表
   * @param {number} options.templateId 模板 ID
   * @param {Array} options.fieldDefinitions 字段定义（可选）
   * @param {Object} options.settings 填表设置
   * @param {Function} onProgress 进度回调
   */
  async startTask(options, onProgress) {
    const { accountIds, templateId, fieldDefinitions, settings } = options;
    const { showBrowser = true, submitInterval = 2, autoSubmit = false } = settings;

    const template = (await FormService.getAllTemplates()).find(t => t.id === templateId);
    if (!template) throw new Error('模板不存在');

    // 获取所有全局规则
    const globalRules = await FormService.getAllGlobalMappings();
    let mappings = await FormService.getMappingsByTemplate(templateId);

    const accounts = (await AccountService.getAllAccounts()).filter(a => accountIds.includes(a.id));
    
    // 启动浏览器（复用模式）
    const browser = await this.getOrCreateBrowser('task_runner', !showBrowser);
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
    
    const page = await context.newPage();
    
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        
        onProgress({
          type: 'start',
          accountName: account.account_nickname,
          index: i,
          total: accounts.length
        });

        try {
          // 1. 清理环境 (模拟重置)
          await context.clearCookies();
          await page.evaluate(() => {
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch(e) {}
          });

          // 2. 加载会话 (如果存在)
          const sessionsDir = path.join(app.getPath('userData'), 'sessions');
          if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
          const sessionPath = path.join(sessionsDir, `session_${account.id}.json`);
          
          if (fs.existsSync(sessionPath)) {
            try {
              const storageState = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
              await context.addCookies(storageState.cookies || []);
            } catch (e) {
              console.warn('Failed to load session:', e);
            }
          }

          // 3. 执行填表 (不再传递 logCallback)
          await this.fillPage(page, account, template, mappings, {
            fieldDefinitions, 
            globalRules, 
            autoSubmit 
          }, async (newMappings) => {
             mappings = newMappings;
             // 不再通知前端更新日志
          });

          // 4. 保存会话
          try {
            const storageState = await context.storageState();
            fs.writeFileSync(sessionPath, JSON.stringify(storageState));
          } catch (e) {}

          successCount++;
          await DataService.addLog({
            account_id: account.id,
            template_id: templateId,
            fill_result: '成功',
            submit_count: 1
          });

        } catch (error) {
          failCount++;
          console.error(`Fill failed for account ${account.account_nickname}:`, error);
          
          onProgress({ 
            type: 'error', 
            message: error.message, 
            accountId: account.id
          });

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

        if (i < accounts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, submitInterval * 1000));
        }
      }
    } finally {
      await context.close().catch(() => {});
      if (!showBrowser) {
        await this.closeBrowser('task_runner');
      }
    }

    return { successCount, failCount };
  },

  /**
   * 在指定页面执行填表逻辑 (无浏览器启动逻辑)
   */
  async fillPage(page, account, template, mappings, options, updateMappingsCallback) {
    const { fieldDefinitions, globalRules, autoSubmit } = options;

    await page.goto(template.form_url, { waitUntil: 'domcontentloaded' });
    
    // 检查是否需要 Lazy Scan
    if (!mappings || mappings.length === 0) {
      try {
        const scannedFields = await this.scanPage(page);
        
         // 辅助函数
         const normalize = (s) => {
           if (!s) return '';
           return s.toLowerCase().normalize('NFKC').replace(/[\\s\\-_.:：、，]/g, '');
         };
         const findMatch = (formFieldName) => {
             const formLabel = normalize(formFieldName);
             if (formLabel.length <= 1) return '';

             if (globalRules && Array.isArray(globalRules)) {
               for (const rule of globalRules) {
                 const k = normalize(rule.keyword);
                 if (!k) continue;
                 if (formLabel.includes(k)) return rule.account_field_name;
               }
             }
             for (const [accField, keywords] of Object.entries(FIELD_MATCH_DICT)) {
                if (keywords.some(k => {
                  const nk = normalize(k);
                  return nk && formLabel.includes(nk);
                })) return accField;
             }
             if (fieldDefinitions && Array.isArray(fieldDefinitions)) {
               const potentialMatches = fieldDefinitions.filter(field => {
                 const fieldLabel = normalize(field.label || '');
                  if (fieldLabel.length <= 1) return false;
                  if (formLabel.includes(fieldLabel)) return true;
                  if (fieldLabel.includes(formLabel)) return true;
                  return false;
               });
               if (potentialMatches.length > 0) {
                 potentialMatches.sort((a, b) => (a.label || '').length > (b.label || '').length ? -1 : 1);
                 return potentialMatches[0].name;
               }
             }
             return '';
          };

         for (const field of scannedFields) {
           const matchedAccountField = findMatch(field.form_field_name);
           await FormService.addMapping({
             template_id: template.id,
             form_field_name: field.form_field_name,
             form_field_type: field.form_field_type,
             is_required: field.is_required,
             account_field_name: matchedAccountField,
             is_auto_mapping: !!matchedAccountField
           });
         }

         mappings = await FormService.getMappingsByTemplate(template.id);
         if (updateMappingsCallback) await updateMappingsCallback(mappings);
         
      } catch (e) {
        console.error('Lazy Scan failed:', e);
      }
    }

    // 执行填写
    for (const mapping of mappings) {
      let value = account[mapping.account_field_name];
      if ((value === undefined || value === null) && account.extra_json) {
        try {
          const extra = typeof account.extra_json === 'string' ? JSON.parse(account.extra_json) : account.extra_json;
          value = extra[mapping.account_field_name];
        } catch (e) {}
      }

      if (value === undefined || value === null) continue;
      
      try {
        await this.smartFill(page, mapping, value);
      } catch (e) {
        if (mapping.is_required) throw e;
      }
    }

    // 自动提交逻辑
    if (autoSubmit) {
      const submitSelector = 'button[type="submit"], input[type="submit"], .submit-btn, .btn-submit, button:has-text("提交"), button:has-text("Submit"), div[role="button"]:has-text("提交")';
      try {
        const submitBtn = await page.waitForSelector(submitSelector, { timeout: 3000 });
        if (submitBtn) {
           await submitBtn.click();
           await page.waitForTimeout(2000);
        }
      } catch (e) {
         // silently fail or maybe log to console only
         console.log('Auto submit failed or not found');
      }
    }
  },

  // 兼容旧接口 fillSingle (重定向到 fillPage)
  async fillSingle(account, template, mappings, options, logCallback, updateMappingsCallback) {
     const browser = await this.getOrCreateBrowser('single_runner', !options.showBrowser);
     const context = await browser.newContext();
     const page = await context.newPage();
     
     try {
       const sessionsDir = path.join(app.getPath('userData'), 'sessions');
       const sessionPath = path.join(sessionsDir, `session_${account.id}.json`);
       if (fs.existsSync(sessionPath)) {
         try {
            const storageState = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            await context.addCookies(storageState.cookies || []);
         } catch(e) {}
       }
       
       // 忽略传入的 logCallback
       await this.fillPage(page, account, template, mappings, options, updateMappingsCallback);
       
       try {
         const storageState = await context.storageState();
         if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
         fs.writeFileSync(sessionPath, JSON.stringify(storageState));
       } catch(e) {}
       
       return browser;
     } catch (e) {
       throw e;
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
      let radioFound = false;
      // 策略1: 点击包含文本的 label 或其关联的 radio
      try {
        const label = page.locator(`label:has-text("${value}")`).first();
        if (await label.count() > 0) {
          await label.click();
          radioFound = true;
        }
      } catch (e) {}

      // 策略2: 如果策略1失败，尝试在字段名范围内寻找选项
      if (!radioFound) {
        try {
          // 先定位题目(字段名)，再在附近找选项(value)
          const container = page.locator(`:text("${form_field_name}") >> xpath=..`); 
          const option = container.locator(`:text("${value}")`).first();
          if (await option.count() > 0) {
            await option.click();
            radioFound = true;
          }
        } catch (e) {}
      }
      
      if (radioFound) elementFound = true;
    }
    // 复选框
    else if (form_field_type === '复选框') {
      // 假设 value 是用逗号或分号分隔的多选值
      const values = String(value).split(/[,，;；]/).map(v => v.trim());
      let checkboxFound = false;

      for (const val of values) {
        try {
          // 策略1: 直接点击包含文本的 label
          const label = page.locator(`label:has-text("${val}")`).first();
          if (await label.count() > 0) {
            // 检查是否已选中，未选中则点击
            const input = label.locator('input[type="checkbox"]');
            if (await input.count() > 0) {
              if (!(await input.isChecked())) await label.click();
            } else {
               // 如果找不到内部 input，直接点击 label
               await label.click();
            }
            checkboxFound = true;
            continue;
          }

          // 策略2: 在字段名容器内查找
          const container = page.locator(`:text("${form_field_name}") >> xpath=..`);
          const option = container.locator(`:text("${val}")`).first();
           if (await option.count() > 0) {
            await option.click();
            checkboxFound = true;
          }
        } catch (e) {
          console.warn(`无法勾选复选框选项: ${val}`, e);
        }
      }
      if (checkboxFound) elementFound = true;
    }
    // 文件上传
    else if (form_field_type === '文件上传') {
      // 假设 value 是本地文件路径
      const filePath = String(value);
      if (fs.existsSync(filePath)) {
        for (const selector of selectors) {
            try {
              const input = page.locator(`${selector} >> xpath=..//input[type="file"] | ${selector}`);
              if (await input.count() > 0) {
                await input.first().setInputFiles(filePath);
                elementFound = true;
                break;
              }
            } catch (e) {}
        }
      } else {
          console.warn(`文件不存在: ${filePath}`);
          throw new Error(`文件不存在: ${filePath}`);
      }
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
  },

  /**
   * 扫描表单页面逻辑 (重构为独立方法)
   * @param {import('playwright').Page} page Playwright page object
   * @returns {Promise<Array<{name: string, type: string}>>} 字段列表
   */
  async scanPage(page) {
    try {
      // 检查是否有 iframe（很多表单嵌套在 iframe 中）
      const frames = page.frames();
      console.log(`Scanning page, found ${frames.length} frames`);

      // 在所有 frame 中查找字段
      let allFields = [];
      const seenGlobalNames = new Set();
      
      for (const frame of frames) {
        try {
          // 在页面上下文中执行扫描逻辑
          const fields = await frame.evaluate(() => {
            const results = [];
            
            // 辅助函数：推断字段类型
            const inferType = (el) => {
              const tag = el.tagName.toLowerCase();
              const type = el.type ? el.type.toLowerCase() : '';
              
              if (tag === 'select') return '下拉框';
              if (tag === 'textarea') return '输入框';
              if (tag === 'input') {
                if (['radio'].includes(type)) return '单选框';
                if (['checkbox'].includes(type)) return '复选框';
                if (['file'].includes(type)) return '文件上传';
                if (['button', 'submit', 'reset', 'image', 'hidden'].includes(type)) return null; // 忽略非输入控件
                return '输入框';
              }
              return null;
            };
    
            // 辅助函数：获取字段名称（Label）
            const getLabel = (el) => {
              let labelText = '';

              // 策略 0: 直接查找 MikeCRM 特定的 .f-label (最高优先级)
              // 针对 MikeCRM 这种 input 在 label 内部或兄弟节点的结构
              // 尝试向上找 .f-item，然后找里面的 .f-label
              const mikeItem = el.closest('.f-item');
              if (mikeItem) {
                 // 尝试查找 .f-label
                 const mikeLabel = mikeItem.querySelector('.f-label');
                 if (mikeLabel) return mikeLabel.innerText;
                 
                 // React 结构的 span
                 const mikeReactSpan = mikeItem.querySelector('span[data-reactid*="$bodyMain"]');
                 if (mikeReactSpan) return mikeReactSpan.innerText;

                 // 尝试 .title
                 const mikeTitle = mikeItem.querySelector('.title');
                 if (mikeTitle) return mikeTitle.innerText;
              }

              // 策略 1: 检查是否有 id，并查找对应的 label[for]
              if (el.id) {
                const label = document.querySelector(`label[for="${el.id}"]`);
                if (label) labelText = label.innerText;
              }
              
              // 策略 2: 检查 aria-label
              if (!labelText && el.getAttribute('aria-label')) {
                labelText = el.getAttribute('aria-label');
              }
              
              // 策略 3: 检查 placeholder
              if (!labelText && el.placeholder) {
                labelText = el.placeholder;
              }
              
              // 策略 4: 查找最近的父级 label 元素
              if (!labelText) {
                const parentLabel = el.closest('label');
                if (parentLabel) labelText = parentLabel.innerText;
              }
              
              // 策略 5: 通用容器查找
              if (!labelText) {
                // 向上查找通用的容器类名
                const container = el.closest('.f-item, .form-group, .field-container, .question-item, div[class*="item"], div[class*="field"], div[class*="block"], .ksapc-question-item, .question-container, .ant-form-item, .obj_item, .pd-list-item');
                if (container) {
                   // WPS 表单: .ksapc-question-title-title
                   const wpsTitle = container.querySelector('.ksapc-question-title-title');
                   if (wpsTitle) {
                     labelText = wpsTitle.innerText;
                   } 
                   // 问卷星: .topichtml (旧版) 或 .field-label (新版)
                   else if (container.querySelector('.topichtml')) {
                     labelText = container.querySelector('.topichtml').innerText;
                   }
                   else if (container.querySelector('.field-label')) {
                     labelText = container.querySelector('.field-label').innerText;
                   }
                   // 腾讯文档: .form-auto-ellipsis 或 .question-title
                   else if (container.querySelector('.form-auto-ellipsis')) {
                     labelText = container.querySelector('.form-auto-ellipsis').innerText;
                   }
                   else if (container.querySelector('.question-title')) {
                     labelText = container.querySelector('.question-title').innerText;
                   }
                   // MikeCRM: 带有 data-reactid 的 span 或 .f-label
                   else {
                      // MikeCRM React 特征
                      const reactLabel = container.querySelector('span[data-reactid*="$bodyMain"]');
                      // MikeCRM 传统特征
                      const fLabel = container.querySelector('.f-label');
                      // 尝试更宽泛的 MikeCRM 选择器
                      const fItemLabel = container.querySelector('.f-item-label');
                      
                      if (reactLabel) {
                        labelText = reactLabel.innerText;
                      } else if (fLabel) {
                        labelText = fLabel.innerText;
                      } else if (fItemLabel) {
                        labelText = fItemLabel.innerText;
                      } else {
                        // 通用标题查找
                        const title = container.querySelector('label, .title, .question-title, h3, h4, span[class*="label"], div[class*="title"], .label-text');
                        if (title) labelText = title.innerText;
                      }
                   }
                }
              }

              // 策略 5.5: 针对特殊结构的兄弟查找 (WPS/Tencent/Mike 等可能使用非嵌套结构)
              if (!labelText) {
                 // 尝试查找父级 div 的前一个兄弟 div 中的文本
                 const parentDiv = el.closest('div');
                 if (parentDiv) {
                   const prevDiv = parentDiv.previousElementSibling;
                   if (prevDiv) {
                     // 检查前一个兄弟是否包含特定类名
                     if (prevDiv.querySelector('.ksapc-question-title-title')) {
                       labelText = prevDiv.querySelector('.ksapc-question-title-title').innerText;
                     } else if (prevDiv.querySelector('.topichtml')) {
                        labelText = prevDiv.querySelector('.topichtml').innerText;
                     } else if (prevDiv.querySelector('.f-label')) {
                        labelText = prevDiv.querySelector('.f-label').innerText;
                     } else if (prevDiv.querySelector('.f-item-label')) {
                        labelText = prevDiv.querySelector('.f-item-label').innerText;
                     } else if (prevDiv.innerText && prevDiv.innerText.length < 100) { // 放宽长度限制
                        // 简单的文本兄弟，但要排除纯空白
                        const text = prevDiv.innerText.trim();
                        if (text) labelText = text;
                     }
                   }
                 }
              }
              
              // 策略 6: 如果还是没找到，尝试获取前一个兄弟元素的文本
              if (!labelText) {
                const prev = el.previousElementSibling;
                if (prev && ['LABEL', 'SPAN', 'DIV', 'P'].includes(prev.tagName)) {
                   labelText = prev.innerText;
                }
              }

              return labelText ? labelText.trim().replace(/[*:]/g, '') : '';
            };
    
            // 查找所有输入元素
            // 扩展选择器以支持更多框架 (Ant Design, Element UI, etc.)
            const inputs = document.querySelectorAll('input, textarea, select, [role="textbox"], [contenteditable="true"]');
            
            inputs.forEach(input => {
               // 忽略隐藏或禁用的元素
               if (input.type === 'hidden' || input.style.display === 'none' || input.disabled) return;
               
               const type = inferType(input);
               if (!type && !input.getAttribute('contenteditable')) return; // 忽略无效类型
               
               const label = getLabel(input);
               
               // 如果没有 Label，通常无法匹配，但为了完整性可以根据 name 属性尝试（虽然通常是随机的）
               if (!label && !input.name) return;
               
               const fieldName = label || input.name || '未命名字段';
               
               results.push({
                 form_field_name: fieldName,
                 form_field_type: type || '输入框',
                 is_required: input.required || input.getAttribute('aria-required') === 'true' || (label && label.includes('*')),
                 selector: '' 
               });
            });
            
            return results;
          });
          
          if (fields && fields.length > 0) {
             console.log(`Frame found ${fields.length} fields`);
             // 去重合并
             fields.forEach(f => {
               const key = `${f.form_field_name}-${f.form_field_type}`;
               if (!seenGlobalNames.has(key)) {
                 seenGlobalNames.add(key);
                 allFields.push(f);
               }
             });
          }
        } catch (e) {
          console.warn('Error scanning frame:', e);
        }
      }
      
      console.log(`Total fields found: ${allFields.length}`);
      return allFields;

    } catch (e) {
       console.error('Scan page failed:', e);
       throw e;
    }
  },

  /**
   * 扫描表单页面，提取可能的字段
   * @param {string} url 网页地址
   * @returns {Promise<Array<{name: string, type: string}>>} 字段列表
   */
  async scanForm(url) {
    // 启动浏览器（有头模式，绕过反爬）
    const browser = await chromium.launch({ headless: false }); 
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    try {
      console.log('Scanning URL:', url);
      // 增加超时时间，防止加载过慢
      // 某些网站（如腾讯文档）加载极慢或有重定向，放宽到 60s
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // 等待网络空闲，确保 React/Vue 组件渲染完成
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => console.log('Network idle timeout, proceeding...'));
      } catch (e) {
        console.warn('Page load timeout or error:', e);
        // 继续尝试扫描，因为可能部分 DOM 已加载
      }
      
      // 等待可能的动态加载
      await page.waitForTimeout(3000);

      // 调用提取出的 scanPage
      return await this.scanPage(page);

    } catch (e) {
       console.error('Scan failed:', e);
       throw e;
    } finally {
      await browser.close();
    }
  },
};