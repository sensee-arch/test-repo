# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目是 **test-repo**，一个 AI Agent 协作编程的实验性/测试项目
- 仓库：https://github.com/sensee-arch/test-repo
- 提供多 AI Agent 在统一架构规范下协同工作的试验场，验证和沉淀 AI 辅助开发的工作流
- 当前状态：基础设施搭建阶段，尚无完整业务代码
- 许可证：MIT

## 核心目标

- ✅ 验证和演练 AI Agent 协作编程工作流
- ✅ 建立标准化的 AI 项目协作流程（需求 → 方案 → 开发 → 审核）
- ✅ 探索可复用的 AI Agent 协作模板和规范
- ✅ 记录和沉淀 AI 辅助开发的实践经验
- ⏳ 可选的 Web 应用快速原型验证（如 Todo List、API 服务等）
- ❌ 不追求生产级可靠性或大规模部署
- ❌ 不绑定特定技术栈 — 按需灵活选型

## 技术架构

- **架构风格**：按需选型，当前推荐 FastAPI + SQLite/PostgreSQL
- **核心组件**（推荐选型）：
  - Web 框架：FastAPI（Python 3.11+）
  - 数据层：SQLite（开发）/ PostgreSQL（生产）
  - API 风格：RESTful
  - 测试框架：pytest + pytest-cov
  - 代码检查：ruff
- **通信方式**：REST API（HTTP JSON）
- **已安装依赖**：fastapi, uvicorn, pydantic（生产）；pytest, pytest-cov, ruff, httpx（开发）
- **无前端依赖**：目前项目不含前端代码，src/ 和 docs/ 目录为空，等待后续开发填充

## 基础契约

- 数据模型：使用 Pydantic 定义，位于 `src/models/`
- API 层：FastAPI router 模块，位于 `src/api/`
- 配置管理：环境变量 + Pydantic Settings，参考 `.env.example`
- 错误处理：统一异常处理器，返回标准 JSON 错误格式 `{"detail": "..."}`
- 测试覆盖：核心逻辑必须覆盖 pytest 测试，覆盖率 ≥ 80%
- 禁止行为：禁止硬编码密钥/令牌；禁止将凭据提交到版本控制；禁止 `print()` 调试语句（使用 logging）

### 目录结构
```
test-repo/
├── .ai/about.md         # 项目宪法（本文件）
├── ARCH.md              # 架构文档
├── src/                 # 源代码
│   ├── core/           # 核心业务逻辑
│   ├── api/            # API 接口层
│   ├── models/         # 数据模型
│   ├── services/       # 服务层
│   └── utils/          # 工具函数
├── tests/              # 测试代码
│   ├── unit/           # 单元测试
│   └── integration/    # 集成测试
├── docs/               # 文档
├── requirements.txt    # 生产依赖
├── requirements-dev.txt# 开发依赖
├── ARCH.md             # 架构文档
└── LICENSE             # MIT 许可证
```

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户消息 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

- 运行时：Python 3.11+（本地或容器）
- 启动方式：
  ```bash
  cd test-repo
  source venv/bin/activate
  uvicorn src.main:app --reload --port 8000
  ```
- 依赖安装：
  ```bash
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- 代码检查：`ruff check src/`
- 运行测试：`pytest --cov=src/ tests/`

## 协作规则

- 日志规范：通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
- 契约优先：编码前必须先完成 Spec → Plan → Contract 文档
- 工作文件：`.agent/YYYYMMDDHH-<feature>/` 目录管理任务分解
- 分支命名：`flyinghub-YYYYMMDDHHmmss` 格式，基于 main 创建
- 提交规范：`<type>: <描述>`，类型为 feat/fix/docs/refactor/test/chore/style
- 上下文传递：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- 禁止：未经验证就假设全局状态或历史记忆

## 演进原则

- 简单优先 — 不做过度设计，够用就好
- 可替换性 — 组件间通过接口解耦，便于替换
- 测试驱动 — 核心逻辑必须可测试
- 新能力优先通过新增模块实现，不破坏现有模块边界
- 核心流程：需求 → /spec → /plan → /coding → review → merge
