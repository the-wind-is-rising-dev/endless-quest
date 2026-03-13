# endless-quest

无尽求索工具站

## 项目介绍

endless-quest 是一个基于 Vue 3 + Vite 开发的多功能在线工具站，提供多种实用工具，方便用户在日常工作和生活中使用。项目目前处于完善阶段，更多功能将在未来持续添加。

## 部署状态

### GitHub Pages

[![GitHub Pages Deploy](https://github.com/the-wind-is-rising-dev/endless-quest/actions/workflows/deploy.yml/badge.svg)](https://github.com/the-wind-is-rising-dev/endless-quest/actions/workflows/deploy.yml)

**访问地址**：

- [https://the-wind-is-rising-dev.github.io/endless-quest/](https://the-wind-is-rising-dev.github.io/endless-quest/)

**部署信息**：

- 自动部署：推送到 `main` 分支时触发
- 部署分支：`gh-pages`
- 路由模式：条件路由模式（GitHub Pages 上使用哈希模式，本地开发使用历史模式）
- 访问示例：`https://the-wind-is-rising-dev.github.io/endless-quest/#/common/json`

## 功能特点

### 🏷️ 通用工具

- **JSON 工具**：美化和压缩 JSON 数据
- **Base64 编解码**：Base64 编码和解码功能
- **URL 编解码**：URL 编码和解码功能
- **时间戳转换器**：时间戳与日期时间相互转换
- **正则表达式助手**：正则表达式测试和生成
- **二维码生成器**：生成各种类型的二维码
- **二维码识别**：识别二维码内容

### 🔢 算法工具

- **MD5 摘要**：生成 MD5 哈希值
- **SHA-1 摘要**：生成 SHA-1 哈希值
- **SHA-256 摘要**：生成 SHA-256 哈希值

### 🎨 主题系统

- 支持多种主题（default、ocean、starry）
- 自动切换深色/浅色模式
- 响应式设计，适配各种设备

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **开发语言**：TypeScript
- **UI 组件库**：Ant Design Vue
- **路由管理**：Vue Router（支持条件路由模式）
- **代码编辑**：CodeMirror 6
- **样式管理**：CSS 变量 + 主题系统
- **二维码处理**：QR Code 生成与识别

## 安装和使用

### 开发环境

- Node.js >= v20.19.4
- npm >= 10.8.2

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── page/              # 页面组件
│   ├── algorithm/     # 算法工具页
│   ├── common/        # 常用工具页
│   └── naming/        # 起名工具页
├── router/            # 路由配置
├── themes/            # 主题相关
│   ├── default/       # 默认主题
│   ├── ocean/         # 海洋主题
│   └── starry/        # 星空主题
├── utils/             # 工具函数
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 未来规划

- 完善通用工具
- 完善算法工具
- 实现起名工具
- 添加更多实用工具
- 优化用户体验

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

## 许可证

MIT License
