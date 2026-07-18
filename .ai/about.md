# .ai/about.md — AI Agent Project Constitution

## 项目概述

- **项目名称**：TodoList SPA（test-repo）
- **仓库**：https://github.com/sensee-arch/test-repo
- **描述**：一个 Web Todo List 单页应用（SPA），使用纯 HTML/CSS/JavaScript 构建，提供任务创建、完成状态切换、过滤查看、本地持久化功能
- **诞生背景**：作为 AI Agent 协作编程的试验场，验证多 Agent 在统一规范下协同完成编码的工作流程
- **不涉及范围**：用户认证、后端服务、数据库、API 接口、分页、标签分类、CI/CD

## 核心目标

- ✅ 完整的 CRUD 功能：创建、读取、更新、删除待办事项
- ✅ 完成状态切换和视觉反馈（删除线、透明度变化）
- ✅ 按全部/活跃/已完成三种视图过滤
- ✅ 数据通过浏览器 localStorage 持久化，刷新不丢失
- ✅ 零外部依赖，单文件部署，打开即用
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知

## 技术架构

### 架构风格
单体 SPA，三文件分离结构：

```
test-repo/
├── index.html        # 入口页面（58行）— 结构模板
├── styles.css        # 样式表（355行）— CSS 变量主题 + 布局 + 响应式
├── app.js            # 逻辑层（310行）— TodoStore 模型 + App 控制器 + 视图渲染
├── .ai/about.md      # 本文件 — AI Agent 宪法
├── ARCH.md           # 全局架构文档
├── requirements.txt  # Python 依赖（实验项目专用）
├── requirements-dev.txt
├── LICENSE           # MIT License
└── docs/adr/         # 架构决策记录
```

### 核心组件分层
| 层 | 文件 | 职责 |
|----|------|------|
| View（视图层） | `index.html` + `styles.css` | DOM 结构和视觉样式，CSS 变量主题，响应式布局 |
| Controller（控制层） | `app.js` — `class App` | 事件绑定、路由过滤、DOM 操作 |
| Model（数据层） | `app.js` — `class TodoStore` | localStorage 读写封装 |

### 数据流
```
用户交互 → DOM Event → App.handleAction() → TodoStore.add/update/delete() → App.render()
```

### 通信方式
- 函数内部同步调用，无网络通信
- 无第三方库依赖（零 npm/外部 CDN）

## 基础契约

### 数据格式
```json
{
  "id": 1720000000000,
  "text": "Buy groceries",
  "completed": false
}
```
- `id`：`number`，由 `Date.now() + 随机数` 生成
- `text`：`string`，用户输入文本（trimmed）
- `completed`：`boolean`

### 存储
- localStorage key：`todolist_tasks`
- 错误降级：读写失败时 `console.warn` 静默降级，不抛异常

### 禁止行为
- 禁止使用 `innerHTML` 渲染用户输入内容（必须用 `textContent` 或 DOM API）
- 禁止 `eval()` 或 `new Function()`
- 禁止修改待办列表容器之外的 DOM
- 禁止引入外部依赖/CDN

### API 签名（关键函数）
| 函数 | 参数 | 返回 |
|------|------|------|
| `TodoStore.add(text)` | `text: string` | `Array` 更新后的任务列表 |
| `TodoStore.toggle(id)` | `id: number` | 无 |
| `TodoStore.remove(id)` | `id: number` | 无 |
| `TodoStore.edit(id, newText)` | `id, newText` | 无 |
| `App.render(filter)` | `filter?: string` | 无（更新 DOM） |

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

- **运行环境**：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90、Safari ≥ 15）
- **启动方式**：直接在浏览器中打开 `index.html`（根目录）
- **本地开发**：只需文本编辑器 + Git 客户端
- **无需**：Node.js、Python、Docker、包管理器、构建工具、Web 服务器
- **分支命名**：`flyinghub-YYYYMMDDHHmmss`

## 协作规则

- **日志规范**：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误，包含 Reasoning / Decision / Action / Observation / Reflection 五个部分
- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档
- **上下文隔离**：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享或继承状态
- **禁止**：未经验证就假设全局状态或历史记忆；Agent 每次启动以当前 prompt 为准，不参考历史会话
- **输出格式**：最终输出为 JSON 对象，包含 `content`（群聊摘要）、`status`（done/failed）、`action_trace`（Base64 执行轨迹）

## 演进原则

- **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract 再编码
- **模块边界**：新能力优先通过新增模块实现，不破坏现有模块边界
- **ADR 记录**：所有架构决策记录于 `docs/adr/` 目录
- **回滚友好**：每次功能变更独立分支，PR 合并，保持 main 始终可部署
