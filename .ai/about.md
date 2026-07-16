# .ai/about.md — AI Agent Project Constitution

> 更新日期: 2026-07-16 18:16:53
> 仓库: https://github.com/sensee-arch/test-repo

## 项目概述

- **项目名**: test_repo — 实验性/测试项目，旨在为 AI Agent 协作编程提供试验场
- **核心定位**: 以 Git 仓库协作方式，让多个 AI Agent 在统一架构规范下协同工作
- **当前范围**: 已实现一个 Web Todo List 单页应用（SPA），使用纯 HTML/CSS/JavaScript 构建，数据通过浏览器 localStorage 持久化
- **规划范围**: 后续可扩展 Python/FastAPI 后端，提供 RESTful API 支持

## 核心目标

- ✅ 演练 AI Agent 协作编程工作流（需求 → 方案 → 任务 → 开发 → 审核）
- ✅ Todo SPA：完整 CRUD（创建/读取/更新/删除待办事项），完成状态切换，三种视图过滤（全部/活跃/已完成）
- ✅ 数据通过浏览器 localStorage 持久化，刷新不丢失，零外部依赖，单文件部署
- ⏳ Python/FastAPI 后端：RESTful API，SQLite/PostgreSQL 持久化
- ❌ 不追求后端同步、多端协同、PWA/离线能力或推送通知

## 技术架构

- **当前 (Todo SPA)**: 单体 SPA — HTML5 + CSS3 + Vanilla JavaScript ES6+
  - 三层架构：Store（状态管理 + localStorage 持久化）→ Renderer（DOM 渲染）→ EventHandler（事件绑定与编排）
  - 通信方式：函数内部同步调用，无网络通信
- **规划 (FastAPI 后端)**: Python 3.11+ / FastAPI / SQLite（开发）/ PostgreSQL（生产）
  - RESTful API，pytest 测试，Ruff 代码格式化
- **存储**: 当前使用 localStorage，键名 `todo_items`，值为 JSON 对象数组序列

## 基础契约

- 数据格式：TodoItem — `id`（string）、`title`（string）、`completed`（boolean）、`createdAt`（number 时间戳）
- 错误语义：localStorage 操作失败时静默降级（console.warn），不抛出异常
- 禁止行为：禁止使用 `innerHTML` 渲染用户输入内容；禁止 `eval()` 或 `new Function()`
- 配置：所有文件名、目录结构、环境变量约定以本文件为准

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

- **运行环境**: 现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90）
- **启动方式**: 直接浏览器打开 `src/web/todo/index.html`
- **本地开发**: 文本编辑器 + Git 客户端
- **依赖文件**: `requirements.txt`（FastAPI/Uvicorn/Pydantic — 后端规划），`requirements-dev.txt`（pytest/ruff/httpx）
- **无需**: Node.js、Docker、构建工具（当前阶段）

## 协作规则

- 日志规范：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误
- 契约优先：编码前必须先完成 Spec → Plan → Task 文档
- 分支规范：每个独立请求使用 `flyinghub-YYYYMMDDHHmmss` 格式创建特性分支
- 权限：已授权 `wangxi0618` 为 collaborator（write 权限）
- 禁止：未经验证就假设全局状态或历史记忆

## 演进原则

- 契约优先于实现：任何新功能必须先完成 Spec 和 Plan 再编码
- 新能力优先通过新增模块实现，不破坏现有模块边界
- 探索可复用的 AI Agent 协作模板和规范
- 记录和沉淀 AI 辅助开发的实践经验
