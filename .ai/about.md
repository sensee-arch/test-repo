# .ai/about.md — AI Agent Project Constitution

> 生成时间: 2026-07-16 18:41:17
> 仓库: https://github.com/sensee-arch/test-repo

## 项目概述
- **项目名称**: test_repo — 测试仓库，用于 AI Agent 协作编程的试验场
- **技术定位**: 包含一个 Todo List Web 应用（SPA）和计划中的 FastAPI 后端
- **协作方式**: 多个 AI Agent 在 Git 仓库中协同工作

## 核心目标
- 🔵 构建一个可用的 Todo List Web 应用（纯前端 HTML/CSS/JS + localStorage）
- 🔵 建立标准化的 AI Agent 协作流水线：需求、设计、实现、审查
- 🔵 保持项目结构清晰、文档完备，降低新 Agent 入场成本

## 技术架构
### 前端 (Todo SPA)
- 架构模式: TodoMVC 三层架构（Store / Renderer / EventHandler）
  - Store: 状态管理 + localStorage 持久化
  - Renderer: DOM 渲染与视图更新
  - EventHandler: 事件绑定与编排
- 数据存储: 浏览器 localStorage，键名 `todo_items`
- 渲染方式: 纯 DOM API，无框架依赖

### 后端 (计划中 — FastAPI)
- Python 3.11+ / FastAPI / SQLite（开发）/ PostgreSQL（生产）
- RESTful API，pytest 测试，Ruff 代码检查

## 基础契约
- 数据模型: `TodoItem { id, title: string, completed: boolean, createdAt: number }`
- 持久化: localStorage `todo_items` -> JSON.stringify/parse，try/catch 容错
- 安全规则: 禁止 innerHTML/eval/new Function，输入必须 trim，过滤标签长度限制 500 字符

## Agent 分工
| 角色 | 职责 | 输出 | 交付物 |
|------|------|------|--------|
| Host | 群聊主持、任务分发、状态广播 | 消息 | 群聊 |
| Manager | 需求分析、项目管理、任务分配 | Spec + Plan + Contract | 文档 |
| Developer | 编码实现、重构优化 | Task 交付 | 代码 |
| Reviewer | 代码审查、AC 验证 | 审查意见 | Review 结果 |

## 运行与依赖
- **浏览器访问**: Chrome >= 90、Firefox >= 90、Edge >= 90
- **打开方式**: 浏览器打开 `src/web/todo/index.html`
- **构建工具**: 零构建依赖，纯静态文件
- **后端依赖**（计划中）: `requirements.txt`（FastAPI/Uvicorn/Pydantic），`requirements-dev.txt`（pytest/ruff/httpx）
- **无需**: Node.js、Docker、数据库（当前阶段）

## 协作规则
- 每次更新需记录 `action_trace`（Base64 编码 Markdown），便于审计追溯
- 流水线流程: Spec -> Plan -> Task 文档 -> 编码 -> Review
- 分支策略: 使用 `flyinghub-YYYYMMDDHHmmss` 格式分支名，每轮独立分支
- 授权用户: `wangxi0618` 为 collaborator（write 权限）
- 调试: 利用浏览器 DevTools 进行前端调试

## 演进原则
- 优先实现 Todo SPA，再推进 FastAPI 后端
- 需求变更先更新 Spec 和 Plan 后再编码
- 保持分支与主线的同步，不在分支上积累未推送提交
- 关注 Agent 协作效率，持续优化流程文档