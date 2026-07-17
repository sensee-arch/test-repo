# .ai/about.md — 项目章程

> 项目名称：Web版 Todo List 协作应用
> 仓库地址：https://github.com/sensee-arch/test-repo
> 版本：v1.0
> 创建日期：2026-07-17

---

## 1. 项目概述 (Project Overview)

本项目是一个**协作式 Web 版 Todo List 应用**，基于纯前端技术栈（HTML5 + CSS3 + Vanilla JavaScript ES6+），数据持久化使用浏览器 `localStorage`。项目托管在 GitHub，通过 FlyingHub 群聊协作模式，由 AI Agent 团队完成开发全流程。

### 源文件位置

```
src/web/todo/
├── index.html    # 主页面骨架
├── style.css     # 样式表
└── app.js        # 应用逻辑（4层架构合一）
```

### 关键约束

- 无后端、无框架、无构建工具
- 不包含分页、登录、标签、用户认证
- 数据不跨设备同步

---

## 2. 核心目标 (Core Objectives)

1. **功能性**：提供完整的 TODO 增删改查 + 完成状态切换，筛选（全部/进行中/已完成）
2. **持久化**：所有数据通过 `localStorage` 保持，刷新不丢失
3. **可维护性**：采用 4 层架构（Storage → State → Render → Event），单向数据流
4. **协作性**：通过 AI Agent 团队（主持人+管理员+开发者+审查者）分工完成
5. **质量保障**：契约优先，编码前完成规格→规划→契约

---

## 3. 技术架构 (Technical Architecture)

### 3.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 展示层 | HTML5 + CSS3 | 语义化标签，Flexbox/Grid 布局 |
| 逻辑层 | Vanilla JavaScript | ES6+ 语法，模块化对象 |
| 存储层 | Web Storage API | `localStorage` (key-value) |
| 版本控制 | Git + GitHub | 分支协作流程 |

### 3.2 4 层架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Event Layer                          │
│  输入框绑定 · 按钮点击 · 键盘事件 · 筛选切换           │
└──────────────────────┬──────────────────────────────────┘
                        │ 调用
┌──────────────────────▼──────────────────────────────────┐
│                    State Layer                          │
│  todos[] · filter · CRUD 方法 · onChange 回调           │
└────────┬──────────────────────────────┬─────────────────┘
          │ 持久化                       │ 通知
┌────────▼──────────────┐  ┌────────────▼─────────────────┐
│   Storage Layer       │  │      Render Layer            │
│   localStorage       │  │  DOM 渲染 · 列表更新 · 计数  │
│   JSON 序列化        │  │  空状态 · 筛选按钮高亮       │
└───────────────────────┘  └──────────────────────────────┘
```

### 3.3 模块接口设计

#### Storage 层
```javascript
const Storage = {
  getTodos()         // ⇒ TodoItem[]  读取全部
  saveTodos(items)   // ⇒ void        写入全部
  clearTodos()       // ⇒ void        清空全部
}
```

#### State 层
```javascript
const State = {
  todos: [],                     // TodoItem[]
  filter: 'all',                 // 'all' | 'active' | 'completed'
  onChange: null,                // 数据变更回调
  addTodo(title)                 // ⇒ void   创建
  deleteTodo(id)                 // ⇒ void   删除
  toggleTodo(id)                 // ⇒ void   完成状态切换
  updateTodo(id, newTitle)       // ⇒ void   编辑
  setFilter(filter)              // ⇒ void   筛选
  getFilteredTodos()             // ⇒ TodoItem[]
  getActiveCount()               // ⇒ number
  clearCompleted()               // ⇒ void
}
```

#### Render 层
```javascript
const Render = {
  renderAll()                     // ⇒ void    全量渲染
  renderTodoList()                // ⇒ void    渲染列表
  renderCount()                   // ⇒ void    渲染计数
  renderFilterButtons()           // ⇒ void    渲染筛选按钮
  renderEmptyState()              // ⇒ void    渲染空状态
}
```

#### Event 层
```javascript
const Event = {
  init()                          // ⇒ void    事件初始化
  onAddTodo(e)                    // ⇒ void    添加事件
  onToggleTodo(id)                // ⇒ void    切换事件
  onDeleteTodo(id)                // ⇒ void    删除事件
  onEditTodo(id, newTitle)        // ⇒ void    编辑事件
  onFilterChange(filter)          // ⇒ void    筛选事件
}
```

---

## 4. 基础契约 (Base Contract)

### 4.1 TodoItem 数据模型

```javascript
{
  "id": "a1b2c3d4",        // string, 8字符唯一ID（随机字母数字）
  "title": "买牛奶",       // string, 1-200字符
  "completed": false,      // boolean, 完成状态
  "createdAt": 1721193600000  // number, Unix毫秒时间戳
}
```

### 4.2 localStorage 键值约定

| 键名 | 值格式 | 示例 |
|------|--------|------|
| `todo_items` | JSON 数组 | `[{"id":"a1b2c3d4","title":"买牛奶","completed":false,"createdAt":1721193600000}]` |

### 4.3 排序规则

- 按 `createdAt` **降序**排列（最新的在前）

---

## 5. Agent 分工 (Agent Division)

| 角色 | 职责 | 阶段 |
|------|------|------|
| 🎩 **主持人** | 欢迎、状态广播、进度通报 | 全流程 |
| 📋 **管理员** | 需求分析、规格编写、规划、契约 | 前期 |
| 💻 **开发者** | 编码实现（TASK-1 至 TASK-7） | 中期 |
| 👀 **审查者** | 代码审查、验收测试（TASK-8） | 后期 |

### 协作工作流

1. **Free Chat** — 自由讨论
2. **`/spec`** — 触发需求规格生成
3. **`/coding`** — 触发完整开发流水线

---

## 6. 运行与依赖 (Running & Dependencies)

### 6.1 运行方式

本项目为纯前端 SPA，无需构建步骤：

```bash
# 方式一：直接在浏览器打开
open src/web/todo/index.html

# 方式二：使用本地 HTTP 服务器（推荐）
cd src/web/todo
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 6.2 浏览器兼容

- Google Chrome（最新两版本）
- Mozilla Firefox（最新两版本）
- Microsoft Edge（最新两版本）
- Safari（最新两版本）

### 6.3 依赖

- 无第三方依赖
- 仅使用浏览器原生 API（DOM API, Web Storage API, ES6+）

---

## 7. 协作规则 (Collaboration Rules)

### 7.1 分支命名

```
flyinghub-YYYYMMDDHHmmss
```

示例：`flyinghub-20260717152103`

### 7.2 提交规范

- 一条提交携带明确语义
- 提交信息使用中文或英文，包含任务编号（如 `TASK-1: Add HTML structure`）

### 7.3 契约优先

编码前必须完成：规格（Spec）→ 规划（Plan）→ 契约（Contract）

### 7.4 文档位置

| 文档 | 路径 |
|------|------|
| 项目章程 | `.ai/about.md` |
| 架构文档 | `ARCH.md` |
| 架构决策记录 | `docs/adr/` |
| 需求规格 | (Standalone 文件) |
| 技术方案/任务分解 | (Standalone 文件) |

### 7.5 任务分解

| 任务 | 名称 | 估算 | 依赖 |
|------|------|------|------|
| TASK-1 | HTML 骨架构建 | 0.5h | - |
| TASK-2 | CSS 样式设计 | 1h | TASK-1 |
| TASK-3 | Storage 层实现 | 0.5h | - |
| TASK-4 | State 层实现 | 1h | TASK-3 |
| TASK-5 | Render 层实现 | 1.5h | TASK-2, TASK-4 |
| TASK-6 | Event 层实现 | 1.5h | TASK-4 |
| TASK-7 | 集成与联调 | 1.5h | TASK-5, TASK-6 |
| TASK-8 | 验证与测试 | 1h | TASK-7 |
| **合计** | | **8.5h** | |

---

## 8. 演进原则 (Evolution Principles)

1. **渐进增强**：保持核心功能完整的同时，允许未来扩展（标签、分类、搜索）
2. **技术债务控制**：每次变更后运行验收标准（AC-01 至 AC-30），确保回归
3. **文档同步**：任何架构变更须同步更新 `.ai/about.md` 和 `ARCH.md`
4. **最小化变更**：对数据模型的变更须评审讨论，避免不可逆改动
5. **安全性**：所有输入通过 `textContent` 而非 `innerHTML` 处理，防范 XSS
6. **可访问性**：遵循 WCAG AA 标准，确保键盘可操作

---

*本文档由 AI Agent 自动生成，作为项目唯一章程。*
