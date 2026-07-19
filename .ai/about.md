# .ai/about.md — AI Agent Project Constitution

> 项目: test-repo | 仓库: https://github.com/sensee-arch/test-repo
> 更新日期: 2026-07-19 | 分支: feat/task-6-todo-app

---

## 1. Project Overview

test-repo 是一个实验性/测试项目，为多个 AI Agent 在统一架构规范下协同编程提供试验场。项目以 git 仓库协作的方式运行，验证 AI Agent 协作编程工作流，探索可复用的协作模板和规范。

当前代码库包含：
- ToDo List Web 应用（纯前端 HTML/CSS/JS）
- MVC 架构：Model (js/model.js)、View (js/view.js)、Controller (js/app.js)
- 响应式 CSS + 暗色模式支持
- 架构文档（ARCH.md）
- AI Agent 项目宪章（.ai/about.md）

---

## 2. Core Objectives

- ✅ **协作工作流验证** — 演练 AI Agent 从需求到交付的完整协作流程
- ✅ **契约驱动开发** — 编码前先完成 Spec → Plan → Contract 文档
- ✅ **架构决策记录** — 通过 ADR 沉淀每个关键决策的上下文和理由
- ✅ **多 Agent 分工** — Manager / Developer / Reviewer 角色各司其职
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知

---

## 3. Technical Architecture

- **架构风格**：MVC 单体应用（Model / View / Controller 分离）
- **推荐技术栈**：纯前端 HTML5 / CSS3 / JavaScript (ES6+)，零构建工具
- **项目骨架**：`.ai/`（Agent 宪章）、`index.html`（入口）、`css/`（样式）、`js/`（脚本）
- **数据持久化**：浏览器 localStorage（key: `todolist_data`）
- **通信方式**：通过 Git 分支 + Pull Request 进行异步协作
- **零外部服务依赖**：无需 Node.js、Python、数据库服务器

---

## 4. Base Contract

- 数据格式：所有待办项为 JSON 对象，包含 `id`（字符串）、`title`（字符串）、`completed`（布尔）、`createdAt`（ISO 字符串）、`updatedAt`（ISO 字符串）
- 存储键名：`todolist_data`，值为此 JSON 对象数组的序列化字符串
- 错误语义：localStorage 操作失败时静默降级（`console.warn`），不抛出异常
- 禁止行为：禁止使用 `innerHTML` 渲染用户输入；禁止 `eval()` / `new Function()`；禁止跨模块修改 DOM
- 命名规范：类名 `PascalCase`，函数/变量 `camelCase`，私有成员 `_prefix`
- Git 提交规范：`<type>: <描述>` — 类型包括 `feat`、`fix`、`docs`、`refactor`、`test`、`chore`、`style`

### JSON 示例
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2026-07-19T06:00:00.000Z",
  "updatedAt": "2026-07-19T06:00:00.000Z"
}
```

---

## 5. Agent Division

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

---

## 6. Running & Dependencies

- **运行时环境**：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90）
- **启动方式**：直接在浏览器中打开 `index.html`
- **本地开发**：只需文本编辑器 + Git 客户端
- **无需**：Node.js、Python、Docker、包管理器、构建工具

---

## 7. Collaboration Rules

- **日志规范**：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误，包含 Reasoning / Decision / Action / Observation / Reflection 五段
- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档
- **上下文隔离**：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **错误处理**：遇到错误先尝试自动修复（重试、依赖安装、路径修复），3 次失败后 escalate
- **禁止**：未经验证就假设全局状态或历史记忆；停止工作前不尝试任何修复

### 提交类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 |
| `docs` | 文档变更 |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具/配置变更 |
| `style` | 代码格式化 |

---

## 8. Evolution Principles

- **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract 再编码
- **模块化演进**：新能力优先通过新增模块实现，不破坏现有模块边界
- **简单优先**：不做过度设计，够用就好
- **可替换性**：组件间通过接口解耦，便于替换
- **测试驱动**：核心逻辑必须可测试
- **持续沉淀**：定期回顾并更新项目宪章，确保与代码库实际状态一致
