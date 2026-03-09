# AutoFill 表单自动填写工具

![Project Architecture](./architecture_poster.png)

一款功能强大的多账号表单自动填写桌面应用，采用现代化 Web 技术构建，集成自动化填表引擎。

## 功能特性

### 👤 用户系统
- 用户注册/登录
- 个人资料管理（修改用户名、手机号、邮箱）
- 头像上传
- 会员等级展示（预留接口）

### 📅 日程管理
- 日历视图展示
- 新增/删除日程
- 按月/按日查看日程

### 📋 账号管理
- 多账号管理（支持分组）
- 批量导入账号（Excel/CSV）
- 账号状态管理（启用/禁用）
- 扩展字段支持（自定义属性）

### 📝 表单填写
- 三列布局：账号选择 → 表单模板 → 预览填写
- 支持选择单个或批量填写
- 自动字段匹配
- 填写进度实时显示
- 自动提交功能

### 📁 表单列表
- 文件夹管理
- 表单模板管理
- 表单类型支持（腾讯文档、问卷星、石墨、MikeCRM、WPS等）

### 🔗 字段匹配规则
- 全局字段映射规则
- 自动匹配算法
- 支持同义词模糊匹配

### 📊 数据管理
- 填写日志记录
- 数据备份/恢复

### ⚙️ 基础设置
- 主题切换（浅色/深色）
- 多语言支持（中文/英文）

### 💬 帮助与反馈
- 使用手册
- FAQ 常见问题
- 问题反馈提交
- 反馈历史查看

## 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Electron |
| 前端框架 | Vue 3 + Vite |
| UI 组件 | Element Plus |
| 状态管理 | Pinia |
| 数据库 | SQLite3 |
| 自动化引擎 | Playwright + Puppeteer Stealth |
| 国际化 | vue-i18n |
| 表格处理 | xlsx |

## 项目结构

```
auto_fill_form/
├── electron/                  # Electron 主进程
│   ├── main.js               # 应用入口
│   ├── preload.js            # 预加载脚本
│   ├── database.js           # 数据库连接
│   └── services/             # 业务服务
│       ├── AccountService.js # 账号服务
│       ├── AutoFillService.js# 自动填表服务
│       ├── DataService.js    # 数据服务
│       ├── FormService.js    # 表单服务
│       ├── ScheduleService.js# 日程服务
│       ├── SettingService.js # 设置服务
│       └── UserService.js    # 用户服务
├── src/                      # Vue 前端
│   ├── components/           # 公共组件
│   ├── views/                # 页面视图
│   │   ├── account/          # 账号管理
│   │   ├── data/             # 数据管理
│   │   ├── form/             # 表单填写
│   │   ├── formList/         # 表单列表
│   │   ├── globalMapping/    # 全局映射
│   │   ├── help/             # 帮助与反馈
│   │   ├── login/            # 登录注册
│   │   ├── profile/          # 个人中心
│   │   └── settings/         # 系统设置
│   ├── stores/               # Pinia 状态管理
│   ├── locales/              # 国际化语言包
│   ├── styles/               # 样式文件
│   └── router/               # 路由配置
├── data/                     # 数据库存储
└── dist-electron/            # 编译后的后端文件
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd auto_fill_form

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建打包

```bash
npm run package
```

## 使用说明

1. **首次使用**：注册账号并登录
2. **添加账号**：进入"账号管理"页面，批量导入或单个添加账号
3. **创建表单**：在"表单列表"中添加表单模板和文件夹
4. **设置映射**：配置表单字段与账号属性的映射关系
5. **开始填表**：进入"表单填写"，选择账号和模板，点击填写按钮

## 数据库

本地 SQLite 数据库位于 `data/data.db`，包含以下主要表：
- `users` - 用户信息
- `accounts` - 账号数据
- `account_groups` - 账号分组
- `form_templates` - 表单模板
- `form_folders` - 表单文件夹
- `form_field_mappings` - 字段映射
- `fill_logs` - 填写日志
- `schedules` - 日程数据
- `feedbacks` - 用户反馈

## 许可证

MIT License
