## 阶段一：Electron 环境搭建与基础迁移

我们要开始把这个漂亮的 Web 应用装进 Electron 的“外壳”里了！这是实现自动化填表的第一步。

### 1. 依赖安装
首先需要安装 Electron 核心组件和 Vite 插件：
- `electron`: 核心框架
- `vite-plugin-electron`: 让 Vite 支持 Electron 的插件
- `electron-builder`: 用于后续的打包分发

### 2. 项目结构调整
我们会新建一个 `electron` 目录来存放后端的代码：
- `electron/main.js`: 主进程脚本，负责管理窗口和系统交互。
- `electron/preload.js`: 预加载脚本，作为前端和后端的“安全桥梁”。

### 3. 配置 Vite
修改 `vite.config.js`，让它知道现在是一个 Electron 项目，并配置自动刷新。

### 4. 编写主进程逻辑
- 实现窗口创建函数。
- 开发环境下连接 Vite 开发服务器。
- 生产环境下加载打包后的 HTML。

### 5. 验证通信
在前端和主进程之间打通一个简单的 `ping-pong` 测试，确保“桥梁”搭建成功。

---

**准备好了吗？点击确认后，我将开始为你配置环境并安装必要的依赖！🚀**