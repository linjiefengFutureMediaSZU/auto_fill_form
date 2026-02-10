import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // App
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  ping: () => ipcRenderer.invoke('ping'),

  // Account
  account: {
    getAll: () => ipcRenderer.invoke('account:getAll'),
    getGroups: () => ipcRenderer.invoke('account:getGroups'),
    add: (account) => ipcRenderer.invoke('account:add', account),
    update: (id, account) => ipcRenderer.invoke('account:update', id, account),
    delete: (id) => ipcRenderer.invoke('account:delete', id),
  },
  group: {
    add: (group) => ipcRenderer.invoke('group:add', group),
    update: (id, group) => ipcRenderer.invoke('group:update', id, group),
    delete: (id) => ipcRenderer.invoke('group:delete', id),
  },

  // Form
  form: {
    getFolders: () => ipcRenderer.invoke('form:getFolders'),
    getTemplates: () => ipcRenderer.invoke('form:getTemplates'),
    getMappings: (templateId) => ipcRenderer.invoke('form:getMappings', templateId),
    addFolder: (folder) => ipcRenderer.invoke('form:addFolder', folder),
    updateFolder: (id, folder) => ipcRenderer.invoke('form:updateFolder', id, folder),
    deleteFolder: (id) => ipcRenderer.invoke('form:deleteFolder', id),
    addTemplate: (template) => ipcRenderer.invoke('form:addTemplate', template),
    updateTemplate: (id, template) => ipcRenderer.invoke('form:updateTemplate', id, template),
    deleteTemplate: (id) => ipcRenderer.invoke('form:deleteTemplate', id),
  },
  mapping: {
    add: (mapping) => ipcRenderer.invoke('mapping:add', mapping),
    update: (id, mapping) => ipcRenderer.invoke('mapping:update', id, mapping),
    delete: (id) => ipcRenderer.invoke('mapping:delete', id),
  },

  // Setting
  setting: {
    get: (key) => ipcRenderer.invoke('setting:get', key),
    getAll: () => ipcRenderer.invoke('setting:getAll'),
    set: (key, value) => ipcRenderer.invoke('setting:set', key, value),
  },

  // Data
  log: {
    getAll: (limit) => ipcRenderer.invoke('log:getAll', limit),
    add: (log) => ipcRenderer.invoke('log:add', log),
    clean: (days) => ipcRenderer.invoke('log:clean', days),
  },
  backup: {
    getAll: () => ipcRenderer.invoke('backup:getAll'),
    add: (backup) => ipcRenderer.invoke('backup:add', backup),
    delete: (id) => ipcRenderer.invoke('backup:delete', id),
  },

  // Migration
  migration: {
    check: () => ipcRenderer.invoke('migration:check'),
    run: (data) => ipcRenderer.invoke('migration:run', data),
  },

  // AutoFill
  autofill: {
    start: (options) => ipcRenderer.invoke('autofill:start', options),
    onProgress: (callback) => ipcRenderer.on('autofill:progress', (event, progress) => callback(progress)),
    removeProgressListeners: () => ipcRenderer.removeAllListeners('autofill:progress'),
    pickSelector: (url) => ipcRenderer.invoke('autofill:pickSelector', url),
  },
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    register: (userData) => ipcRenderer.invoke('auth:register', userData),
    getUser: (userId) => ipcRenderer.invoke('auth:getUser', userId),
    updateProfile: (userId, data) => ipcRenderer.invoke('auth:updateProfile', userId, data),
    saveAvatar: (userId, base64Data) => ipcRenderer.invoke('auth:saveAvatar', userId, base64Data),
    verifyReset: (username, phone) => ipcRenderer.invoke('auth:verifyReset', username, phone),
    resetPassword: (userId, newPassword) => ipcRenderer.invoke('auth:resetPassword', userId, newPassword),
  },
  excel: {
    importAccounts: () => ipcRenderer.invoke('excel:importAccounts'),
    exportAccounts: (accounts, fields) => ipcRenderer.invoke('excel:exportAccounts', accounts, fields),
  },
  app: {}
});
