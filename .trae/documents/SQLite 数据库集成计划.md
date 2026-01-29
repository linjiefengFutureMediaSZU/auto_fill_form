## 阶段二：数据持久化层（SQLite）建设

这一阶段我们要把数据从脆弱的 `localStorage` 搬到稳固的 **SQLite** 数据库中。

### 1. 技术准备
- **安装核心库**：安装 `better-sqlite3`，它是 Electron 环境下性能最好、最稳定的 SQLite 驱动。
- **目录规划**：在 `electron` 下创建 `services` 目录，用于存放处理账号、表单、日志的业务逻辑。

### 2. 数据库建模与初始化
- **创建数据库管理器**：编写 `electron/database.js`，负责数据库连接和表结构初始化。
- **设计 8 张核心表**：
    - `account_groups` (分组)
    - `accounts` (账号信息，支持 JSON 扩展字段)
    - `form_folders` (表单文件夹)
    - `form_templates` (表单模板)
    - `form_field_mappings` (字段映射规则)
    - `fill_logs` (填写日志)
    - `system_settings` (系统配置)
    - `backups` (备份记录)

### 3. 后端服务开发 (IPC 实现)
- **AccountService**: 实现账号和分组的 CRUD 操作。
- **FormService**: 实现表单模板和字段映射的操作。
- **DataService**: 处理日志记录和备份。
- **SettingService**: 处理系统设置的持久化。

### 4. 预加载脚本升级
- 在 `preload.js` 中暴露更丰富的 API，例如 `window.electronAPI.account.getAll()`。

### 5. 数据平滑迁移
- **编写 MigrationService**：实现从前端发送 JSON 数据到后端并写入 SQLite 的逻辑。
- **触发迁移**：在应用启动时自动检测是否需要从 `localStorage` 迁移数据。

### 6. 前端 Store 重构
- 修改 Pinia Stores（`account.js`, `form.js` 等），将原本操作 `localStorage` 的逻辑替换为调用 `window.electronAPI`。

---

**点击确认后，我将开始为你安装数据库依赖并构建底层存储架构！📊**