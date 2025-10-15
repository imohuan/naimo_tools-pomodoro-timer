# 🍅 番茄钟计时器

> 专注工作，提升效率的番茄钟与倒计时工具

## ✨ 功能特性

- ✅ **标准番茄钟** - 25 分钟专注工作 + 5 分钟短休息
- ✅ **智能休息** - 每 4 个番茄钟后自动切换到 15 分钟长休息
- ✅ **自定义计时** - 支持 1-120 分钟的自定义倒计时
- ✅ **音效提醒** - 时间结束时播放提示音
- ✅ **数据统计** - 记录每日完成的番茄钟数和工作时长
- ✅ **美观界面** - 现代化设计，操作简单直观
- ✅ **持久化存储** - 统计数据自动保存

## 🚀 使用方法

### 在 Naimo Tools 中使用

1. 在搜索框输入关键词：`番茄钟`、`pomodoro`、`专注`、`计时` 等
2. 选择"番茄钟"功能打开插件
3. 点击"开始"按钮开始计时
4. 专注工作，等待时间结束的提示

### 功能说明

#### 🍅 番茄钟模式

- 点击"番茄钟"按钮，设置 25 分钟工作时间
- 适合需要高度专注的工作任务
- 完成后自动切换到休息模式

#### ☕ 短休息模式

- 点击"短休息"按钮，设置 5 分钟休息时间
- 用于番茄钟之间的短暂休息
- 放松身心，准备下一个番茄钟

#### 🌟 长休息模式

- 点击"长休息"按钮，设置 15 分钟休息时间
- 每完成 4 个番茄钟后自动触发
- 充分休息，恢复精力

#### ⏱️ 自定义计时

- 输入 1-120 之间的分钟数
- 点击"设置"按钮开始自定义倒计时
- 适合其他时长的任务

## 🛠️ 开发指南

### 1. 安装依赖

```bash
pnpm install                    # 安装项目依赖
pnpm run add-electron-types     # 安装 Electron 类型定义（推荐）
```

### 2. 开发模式

```bash
pnpm run dev
```

开发服务器将在本地启动，支持热更新。

### 3. 构建

```bash
pnpm run build
```

构建产物将输出到 `dist/` 目录。

### 4. 类型检查

```bash
pnpm run type-check
```

## 📁 项目结构

```
pomodoro-timer/
├── src/
│   ├── main.ts          # 前端逻辑和UI交互
│   ├── preload.ts       # 功能处理和API暴露
│   └── style.css        # 样式文件
├── dist/                # 构建输出目录
│   ├── index.html       # 构建后的HTML
│   ├── preload.js       # 编译后的Preload脚本
│   ├── js/              # JavaScript代码
│   └── assets/          # 静态资源
├── typings/
│   └── naimo.d.ts       # Naimo API 类型声明
├── index.html           # HTML 模板
├── manifest.json        # 插件配置文件
├── schema.json          # manifest.json JSON Schema
├── package.json         # 包管理配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
└── README.md            # 说明文档
```

## 🎨 技术栈

- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的开发服务器和构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Naimo API** - 完整的插件开发 API
- **Web Audio API** - 提示音效实现

## 💡 核心功能实现

### 计时器逻辑

- 使用 `setInterval` 实现秒级倒计时
- 状态管理：`idle`（空闲）、`running`（运行中）、`paused`（暂停）
- 支持开始、暂停、重置操作

### 数据持久化

```typescript
// 使用 Naimo Storage API 保存统计数据
await naimo.storage.setItem("pomodoro_stats", stats);
const stats = await naimo.storage.getItem("pomodoro_stats");
```

### 音效提醒

```typescript
// 使用 Web Audio API 生成提示音
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
// 配置音频参数并播放
```

### 系统通知

```typescript
// 时间结束时发送系统通知
await naimo.system.notify("🎉 番茄钟完成！休息一下吧", "番茄钟计时器");
```

## 📦 构建和部署

### 本地测试

1. 运行 `pnpm run build` 构建插件
2. 将整个插件文件夹复制到 Naimo Tools 的 `plugins/` 目录
3. 重启 Naimo Tools
4. 在搜索框输入"番茄钟"测试功能

### 生产构建

```bash
pnpm run build
```

构建后的文件：

- `dist/index.html` - 主页面
- `dist/preload.js` - Preload 脚本
- `dist/manifest.json` - 插件配置
- `dist/js/` - JavaScript 代码
- `dist/assets/` - 静态资源

## ❓ 常见问题

### Q: 如何修改番茄钟时长？

在 `src/main.ts` 中修改配置：

```typescript
const config: PomodoroConfig = {
  workDuration: 25, // 工作时长（分钟）
  shortBreakDuration: 5, // 短休息时长（分钟）
  longBreakDuration: 15, // 长休息时长（分钟）
  longBreakInterval: 4, // 长休息间隔（几个番茄钟后）
};
```

### Q: 如何自定义提示音？

在 `src/preload.ts` 的 `playNotificationSound()` 函数中修改音频参数：

```typescript
oscillator.frequency.value = 800; // 音调频率
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // 音量
```

### Q: 数据存储在哪里？

统计数据通过 Naimo Storage API 保存在本地，格式为：

```json
{
  "2025-10-15": {
    "count": 8,
    "workTime": 200
  }
}
```

### Q: 如何调试？

1. 在 Naimo Tools 中打开番茄钟插件
2. 按 F12 打开开发者工具
3. 在 Console 标签查看日志
4. 在 Sources 标签中设置断点调试

## 📝 更新日志

### v1.0.0 (2025-10-15)

- ✅ 初始版本发布
- ✅ 实现标准番茄钟功能
- ✅ 添加自定义倒计时
- ✅ 实现统计功能
- ✅ 添加音效提醒

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
