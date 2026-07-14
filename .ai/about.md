# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目是一个 Web Todo List 单页应用（SPA），使用纯 HTML/CSS/JavaScript 构建
- 目标是在真实 Git 仓库上验证多 AI Agent（主持人、管理者、开发者、审查者）协同编码工作流的可行性
- 不涉及：用户认证、后端服务、数据库、自动化测试、CI/CD、部署上线

## 核心目标

- ❌ 不涉及用户认证或权限系统
- ❌ 不涉及后端服务或数据库
- ❌ 不涉及自动化测试或 CI/CD 管道
- ❌ 不涉及部署上线或运维

## 技术架构

### 架构风格
- 单体 SPA（Single-Page Application），所有代码在同一 HTML 文件中
- 单向数据流：用户操作 → 状态变更 → 持久化 → 重新渲染

### 核心组件
| 组件 | 职责 |
|------|------|
| HTML 骨架 | 语义化结构：header、输入区、列表区、底部栏、空状态提示 |
| CSS 样式 | Flexbox 布局、响应式设计、过渡动画、焦点/悬停状态 |
| JavaScript 引擎 | 数据模型、状态管理、渲染函数、事件处理 |

### 通信方式
- 不涉及网络通信
- 数据流：localStorage（持久化）+ JavaScript 内存状态（运行时）

### 技术栈
- 语言：HTML5 + CSS3 + ES6+ JavaScript
- 存储：浏览器 localStorage API
- 依赖：零外部依赖（无 npm/pip/CDN）

## 基础契约

### 数据格式

```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

- 存储键名：`todo_items`，值为 JSON 数组
- 错误处理：localStorage 读写失败时静默降级（`console.warn`），返回空数组 `[]`
- 禁止使用 `innerHTML` 渲染用户内容（XSS 防护）
- 禁止使用 `eval()` 或 `new Function()`

### 函数接口

| 函数 | 签名 | 说明 |
|------|------|------|
| `loadTodos()` | `() → TodoItem[]` | 从 localStorage 读取并反序列化 |
| `saveTodos(items)` | `(TodoItem[]) → void` | 序列化并写入 localStorage |
| `addTodo(title)` | `(string) → TodoItem` | 创建新待办项 |
| `toggleTodo(id)` | `(string) → void` | 切换完成状态 |
| `editTodo(id, title)` | `(string, string) → void` | 更新标题 |
| `deleteTodo(id)` | `(string) → void` | 删除待办项 |
| `clearCompleted()` | `() → void` | 清除所有已完成项 |
| `getFilteredTodos()` | `() → TodoItem[]` | 返回按当前过滤器筛选的结果 |
| `render()` | `() → void` | 重建整个 DOM |
| `commitEdit(input, id, originalTitle)` | `(HTMLElement, string, string) → void` | 处理内联编辑提交 |

## Agent 划分

| 名称 | 职责 | 输入 | 输出 |
|------|------|------|------|
| Host | 群聊主持人，分派任务、协调进度 | 用户指令 | 群聊消息、任务分派 |
| Manager | 制定计划、编写合约、管理进度 | Spec + 需求 | Plan + Contract |
| Developer | 编码实现具体 Task | Task 文档 + Contract | 可运行的代码提交 |
| Reviewer | 审查代码、验证 AC、提交 Review 报告 | 代码 + Spec + Contract | Review 报告 |

## 运行与依赖

- 运行环境：Chrome ≥ 90 / Firefox ≥ 90 / Edge ≥ 90
- 启动方式：直接在浏览器中打开 `src/web/todo/index.html`
- 本地开发：无需构建工具，修改后刷新浏览器即可
- 依赖：零依赖，仅需标准 Web 浏览器
- 工作区：`~/.openclaw/workspace/test-repo`

## 协作规则

- 日志规范：`action_log` 必须 Base64 编码 JSON，包含执行的命令、错误详情、修复尝试
- 消息格式：群聊消息使用阶段标签前缀（🚀 [Boot]、📋 [Spec]、📋 [Plan]、📝 [Contract]、🔧 [Setup]、💻 [Coding]、👀 [Review]、📊 [Summary]）
- 修改契约前提：必须经过 Spec → Plan → Contract 流程确认
- 禁止未经验证就假设全局状态：每次操作前必须确认当前分支和文件状态
- Git 提交规范：`<type>: <description>` — feat/fix/style/refactor/docs/chore

## 演进原则

- 契约优先于实现：先定义接口，再编写代码
- 新能力优先通过新增函数/模块实现，不破坏现有接口
- ADR 记录位置：`docs/adr/`（待补充）
