# .ai/about.md — AI Agent Project Constitution

## 项目概述

- **项目名称**：test_repo
- **仓库地址**：https://github.com/sensee-arch/test-repo
- **定位**：实验性/测试项目，作为 AI Agent 协作编程的试验场。当前实现了一个 Todo List Web 单页应用（SPA），使用纯 HTML/CSS/JavaScript 构建，零外部依赖。
- **目标用户**：AI Agent 团队成员 + 测试人员
- **解决问题**：提供一个标准的 AI Agent 协作编程沙箱，用于验证需求→方案→任务→开发→审核的完整工作流

## 核心目标

### 已完成 ✅
- Todo List Web 单页应用（SPA）：创建、读取、更新、删除待办事项
- 完成状态切换与视觉反馈（删除线、透明度）
- 按全部/活跃/已完成三种视图过滤
- 浏览器 localStorage 数据持久化
- 零外部依赖，单文件部署，打开即用

### 规划中 ⏳
- Python + FastAPI 后端 API
- SQLite/PostgreSQL 数据库集成
- 自动化测试与 CI/CD
- Agent 标准化协作模板沉淀

### 非目标 ❌
- 不追求多端同步或实时协作
- 不追求 PWA/离线能力或推送通知
- 不覆盖用户认证系统

## 技术架构

### 当前架构（Todo SPA）
- **架构风格**：单体 SPA，三层模块化设计
- **技术栈**：HTML5 + CSS3 + Vanilla JavaScript ES6+ + localStorage API
- **核心模块**：
  - **Store**（数据层）：管理 state.todos[] 和 state.filter，提供 CRUD + 持久化方法
  - **Renderer**（视图层）：从 Store 读取数据，使用 document.createElement 构建 DOM
  - **EventHandler**（控制层）：绑定 DOMContentLoaded 事件，事件委托处理所有用户交互
- **通信方式**：模块间函数调用（同步），无网络通信
- **部署方式**：直接浏览器打开 `src/web/todo/index.html`

### 规划架构（未来）
- **API Layer**：FastAPI RESTful API
- **Database Layer**：SQLite / PostgreSQL + SQLAlchemy
- **Service Layer**：业务逻辑抽象

## 基础契约

### 数据格式
- 每个待办项为 JSON 对象：`{ id: string, title: string, completed: boolean, createdAt: number }`
- ID 生成：`Date.now().toString(36) + Math.random().toString(36).slice(2,6)`
- localStorage 键名：`todo_items`
- 过滤器状态：仅内存存储（刷新重置为 `all`），不持久化

### 安全约束
- ❌ 禁止使用 `innerHTML` 渲染用户输入内容
- ❌ 禁止 `eval()` 或 `new Function()`
- ❌ 禁止修改待办列表容器之外的 DOM
- ✅ 所有用户文本通过 `textContent` + `createElement` 渲染

### 错误处理
- localStorage 写失败时静默降级（try/catch），不抛出异常
- localStorage 读失败（损坏数据）时重置为空数组
- 空标题/超长标题（>500字符）直接拒绝，不调用 Store

## Agent 划分

| 名称 | 职责 | 关键产出 |
|------|------|----------|
| 🤖 **Host** | 群聊主持人，发送欢迎/状态广播 | 群聊消息 |
| 📋 **Manager** | 需求分析、方案设计、契约制定 | Spec / Plan / Contract |
| 💻 **Developer** | 编码实现、提交代码 | 代码提交 + Commit |
| 👀 **Reviewer** | 代码审查、AC 验证 | Review 报告 |
| 🔧 **Ops** | 环境配置、依赖安装、CI/CD | 环境报告 |

## 运行与依赖

### 运行环境
- 当前 Todo SPA：现代浏览器（Chrome ≥ 90, Firefox ≥ 90, Edge ≥ 90）
- 未来后端：Python 3.11+

### 依赖文件
- `requirements.txt`：FastAPI, Uvicorn, Pydantic
- `requirements-dev.txt`：pytest, ruff, httpx

### 启动方式
- Todo SPA：浏览器打开 `src/web/todo/index.html`
- 开发工具：文本编辑器 + Git 客户端
- 无需：Node.js、Docker、构建工具

## 协作规则

### 工作流
```
需求描述 → /spec 生成规格 → /plan 分解任务 → /coding 实现 → 审核合并
```

### 分支策略
- `main`：稳定主分支，始终保持可部署
- `flyinghub-YYYYMMDDHHmmss`：每次 Hub 会话的独立特性分支
- 功能开发完成后通过 PR 合并到 main

### 日志规范
- 通过 `action_trace`（Base64 编码 Markdown）记录操作步骤、决策和反思
- 每次请求独立，不依赖历史记忆

### 契约优先
- 编码前必须先完成 Spec → Plan → Contract 文档
- 每个 Hub 独立维护分支和文档，不跨 Hub 共享状态
- 禁止未经验证就假设全局状态或历史记忆

## 演进原则

1. **契约优先于实现** — 任何新功能必须先完成 Spec 和 Contract 再编码
2. **模块化演进** — 新能力优先通过新增模块实现，不破坏现有模块边界
3. **简单优先** — 不做过度设计，够用就好
4. **可替换性** — 组件间通过接口解耦，便于替换
5. **测试驱动** — 核心逻辑必须可测试
6. **文档同步** — 架构变更时同步更新 ARCH.md 和本文件
7. **ADR 记录** — 重大决策记录在本文件下（待补充具体位置）
