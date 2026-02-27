"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // App
  getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
  ping: () => electron.ipcRenderer.invoke("ping"),
  // Account
  account: {
    getAll: () => electron.ipcRenderer.invoke("account:getAll"),
    getGroups: () => electron.ipcRenderer.invoke("account:getGroups"),
    add: (account) => electron.ipcRenderer.invoke("account:add", account),
    update: (id, account) => electron.ipcRenderer.invoke("account:update", id, account),
    delete: (id) => electron.ipcRenderer.invoke("account:delete", id)
  },
  group: {
    add: (group) => electron.ipcRenderer.invoke("group:add", group),
    update: (id, group) => electron.ipcRenderer.invoke("group:update", id, group),
    delete: (id) => electron.ipcRenderer.invoke("group:delete", id)
  },
  // Form
  form: {
    getFolders: () => electron.ipcRenderer.invoke("form:getFolders"),
    getTemplates: () => electron.ipcRenderer.invoke("form:getTemplates"),
    getMappings: (templateId) => electron.ipcRenderer.invoke("form:getMappings", templateId),
    addFolder: (folder) => electron.ipcRenderer.invoke("form:addFolder", folder),
    updateFolder: (id, folder) => electron.ipcRenderer.invoke("form:updateFolder", id, folder),
    deleteFolder: (id) => electron.ipcRenderer.invoke("form:deleteFolder", id),
    addTemplate: (template) => electron.ipcRenderer.invoke("form:addTemplate", template),
    updateTemplate: (id, template) => electron.ipcRenderer.invoke("form:updateTemplate", id, template),
    deleteTemplate: (id) => electron.ipcRenderer.invoke("form:deleteTemplate", id),
    deleteTemplates: (ids) => electron.ipcRenderer.invoke("form:deleteTemplates", ids)
  },
  mapping: {
    add: (mapping) => electron.ipcRenderer.invoke("mapping:add", mapping),
    update: (id, mapping) => electron.ipcRenderer.invoke("mapping:update", id, mapping),
    delete: (id) => electron.ipcRenderer.invoke("mapping:delete", id)
  },
  // Setting
  setting: {
    get: (key) => electron.ipcRenderer.invoke("setting:get", key),
    getAll: () => electron.ipcRenderer.invoke("setting:getAll"),
    set: (key, value) => electron.ipcRenderer.invoke("setting:set", key, value)
  },
  // Data
  db: {
    run: (sql, params) => electron.ipcRenderer.invoke("db:run", sql, params),
    query: (sql, params) => electron.ipcRenderer.invoke("db:query", sql, params),
    get: (sql, params) => electron.ipcRenderer.invoke("db:get", sql, params)
  },
  log: {
    getAll: (limit) => electron.ipcRenderer.invoke("log:getAll", limit),
    add: (log) => electron.ipcRenderer.invoke("log:add", log),
    clean: (days) => electron.ipcRenderer.invoke("log:clean", days)
  },
  backup: {
    getAll: () => electron.ipcRenderer.invoke("backup:getAll"),
    add: (backup) => electron.ipcRenderer.invoke("backup:add", backup),
    delete: (id) => electron.ipcRenderer.invoke("backup:delete", id)
  },
  // Migration
  migration: {
    check: () => electron.ipcRenderer.invoke("migration:check"),
    run: (data) => electron.ipcRenderer.invoke("migration:run", data)
  },
  // AutoFill
  autofill: {
    start: (options) => electron.ipcRenderer.invoke("autofill:start", options),
    onProgress: (callback) => electron.ipcRenderer.on("autofill:progress", (event, progress) => callback(progress)),
    removeProgressListeners: () => electron.ipcRenderer.removeAllListeners("autofill:progress"),
    pickSelector: (url) => electron.ipcRenderer.invoke("autofill:pickSelector", url),
    scan: (url) => electron.ipcRenderer.invoke("autofill:scan", url)
  },
  auth: {
    login: (credentials) => electron.ipcRenderer.invoke("auth:login", credentials),
    register: (userData) => electron.ipcRenderer.invoke("auth:register", userData),
    getUser: (userId) => electron.ipcRenderer.invoke("auth:getUser", userId),
    updateProfile: (userId, data) => electron.ipcRenderer.invoke("auth:updateProfile", userId, data),
    saveAvatar: (userId, base64Data) => electron.ipcRenderer.invoke("auth:saveAvatar", userId, base64Data),
    verifyReset: (username, phone) => electron.ipcRenderer.invoke("auth:verifyReset", username, phone),
    resetPassword: (userId, newPassword) => electron.ipcRenderer.invoke("auth:resetPassword", userId, newPassword)
  },
  excel: {
    importAccounts: () => electron.ipcRenderer.invoke("excel:importAccounts"),
    exportAccounts: (accounts, fields) => electron.ipcRenderer.invoke("excel:exportAccounts", accounts, fields)
  },
  schedule: {
    getByMonth: (userId, dateStr) => electron.ipcRenderer.invoke("schedule:getByMonth", userId, dateStr),
    getByDate: (userId, dateStr) => electron.ipcRenderer.invoke("schedule:getByDate", userId, dateStr),
    add: (userId, content, scheduleDate) => electron.ipcRenderer.invoke("schedule:add", userId, content, scheduleDate),
    delete: (id, userId) => electron.ipcRenderer.invoke("schedule:delete", id, userId)
  },
  app: {
    getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
    openAboutDialog: () => electron.ipcRenderer.send("open-about-dialog")
  }
});
