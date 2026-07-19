# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目（test-repo）是一个 **AI Agent 协作编程试验场**，以 Git 仓库为协作媒介，为多个 AI Agent 提供统一架构规范下的协同开发环境
- 核心使命：验证、演练并沉淀 AI Agent 协作编程的工作流与方法论
- 当前状态：骨架阶段（src/ 目录已初始化，待功能开发启动）
- 本项目不涉及：生产级部署、用户数据存储、外部 API 集成、多租户架构

## 核心目标

- ✅ 建立标准化 AI Agent 协作流程：需求分析 → Spec 生成 → 任务分解 → 开发实现 → 代码审查 → 合并
- ✅ 沉淀可复用的协作模板与规范（Spec / Plan / Contract / Task / Review）
- ✅ 验证多种技术栈下的快速原型能力（当前选择 Python/FastAPI）
- ✅ 记录 AI 辅助开发的实践经验与决策记录（ADR）
- ❌ 不追求完整的产品级功能
- ❌ 不依赖固定的 Agent 数量或角色配置
- ❌ 不保证跨 Hub 的状态一致性

## 技术架构

- **架构风格**：模块化单体应用（Modular Monolith），未来可根据需要拆分微服务
- **推荐技术栈**：
  - 语言：Python 3.10+
  - Web 框架：FastAPI
  - 数据校验：Pydantic v2
  - 运行服务器：Uvicorn
  - 测试框架：pytest
  - 代码风格：Ruff（PEP 8）
- **核心组件**（规划）：
  - `src/core/` — 业务核心逻辑
  - `src/api/` — RESTful API 接口层
  - `src/models/` — Pydantic 数据模型
  - `src/services/` — 服务层
- **通信方式**：RESTful API（JSON），无异步消息队列
- **数据持久化**：SQLite（开发）/ PostgreSQL（生产，规划）

## 基础契约

- **数据格式**：API 请求/响应统一使用 JSON，遵循 Pydantic 模型定义
- **错误语义**：统一使用 HTTP 状态码 + JSON 错误体 `{"detail": "..."}`
- **命名规范**：类名 `PascalCase`，函数/变量 `snake_case`，常量 `UPPER_SNAKE_CASE`，私有成员 `_prefix`
- **类型注解**：所有函数参数和返回值必须加类型注解
- **Git 提交规范**：`<type>: <描述>`，类型包括 feat/fix/docs/refactor/test/chore/style
- **禁止行为**：禁止 `eval()` / `exec()` / `pickle.load()` 处理外部数据；禁止硬编码密钥或 Token

### API 响应格式示例

```json
{
  "data": null,
  "error": {"code": "VALIDATION_ERROR", "detail": "title field is required"},
  "meta": {"request_id": "req_abc123"}
}
```

## Agent 划分

| 名称 | 职责 | 输入 | 输出 |
|------|------|------|------|
| Host | 群聊主持人，发送状态广播与协作指令 | 用户需求 | 群聊消息 |
| Manager | 需求分析、方案设计、任务分解 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码、修复缺陷 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证、质量门禁 | 代码 + PR | Review 报告 |

## 运行与依赖

- **Python 版本**：3.10+（当前环境 3.10）
- **虚拟环境**：`.venv/`（已创建，已安装依赖）
- **生产依赖**（`requirements.txt`）：
  - `fastapi>=0.104.0`
  - `uvicorn[standard]>=0.24.0`
  - `pydantic>=2.5.0`
- **开发依赖**（`requirements-dev.txt`）：pytest、ruff、coverage 等
- **启动方式**：`uvicorn src.api.main:app --reload`
- **测试运行**：`pytest tests/ -v`
- **无需**：Docker、Node.js、数据库服务器（开发阶段使用 SQLite）

## 协作规则

- **日志规范**：通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档（存于 `.agent/` 或 Hub 工作目录）
- **上下文隔离**：每个 Hub/Agent 独立维护自己的分支和文档，不跨 Hub 共享状态
- **分支策略**：从 `main` 创建功能分支，命名格式 `flyinghub-YYYYMMDDHHmmss` 或 `feat/<descriptive-name>`
- **代码审查**：所有 PR 需至少一个 Agent 审查通过后方可合并
- **任务追踪**：任务状态通过 `task-NNN.md` 或外部 Todo 文件管理
- **禁止**：未经验证就假设全局状态或历史记忆

## 演进原则

- **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract，再进入编码阶段
- **模块边界**：新能力优先通过新增模块扩展，不破坏现有模块边界
- **简单优先**：不做过度设计，够用就好，避免过早抽象
- **可替换性**：组件间通过接口解耦，便于技术栈替换
- **决策记录**：重要架构决策记录在 `docs/adr/` 目录下的 ADR 文档中
- **回顾沉淀**：每个迭代结束后更新 ARCH.md 和相关文档，沉淀经验教训
