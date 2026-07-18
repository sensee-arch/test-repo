# .ai/about.md — AI Agent Project Constitution

> 项目: test-repo | 仓库: https://github.com/sensee-arch/test-repo
> 更新日期: 2026-07-18 | 分支: flyinghub-20260718181454

---

## 1. Project Overview

test-repo 是一个实验性/测试项目，为多个 AI Agent 在统一架构规范下协同编程提供试验场。项目以 git 仓库协作的方式运行，验证 AI Agent 协作编程工作流，探索可复用的协作模板和规范。

当前代码库包含：
- FastAPI 项目骨架（requirements.txt 依赖 Python）
- 架构文档（ARCH.md）
- AI Agent 项目宪章（.ai/about.md）
- 架构决策记录（docs/adr/）

---

## 2. Core Objectives

- ✅ **协作工作流验证** — 演练 AI Agent 从需求到交付的完整协作流程
- ✅ **契约驱动开发** — 编码前先完成 Spec → Plan → Contract 文档
- ✅ **架构决策记录** — 通过 ADR 沉淀每个关键决策的上下文和理由
- ✅ **多 Agent 分工** — Manager / Developer / Reviewer 角色各司其职
- ❌ 不追求后端同步或多端协同
- ❌ 不追求生产级部署或高可用

---

## 3. Technical Architecture

- **架构风格**：模块化单体应用，面向扩展预留接口层
- **推荐技术栈**：Python 3.11+ / FastAPI / SQLite / pytest
- **项目骨架**：`.ai/`（Agent 宪章）、`docs/adr/`（架构决策）、`ARCH.md`（架构文档）
- **依赖管理**：`requirements.txt`（生产依赖）+ `requirements-dev.txt`（开发依赖）
- **通信方式**：通过 Git 分支 + Pull Request 进行异步协作
- **零外部服务依赖**：无需数据库服务器、消息队列、容器编排

---

## 4. Base Contract

- 数据格式：遵循 ARCH.md 定义的数据模型规范
- 错误语义：localStorage 操作失败时静默降级（`console.warn`），不抛出异常
- 禁止行为：禁止使用 `innerHTML` 渲染用户输入；禁止 `eval()` / `new Function()`；禁止跨模块修改 DOM
- 命名规范：类名 `PascalCase`，函数/变量 `snake_case`，常量 `UPPER_SNAKE_CASE`，私有成员 `_prefix`
- 类型注解：所有函数参数和返回值需加类型注解
- Git 提交规范：`<type>: <描述>` — 类型包括 `feat`、`fix`、`docs`、`refactor`、`test`、`chore`、`style`

---

## 5. Agent Division

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

### 协作工作流

```
需求描述 → /spec 生成需求规格 → /plan 分解任务 → /assign 分配任务 → 开发实现 → 审核合并
```

---

## 6. Running & Dependencies

- **运行时环境**：Python 3.11+
- **启动方式**：`uvicorn app:app --reload`（FastAPI 应用）
- **依赖安装**：
  ```bash
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- **代码检查**：`ruff check .`
- **运行测试**：`pytest --cov`
- **无需**：Docker、Node.js、外部数据库、容器编排

---

## 7. Collaboration Rules

- **日志规范**：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误，包含 Reasoning / Decision / Action / Observation / Reflection 五段
- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档
- **上下文隔离**：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **错误处理**：遇到错误先尝试自动修复（重试、依赖安装、路径修复），3 次失败后 escalate
- **禁止**：未经验证就假设全局状态或历史记忆；停止工作前不尝试任何修复

### 分支策略

- `main` — 稳定主分支，始终保持可部署状态
- `flyinghub-YYYYMMDDHHmmss` — 功能开发分支
- 功能开发完成后合并到 `main`

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
- **决策可追溯**：所有架构决策通过 ADR 记录（`docs/adr/`），写明上下文、选项和理由
- **简单优先**：不做过度设计，够用就好
- **可替换性**：组件间通过接口解耦，便于替换
- **测试驱动**：核心逻辑必须可测试
- **持续沉淀**：定期回顾并更新项目宪章，确保与代码库实际状态一致
