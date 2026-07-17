# .ai/about.md — AI Agent Project Constitution

## 项目概述

- **项目名称**: test-repo
- **仓库地址**: https://github.com/sensee-arch/test-repo
- **项目定位**: 实验性/测试项目，作为 AI Agent 协作编程的试验场与工作流验证平台
- **核心价值**: 在统一的架构规范下，让多个 AI Agent 通过 Git 仓库协作，完成从需求分析到代码审核的完整开发流程
- **当前阶段**: 基础设施搭建与协作规范确立阶段，尚未进入具体功能开发

## 核心目标

- ✅ 验证和演练 AI Agent 协作编程工作流（需求 → 方案 → 任务 → 开发 → 审核）
- ✅ 建立标准化的 AI 项目协作流程与文档规范
- ✅ 沉淀可复用的协作模板（需求规格、技术方案、任务分解）
- ✅ 可选技术栈的快速原型验证
- ✅ 记录 AI 辅助开发的实践经验与最佳实践
- ❌ 不追求生产级部署或用户交付
- ❌ 不追求完整的产品闭环或商业价值

## 技术架构

- **架构风格**: 模块化单体服务（视具体需求可选扩展为微服务）
- **技术栈基线**:
  - 编程语言: Python 3.11+
  - Web 框架: FastAPI（备选: Flask / Express）
  - 数据库: SQLite（开发）/ PostgreSQL（生产）
  - API 风格: RESTful API（备选: GraphQL）
  - 测试框架: pytest + pytest-cov
  - 代码格式: ruff
  - CI/CD: GitHub Actions
- **通信方式**: REST API 请求/响应模式
- **核心组件（规划中）**:
  - `src/core/` — 核心业务逻辑
  - `src/api/` — API 接口层
  - `src/models/` — 数据模型
  - `src/services/` — 服务层
  - `src/utils/` — 工具函数
- **技术选型原则**: 简单优先 | 组件解耦可替换 | 核心逻辑可测试

## 基础契约

- **数据模型**: 所有核心实体使用 Pydantic 模型定义，确保类型安全和序列化一致性
- **API 规范**: 遵循 RESTful 设计，请求/响应使用 JSON 格式，错误响应统一结构
- **错误处理**: API 层统一异常捕获，返回结构化错误响应；业务层通过异常传递错误
- **日志规范**: 使用标准 logging 模块，日志级别区分清晰（DEBUG / INFO / WARNING / ERROR）
- **禁止行为**: `eval()` / `exec()` / `pickle` 不可控反序列化 / 硬编码凭证 / 未转义的 SQL 拼接
- **测试要求**: 核心逻辑必须可测试，单元测试覆盖率不低于 80%

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

- **运行时**: Python 3.11+ 环境
- **依赖安装**:
  ```bash
  pip install -r requirements.txt         # 生产依赖
  pip install -r requirements-dev.txt     # 开发依赖
  ```
- **环境配置**: 通过 `.env.example` 定义环境变量模板，实际配置通过 `.env` 注入
- **虚拟环境**: 推荐使用 `python -m venv .venv` 隔离项目依赖
- **无需**: Docker、Node.js、外部中间件（开发阶段）

### 当前依赖清单

**生产依赖**: fastapi>=0.104.0, uvicorn[standard]>=0.24.0, pydantic>=2.5.0

**开发依赖**: pytest>=7.4.0, pytest-cov>=4.1.0, ruff>=0.1.0, httpx>=0.25.0

## 协作规则

- **工作流程**: 需求描述 → /spec 生成需求规格 → /plan 分解任务 → 开发实现 → 审核合并
- **契约优先**: 编码前必须先完成 Spec → Plan → Contract 文档
- **工作文件**: 按分支组织在 `.agent/YYYYMMDDHH-<feature>/` 目录下，包含 plan.md 和 task-NNN.md
- **分支策略**: `main` 为稳定分支，功能分支按 `flyinghub-YYYYMMDDHHmmss` 格式命名
- **提交规范**: `<type>: <简短描述>`，类型包括 feat / fix / docs / refactor / test / chore / style
- **代码评审**: 所有 PR 应包含清晰变更描述和测试覆盖；关键逻辑变更需至少一个 Agent 审核
- **目录结构**:
  ```
  test-repo/
  ├── .agent/              # AI Agent 工作文件
  ├── .ai/                 # AI Agent 文档（about.md, workspace.md）
  ├── src/                 # 源代码
  │   ├── core/            # 核心业务逻辑
  │   ├── api/             # API 接口层
  │   ├── models/          # 数据模型
  │   ├── services/        # 服务层
  │   └── utils/           # 工具函数
  ├── tests/               # 测试代码
  ├── docs/                # 文档
  ├── scripts/             # 辅助脚本
  └── ARCH.md              # 架构文档
  ```
- **日志规范**: 操作步骤和错误通过 `action_log`（Base64 编码 JSON）记录
- **上下文隔离**: 每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态

## 演进原则

- **契约优先于实现**: 任何新功能必须先完成 Spec 和 Contract 再编码
- **渐进增强**: 新能力优先通过新增模块实现，不破坏现有模块边界
- **简单优先**: 不做过度设计，够用就好，避免过早抽象
- **可替换性**: 组件间通过接口解耦，便于技术选型调整
- **可观测性**: 所有变更和决策必须记录，便于后期追溯
- **ADR 记录**: 架构决策记录（ADR）保存在 `docs/adr/` 目录
- **持续沉淀**: 每次协作实践结束后，复盘并更新协作规范和文档模板
