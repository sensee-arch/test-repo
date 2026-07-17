# .ai/about.md — AI Agent Project Constitution

> 更新日期: 2026-07-17
> 仓库: https://github.com/sensee-arch/test-repo
> 工作分支: flyinghub-20260717194844

---

## 1. 项目概述

**test-repo** 是一个 AI Agent 协作编程实验项目，提供标准化的多 Agent 协作工作流试验场。

- 定位：AI Agent 协作编程的实验工场，用于验证和沉淀 Agent 协作最佳实践
- 仓库：https://github.com/sensee-arch/test-repo
- 分支策略：`main` 为稳定主分支，功能分支命名格式 `flyinghub-YYYYMMDDHHmmss`
- 包含子项目：Web Todo List SPA（纯前端演示）、待定子项目

## 2. 核心目标

- ✅ 建立 AI Agent 协作编程的标准工作流（需求 → 方案 → 开发 → 审核）
- ✅ 提供 Agent 协作的模板和规范沉淀（.ai/about.md、ARCH.md）
- ✅ 验证 FastAPI + Python 技术栈的 Agent 协作开发流程
- ✅ 包含可运行的演示子项目（Todo SPA）
- ❌ 不涉及生产部署和运维
- ❌ 不追求高可用和性能优化
- ❌ 不跨项目共享 Agent 状态（每个 Hub 独立管理）

## 3. 技术架构

### 整体架构

```
test-repo/
├── .ai/                  # AI Agent 项目规约（本文件）
├── docs/                 # 项目文档
│   └── adr/             # 架构决策记录
├── src/                  # 子项目源代码（按子项目组织）
├── ARCH.md               # 架构总览文档
├── requirements.txt      # 生产依赖
├── requirements-dev.txt  # 开发依赖
└── README.md             # 项目说明（待补充）
```

### 推荐技术栈

| 层次 | 推荐 | 备选 |
|------|------|------|
| 后端框架 | FastAPI (Python 3.11+) | Flask, Express |
| 数据库 | SQLite / PostgreSQL | MySQL, MongoDB |
| API 风格 | RESTful | GraphQL |
| 测试 | pytest + httpx | unittest |
| 代码规范 | ruff | black, isort |
| CI/CD | GitHub Actions | — |

### 数据流

用户/Agent → 群聊指令 → /spec → /plan → /coding → 代码提交 → 审核 → 合并

## 4. 基础契约

### 文档规范
- `.ai/about.md`: 项目宪法，Agent 理解项目的唯一入口
- `ARCH.md`: 架构总览文档，技术选型和目录约定
- `docs/adr/`: 架构决策记录（ADR），记录关键决策

### 代码规范
- Python: PEP 8 标准，使用 ruff 检查
- 类型注解：所有函数参数和返回值必须标注类型
- 提交格式：`<type>: <描述>`（feat/fix/docs/refactor/test/chore/style）

### 分支策略
- `main`: 稳定主分支，始终可运行
- `flyinghub-YYYYMMDDHHmmss`: 功能开发分支，开发完成合并到 main

### 禁止行为
- 禁止在代码库中存储敏感信息（Token、密码、密钥）
- 禁止使用 `eval()` / `exec()` / `new Function()` 执行动态代码
- 禁止跨 Hub 共享 Agent 上下文或状态

## 5. Agent 划分

| 角色 | 职责 | 输入 | 输出 |
|------|------|------|------|
| Host | 群聊主持人，发送状态广播 | 用户消息 | 群聊消息 |
| Manager | 需求分析、技术方案、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

### 工作流
```
用户需求 → Manager 生成 Spec → Manager 分解 Plan → Developer 编码 → Reviewer 审核 → 合并
```

## 6. 运行与依赖

### 环境要求
- Python 3.11+
- Git 已配置

### 初始化
```bash
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 运行
- 后端开发：`uvicorn src.api.main:app --reload`
- 测试：`pytest --cov=src tests/`
- 代码检查：`ruff check .`

### 无需
- Docker（简化开发环境）
- 外部服务（数据库、缓存、消息队列）

## 7. 协作规则

### 日志规范
- 通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误
- 包含：## Reasoning、## Decision、## Action、## Observation、## Reflection

### 契约优先
- 编码前必须先完成 Spec → Plan → Contract 文档
- Agent 首次进入项目必须先读取 `.ai/about.md`

### 上下文管理
- 每个 Hub 独立维护自己的分支和文档
- 禁止依赖历史记忆或跨 Hub 状态

### 沟通规范
- 消息前缀：`[Boot]`、`[Plan]`、`[Spec]`、`[Coding]`、`[Review]`
- 群聊消息保持信息密集、客观、无冗余

## 8. 演进原则

### 增量演进
- 新功能优先通过新增模块实现，不破坏现有模块边界
- 重大变更需通过 ADR 记录决策过程和备选方案

### 契约驱动
- 任何新功能必须先完成 Spec 和 Contract 再编码
- 架构变更必须同步更新 ARCH.md 和 .ai/about.md

### 可替换性
- 组件间通过接口解耦，降低替换成本
- 技术选型优先考虑生态成熟、文档完善的技术

### 知识沉淀
- 协作过程中发现的最佳实践沉淀到 `.ai/about.md`
- 架构决策记录到 `docs/adr/`
