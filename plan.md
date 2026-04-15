# 月度排班表 PWA 应用设计方案

## Context

需要设计一款高颜值的手机可用的月度排班表 PWA 应用，兼具实用性和视觉设计空间。采用现代卡片式设计，支持响应式布局，包含完整的日期标记、hover 详情和深色模式。数据通过 GitHub Gist 存储，无需服务器和数据库，可部署至 GitHub Pages。

---

## 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 结构 | HTML5 + PWA Manifest | 支持 PWA 安装 |
| 样式 | CSS3 (CSS Variables, Grid, Flexbox) | 响应式 + 深色模式 |
| 交互 | Vanilla JavaScript (ES6+) | 轻量级，无框架依赖 |
| 数据 | GitHub Gist API | JSON 存储排班数据 |
| 图标 | Lucide Icons (CDN) | 现代简洁风格 |

---

## 文件结构

```
lulu-shift/
├── index.html          # 主页面
├── manifest.json       # PWA 配置
├── sw.js              # Service Worker（离线缓存）
├── styles/
│   ├── main.css       # 主样式
│   ├── calendar.css   # 日历组件样式
│   ├── dark.css       # 深色模式样式
│   └── components.css # 卡片、按钮等组件样式
├── scripts/
│   ├── app.js         # 主入口
│   ├── calendar.js    # 日历渲染逻辑
│   ├── gist.js        # GitHub Gist API 操作
│   ├── pwa.js         # PWA 注册
│   ├── dark-mode.js   # 深色模式切换
│   └── export.js      # 导出/打印功能
├── assets/
│   └── icons/         # PWA 图标（192x192, 512x512）
└── readme.md
```

---

## 核心功能模块

### 1. 日历视图组件 (Calendar)

**布局结构**：
- 月份标题：悬浮于日历上方，带阴影效果
- 星期标题栏：周一～周日
- 日期网格：6行×7列（42格），卡片式设计

**交互**：
- 点击左右箭头切换月份
- 点击日期弹出状态选择弹窗
- Hover 时日期卡片轻微上浮（translateY -4px）

**状态定义**：
| 状态 | 颜色 | CSS 变量 |
|------|------|----------|
| 白班 | 蓝色 | `--color-day: #3b82f6` |
| 夜班 | 橙色 | `--color-night: #f97316` |
| 休息 | 紫色 | `--color-rest: #8b5cf6` |
| 事假 | 青色 | `--color-personal: #06b6d4` |
| 病假 | 粉色 | `--color-sick: #ec4899` |
| 年假 | 绿色 | `--color-annual: #10b981` |
| 空/未排 | 灰色 | `--color-empty: #6b7280` |

### 2. 状态选择弹窗 (Status Modal)

**触发**：点击日期卡片
**内容**：
- 当前日期显示
- 状态选项按钮（带颜色标识）
- 保存/取消按钮
- 删除排班选项

**动画**：淡入+缩放动画

### 3. 深色模式 (Dark Mode)

**实现方式**：CSS Variables 切换
**切换方式**：顶部浮动切换按钮（太阳/月亮图标）
**持久化**：localStorage 存储偏好

### 4. 导出/打印功能 (Export)

**功能入口**：顶部工具栏按钮
**实现方式**：
- 调用 `window.print()` 触发浏览器打印
- 打印样式 `@media print` 优化：
  - 隐藏操作按钮
  - 白色背景（忽略深色模式）
  - 日期格子适当放大
  - 每页一个月份

### 5. GitHub Gist 数据同步

**数据格式** (JSON)：
```json
{
  "year": 2026,
  "month": 4,
  "schedules": [
    { "date": "2026-04-01", "type": "day", "text": "白班" },
    { "date": "2026-04-02", "type": "night", "text": "夜班" },
    { "date": "2026-04-03", "type": "rest", "text": "休息" }
  ]
}
```
> 数组格式更直观，便于人工阅读和调试。

**API 操作**：
- `GET gist` - 页面加载时读取
- `PATCH gist` - 保存更改

**Gist ID 配置**：用户需提供自己的 Gist ID 和 Token

---

## 响应式断点

| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机 | < 640px | 单列，日期格子 40x40px |
| 平板 | 640-1024px | 双列侧边栏 |
| 桌面 | > 1024px | 居中最大宽度 800px |

---

## PWA 配置

**manifest.json 关键配置**：
```json
{
  "name": "月度排班表",
  "short_name": "排班表",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [...]
}
```

**Service Worker**：
- 缓存策略：Cache First（静态资源）
- 离线可用

---

## 验证计划

1. **本地运行**：`npx serve .` 或直接打开 `index.html`
2. **PWA 测试**：Chrome DevTools → Application → Service Workers
3. **Gist 功能**：配置 Gist ID 后测试增删改查
4. **深色模式**：浏览器 DevTools 模拟深色偏好
5. **响应式**：DevTools Mobile Mode 测试不同屏幕尺寸
6. **功能清单**：
   - [ ] 月份切换正常
   - [ ] 点击日期弹出选择框
   - [ ] 选择状态后正确显示颜色
   - [ ] 深色模式切换正常
   - [ ] Gist 数据保存/加载正常
   - [ ] 导出/打印功能正常
   - [ ] PWA 可安装

---

## 依赖资源（CDN）

- Lucide Icons: `https://unpkg.com/lucide@latest`
- Google Fonts: Inter (可选)
