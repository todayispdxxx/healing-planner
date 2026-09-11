# 🌸 治愈计划 - 智能计划管理应用

一个面向学生和上班族的 PC 端治愈系智能计划管理应用，帮助你轻松整理待办事项、生成提醒，并通过桌面便利贴和桌宠增加趣味性。

## ✨ 功能特性

### 核心功能
- **智能任务输入**：支持自然语言输入，自动拆分多个任务
- **智能解析**：自动提取任务标题、时间节点、类别、优先级和提醒时间
- **AI 解析**：支持接入 OpenAI/DeepSeek/智谱/Moonshot/通义千问等大模型
- **任务管理**：支持今日/本周/全部任务查看，按类别、优先级筛选
- **温馨提醒**：应用内提醒 + 系统通知（Electron 环境），温和的提醒文案
- **桌面便利贴**：将任务生成便利贴，不同类别不同颜色
- **桌宠陪伴**：可爱的小团子桌宠，根据行为展示不同反馈
- **语音输入**：支持浏览器语音识别和录音转写两种模式

### 桌面应用特性
- **系统托盘**：关闭窗口最小化到托盘，双击托盘图标恢复
- **窗口记忆**：记住窗口大小和位置
- **开机自启**：可选开机自动启动
- **系统通知**：原生 Windows 通知支持

### 治愈风格
- 奶油白底色、柔和配色（浅绿、浅蓝、奶油黄、浅粉）
- 圆润卡片、柔和阴影、充足留白
- 完成任务触发治愈风格反馈文案
- 桌宠互动治愈文案

## 📦 安装与运行

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
cd healing-planner
npm install
```

### 开发模式（浏览器预览）

```bash
npm run dev
```

浏览器访问 `http://localhost:5173` 即可预览应用。

### Electron 开发模式

```bash
npm run electron:dev
```

### 构建桌面应用

```bash
npm run electron:build
```

构建完成后安装包在 `dist-electron` 目录。

## 📁 项目结构

```
healing-planner/
├── electron/                    # Electron 主进程
│   ├── main.js                  # 主进程入口（窗口、托盘、通知）
│   └── preload.js               # 预加载脚本（IPC 通信）
├── public/                      # 静态资源
├── src/                         # 前端源码
│   ├── assets/
│   │   └── styles/
│   │       └── main.css         # 全局样式（治愈风格主题）
│   ├── components/              # UI 组件
│   │   ├── layout/
│   │   │   ├── Sidebar.vue      # 侧边栏导航
│   │   │   └── TitleBar.vue     # 自定义标题栏
│   │   ├── pet/
│   │   │   └── DesktopPet.vue   # 桌宠组件
│   │   ├── reminder/
│   │   │   └── ReminderToast.vue # 提醒弹窗
│   │   ├── sticky/
│   │   │   └── StickyCard.vue   # 便利贴卡片
│   │   └── task/
│   │       ├── TaskCard.vue     # 任务卡片
│   │       ├── TaskEditModal.vue # 任务编辑弹窗
│   │       └── QuickAddModal.vue # 快速添加弹窗
│   ├── router/
│   │   └── index.js             # 路由配置
│   ├── services/                # 业务模块
│   │   ├── storage.js           # 数据存储模块
│   │   ├── taskParser.js        # 任务解析模块
│   │   ├── mockAI.js            # 模拟 AI 解析
│   │   ├── voiceInput.js        # 语音识别服务
│   │   └── voiceRecorder.js     # 录音与转写服务
│   ├── stores/                  # Pinia 状态管理
│   │   ├── petStore.js          # 桌宠状态
│   │   ├── reminderStore.js     # 提醒状态
│   │   ├── settingsStore.js     # 设置状态
│   │   ├── stickyStore.js       # 便利贴状态
│   │   └── taskStore.js         # 任务状态
│   ├── views/                   # 页面视图
│   │   ├── HomeView.vue         # 首页/今日计划
│   │   ├── SmartInputView.vue   # 智能输入页
│   │   ├── TaskListView.vue     # 任务列表页
│   │   ├── StickyNotesView.vue  # 便利贴页
│   │   └── SettingsView.vue     # 设置页
│   ├── App.vue                  # 根组件
│   └── main.js                  # 入口文件
├── index.html                   # HTML 模板
├── package.json                 # 项目配置
├── vite.config.js               # Vite 配置
└── README.md                    # 项目说明
```

## 🎯 使用示例

### 智能输入示例
在智能输入页面输入：
```
明天上午十点交软件工程报告，下午三点开组会，周五前把PPT做完，晚上背英语单词
```

系统将自动解析为 4 个任务：
1. 交软件工程报告 - 明天 10:00 - 工作类 - 中优先级
2. 开组会 - 明天 15:00 - 会议类 - 中优先级
3. 把PPT做完 - 周五 18:00 - 工作类 - 中优先级
4. 背英语单词 - 今天 20:00 - 学习类 - 中优先级

##  技术栈

- **框架**：Vue 3 + Vite
- **桌面**：Electron
- **状态管理**：Pinia
- **路由**：Vue Router
- **存储**：localStorage

## 📄 License

MIT
