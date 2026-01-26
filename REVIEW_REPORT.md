# 项目审查报告：多账号表单自动填写工具

## 1. 概览
本报告对“多账号表单自动填写工具”项目进行了全面的代码和架构审查。项目旨在解决新媒体运营人员重复填写表单的痛点。目前的实现基于 Vue 3 + Vite + Pinia + Element Plus，虽然基础架构清晰， UI 逻辑完善，但核心的“自动填写”功能目前仅为**模拟实现**，且存在重大的架构缺陷，无法满足 PRD 中的业务需求。

## 2. 核心架构问题：自动填写功能不可行

### 2.1 当前实现分析
目前在 `src/views/form/Form.vue` 中：
1.  **表单预览**：通过 `<iframe>` 标签直接嵌入目标 URL。
2.  **填写逻辑**：`simulateFillProcess` 函数完全是**模拟代码**，使用 `setTimeout` 和 `Math.random()` 模拟成功/失败，并未真正与表单页面交互。

### 2.2 技术障碍
这种纯 Web 前端 + iframe 的方案存在两个致命问题，导致真正的“自动填写”无法实现：

1.  **同源策略 (CORS) 限制**：
    *   浏览器的安全策略禁止父页面（您的工具）访问跨域 iframe（腾讯文档、问卷星等）的 DOM 结构。
    *   这意味着您的代码**无法获取** iframe 内部的输入框，更**无法赋值**。
2.  **X-Frame-Options 限制**：
    *   许多主流平台（如腾讯文档）会在 HTTP 响应头中设置 `X-Frame-Options: SAMEORIGIN` 或 `DENY`，这会直接**禁止**您的网页在 iframe 中加载它们的页面。用户将只看到一个空白页或错误拒绝连接。

### 2.3 结论
**当前的纯 Web 架构无法实现 PRD 核心需求。必须引入 Electron 或浏览器扩展技术。**

## 3. 已完成的修复与改进 (本次审查期间)

### 3.1 UI/UX 修复 (深色模式适配)
*   **问题**：用户反馈“账号类型”、“账号状态”、“深色主题”、“中”等选择框（`el-select`）在深色模式下背景未适配，仍为白色。
*   **修复**：修改了 `src/styles/dark-theme.scss`，全面覆盖了 Element Plus 的 CSS 变量（`--el-bg-color`, `--el-text-color-primary` 等）。
*   **结果**：所有下拉选择框、输入框及弹窗现在都能正确适配深色主题，背景色为深灰（#1a1a1a），文字为浅灰。

### 3.2 数据持久化 (Data Persistence)
*   **问题**：初始代码中，`src/stores/account.js` 和 `src/stores/form.js` 仅使用内存存储，刷新页面后数据丢失。
*   **修复**：修改了这两个 store 文件，实现了基于 `localStorage` 的数据持久化。
*   **结果**：账号信息、表单模板和字段映射关系现在会自动保存到本地浏览器存储中，刷新页面不丢失。

### 3.3 账号类型筛选修复
*   **问题**：账号列表的筛选功能失效，因为筛选值为中文（如“抖音”），而数据存储值为拼音（如“douyin”）。
*   **修复**：更新了 `src/views/account/Account.vue` 中的筛选选项值，并补全了缺失的平台选项（快手、微信等）。

## 4. 架构重构建议 (Critical)

为了实现核心的自动填写功能，强烈建议将项目迁移到 **Electron**。

### 4.1 推荐方案：Electron + Preload Script
1.  **引入 Electron**：将当前的 Vue 项目包装在 Electron 容器中。
2.  **使用 `<webview>` 标签**：Electron 的 `<webview>` 标签比普通 `<iframe>` 强大，且可以通过配置绕过部分安全限制。
3.  **注入脚本 (Preload/ExecuteJavaScript)**：
    *   利用 Electron 的 `webview.executeJavaScript()` 或 `preload` 脚本，将 JavaScript 代码注入到目标表单页面中。
    *   注入的脚本负责：查找 DOM 元素（输入框）、模拟用户输入、触发 input 事件。

### 4.2 替代方案：浏览器插件 (Browser Extension)
如果不希望开发桌面客户端，可以开发一个 Chrome/Edge 浏览器插件。
*   **原理**：插件拥有更高的权限，可以通过 `Content Script` 注入代码到任何网页。
*   **流程**：用户打开腾讯文档 -> 点击插件图标 -> 选择账号 -> 插件自动填表。

## 5. 下一步行动计划

1.  **安装 Electron 依赖**：将项目转换为 Electron 项目。
2.  **主进程开发**：配置 Electron 主进程，创建窗口。
3.  **重写填写逻辑**：
    *   废弃 `Form.vue` 中的 `iframe`。
    *   使用 `<webview>` 加载表单。
    *   编写 DOM 操作脚本（针对不同平台如腾讯文档、问卷星编写适配器）。
4.  **验证持久化**：确保 Electron 环境下的数据存储（可能需要切换到 `electron-store` 以获得更好的文件读写能力，不仅仅依赖 localStorage）。

## 6. 总结
项目 UI/UX 基础良好，但核心功能路径错误。请优先处理架构迁移（至 Electron），否则无法交付可用的“自动填写”功能。
