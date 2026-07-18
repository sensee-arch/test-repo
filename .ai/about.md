# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目（test-repo）是一个 AI Agent 协作编程的**实验性/测试项目**，提供灵活的多 Agent 协作工作流试验场
- 解决的核心问题：验证和演练 AI Agent 协作编程的标准流程（需求 → 方案 → 开发 → 审核）
- 技术栈为 Python 3.10+ / FastAPI，依赖管理使用 pip + requirements.txt
- 当前状态：项目骨架已初始化，具备 ARCH 架构文档、Python 虚拟环境、基础依赖（FastAPI, uvicorn, pydantic）
- 本项目不涉及：前端 UI 框架、数据库生产部署、用户认证、CI/CD 流水线

## 核心目标

- ✅ 建立标准化的 AI Agent 协作流程（需求规格 → 技术方案 → 任务分解 → 编码实现 → 代码审查）
- ✅ 沉淀可复用的协作模板和规范文档
- ✅ 提供可选技术栈的快速原型和功能验证能力
- ✅ 维护清晰的架构文档（ARCH.md）和 Agent 工作文件（.ai/）
- ✅ 使用 ADR（架构决策记录）追踪关键技术决策
- ❌ 不追求生产级部署或高可用性
- ❌ 不涉及多端协同或外部服务集成
- ❌ 不预设具体业务功能，以验证性开发为主

## 技术架构

- **架构风格**：模块化单体（Modular Monolith），预留分层扩展接口
- **编程语言**：Python 3.10+
- **Web 框架**：FastAPI（RESTful API）
- **数据层**：Pydantic 模型定义，备选 SQLite / PostgreSQL
- **核心模块**（规划中）：
  - `src/core/` — 核心业务逻辑
  - `src/api/` — API 接口层
  - `src/models/` — 数据模型
  - `src/services/` — 服务层
  - `src/utils/` — 工具函数
- **依赖清单**：见 `requirements.txt`（FastAPI, uvicorn, pydantic）
- **开发依赖**：见 `requirements-dev.txt`（pytest, ruff 等）
- **通信方式**：HTTP REST API，内部函数调用（同步）

## 基础契约

- 代码规范：遵循 PEP 8，使用 `ruff` 进行代码检查
- 命名规范：类名 `PascalCase`，函数/变量 `snake_case`，常量 `UPPER_SNAKE_CASE`
- 类型注解：所有函数参数和返回值需加类型注解
- Git 提交规范：`<type>: <描述>`（type: feat/fix/docs/refactor/test/chore/style）
- 分支策略：`main` 为稳定分支，功能开发使用 `flyinghub-YYYYMMDDHHmmss` 格式命名
- 禁止行为：禁止使用 `eval()` / `exec()` 动态执行不受信代码；禁止硬编码密钥/Token；禁止在提交中包含 `.venv/` 或 `__pycache__/`
- 错误语义：API 层统一返回结构化 JSON 错误响应；内部异常记录到 `action_trace` 但不中断顶层流程

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送状态广播 / 接收用户请求 | 用户消息 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract 文档 |
| Developer | 编码实现、单元测试、代码提交 | Task 描述 + Contract | 代码 PR |
| Reviewer | 代码审查、AC 验收、合规检查 | PR + 代码文件 | Review 报告 |

## 运行与依赖

- 运行环境：Python 3.10+，现代 Linux/macOS/Windows
- 虚拟环境：`.venv/`（已创建），激活后安装依赖
  ```bash
  source .venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- 启动方式（FastAPI 开发服务器）：
  ```bash
  uvicorn src.api.main:app --reload --port 8000
  ```
- 测试运行：`pytest tests/ -v`
- 代码检查：`ruff check .`
- 无需：Docker、Node.js、数据库服务（开发环境）

## 协作规则

- 日志规范：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤、决策和错误
- 契约优先：编码前必须先完成 Spec → Contract 文档的编写和确认
- 上下文隔离：每个 Hub 独立维护分支和文档，不跨 Hub 共享状态或假设历史记忆
- 架构文档优先于代码：任何架构变更必须先更新 ARCH.md 或 ADR，再修改代码
- 分支独立：功能分支从 main 创建，开发完成后通过 PR 合入 main
- 禁止：未经验证就假设全局状态、使用 `python3 -c` 内联执行 Python 代码

## 演进原则

- 契约优先于实现：新功能先完成 Spec 和 Contract，经确认后再编码
- 新能力优先通过新增模块实现，不破坏现有模块边界
- ADR 位置：`docs/adr/`（按 `NNNN-title.md` 编号命名）
- 所有重要技术决策（技术选型、接口变更、架构调整）必须记录为 ADR
- 测试覆盖核心逻辑，保持至少 80% 的单元测试覆盖率
