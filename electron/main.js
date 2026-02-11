import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database.js';
import { AccountService } from './services/AccountService.js';
import { FormService } from './services/FormService.js';
import { DataService } from './services/DataService.js';
import { SettingService } from './services/SettingService.js';
import { MigrationService } from './services/MigrationService.js';
import { AutoFillService } from './services/AutoFillService.js';
import { ExcelService } from './services/ExcelService.js';
import { UserService } from './services/UserService.js';
import { seedData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化数据库
initDatabase()
  .then(() => UserService.initAdmin())
  // .then(() => seedData()) // 禁用自动填充模拟数据，防止用户删除数据后自动恢复
  .catch(console.error);

// 屏蔽安全警告（仅在开发环境，因为 Vite 需要 unsafe-eval）
if (process.env.VITE_DEV_SERVER_URL) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

// 注册协议权限，确保 local-resource 协议可以正常加载资源
protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'local-resource', 
    privileges: { 
      secure: true, 
      standard: true, 
      supportFetchAPI: true, 
      corsEnabled: true,
      stream: true
    } 
  }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/vite.svg'),
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // 注册自定义协议以读取本地文件
  protocol.handle('local-resource', (request) => {
    try {
      // 移除协议前缀，支持 local-resource:// 和 local-resource:///
      let urlPath = request.url.replace(/^local-resource:\/*/, '');
      
      // 解码 URL
      urlPath = decodeURIComponent(urlPath);
      
      // 在 Windows 上，如果路径以盘符开始（例如 c/Users/...），我们需要将其转换为 c:/Users/...
      // 或者如果它是 /c/Users/...，我们需要保留它
      
      // 处理 Windows 盘符路径：如果路径以 'c/Users' 开头（没有冒号），我们需要添加冒号
      // 这里的 urlPath 可能是 "c/Users/..." 或者 "C/Users/..."
      if (/^[a-zA-Z]\/Users\//.test(urlPath)) {
        urlPath = urlPath.charAt(0) + ':' + urlPath.slice(1);
      }
      
      // 构造 file: 协议 URL
      // 注意：file:/// 后紧跟盘符是标准格式
      const fileUrl = 'file:///' + urlPath;
      
      console.log(`[LocalResource] Loading: ${request.url} -> ${fileUrl}`);
      
      return net.fetch(fileUrl);
    } catch (error) {
      console.error('[LocalResource] Failed:', error);
      return new Response('Not Found', { status: 404 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers ---

// Account IPC
ipcMain.handle('account:getAll', () => AccountService.getAllAccounts());
ipcMain.handle('account:getGroups', () => AccountService.getAllGroups());
ipcMain.handle('account:add', (event, account) => AccountService.addAccount(account));
ipcMain.handle('account:update', (event, id, account) => AccountService.updateAccount(id, account));
ipcMain.handle('account:delete', (event, id) => AccountService.deleteAccount(id));
ipcMain.handle('group:add', (event, group) => AccountService.addGroup(group));
ipcMain.handle('group:update', (event, id, group) => AccountService.updateGroup(id, group));
ipcMain.handle('group:delete', (event, id) => AccountService.deleteGroup(id));

// Form IPC
ipcMain.handle('form:getFolders', () => FormService.getAllFolders());
ipcMain.handle('form:getTemplates', () => FormService.getAllTemplates());
ipcMain.handle('form:getMappings', (event, templateId) => FormService.getMappingsByTemplate(templateId));
ipcMain.handle('form:addFolder', (event, folder) => FormService.addFolder(folder));
ipcMain.handle('form:updateFolder', (event, id, folder) => FormService.updateFolder(id, folder));
ipcMain.handle('form:deleteFolder', (event, id) => FormService.deleteFolder(id));
ipcMain.handle('form:addTemplate', (event, template) => FormService.addTemplate(template));
ipcMain.handle('form:updateTemplate', (event, id, template) => FormService.updateTemplate(id, template));
ipcMain.handle('form:deleteTemplate', (event, id) => FormService.deleteTemplate(id));
ipcMain.handle('mapping:add', (event, mapping) => FormService.addMapping(mapping));
ipcMain.handle('mapping:update', (event, id, mapping) => FormService.updateMapping(id, mapping));
ipcMain.handle('mapping:delete', (event, id) => FormService.deleteMapping(id));

// Setting IPC
ipcMain.handle('setting:get', (event, key) => SettingService.getSetting(key));
ipcMain.handle('setting:getAll', () => SettingService.getAllSettings());
ipcMain.handle('setting:set', (event, key, value) => SettingService.setSetting(key, value));

// Data IPC
ipcMain.handle('log:getAll', (event, limit) => DataService.getLogs(limit));
ipcMain.handle('log:add', (event, log) => DataService.addLog(log));
ipcMain.handle('log:clean', (event, days) => DataService.cleanExpiredLogs(days));
ipcMain.handle('backup:getAll', () => DataService.getBackups());
ipcMain.handle('backup:add', (event, backup) => DataService.addBackup(backup));
ipcMain.handle('backup:delete', (event, id) => DataService.deleteBackup(id));

// Migration IPC
ipcMain.handle('migration:check', () => MigrationService.isMigrated());
ipcMain.handle('migration:run', (event, data) => MigrationService.migrate(data));

// AutoFill IPC
ipcMain.handle('autofill:start', async (event, options) => {
  return await AutoFillService.startTask(options, (progress) => {
    event.sender.send('autofill:progress', progress);
  });
});

ipcMain.handle('autofill:pickSelector', async (event, url) => {
  return await AutoFillService.pickSelector(url);
});

// App IPC
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('ping', () => 'pong');

// Excel IPC
ipcMain.handle('excel:importAccounts', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] }]
  });
  
  if (result.canceled) return null;
  
  const accounts = ExcelService.parseAccountExcel(result.filePaths[0]);
  return AccountService.addAccountsBulk(accounts);
});

ipcMain.handle('excel:exportAccounts', async (event, accounts, fields) => {
  const result = await dialog.showSaveDialog({
    title: '导出账号',
    defaultPath: path.join(app.getPath('downloads'), `账号列表_${Date.now()}.xlsx`),
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
  });
  
  if (result.canceled) return false;
  
  ExcelService.exportAccountsToExcel(accounts, result.filePath, fields);
  return true;
});

// User Auth IPC
ipcMain.handle('auth:login', async (event, { account, password }) => {
  return await UserService.login(account, password);
});

ipcMain.handle('auth:register', async (event, userData) => {
  return await UserService.register(userData);
});

ipcMain.handle('auth:getUser', async (event, userId) => {
  return await UserService.getUser(userId);
});

ipcMain.handle('auth:updateProfile', async (event, userId, data) => {
  return await UserService.updateProfile(userId, data);
});

ipcMain.handle('auth:saveAvatar', async (event, userId, base64Data) => {
  return await UserService.saveAvatar(userId, base64Data);
});

ipcMain.handle('auth:verifyReset', async (event, username, phone) => {
  return await UserService.verifyUserForReset(username, phone);
});

ipcMain.handle('auth:resetPassword', async (event, userId, newPassword) => {
  return await UserService.resetPassword(userId, newPassword);
});
