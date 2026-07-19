# .ai/about.md — AI Agent 项目宪法

## 1. 项目概述

- **项目名**: test-repo
- **定位**: AI Agent 协作编程的实验与验证项目 — 作为多 Agent 协作工作流的试验场
- **仓库**: `https://github.com/sensee-arch/test-repo`
- **解决的问题**: 验证和沉淀 AI Agent 协作编程的标准化流程（需求→方案→任务→开发→审核）
- **当前状态**: 基础骨架已搭建，等待编码功能实现
- **不涉及**: 生产部署、用户认证、多端同步、真实业务场景

## 2. 核心目标

- ✅ 演练 AI Agent 协作编程全流程（需求/方案/任务/开发/评审/合并）
- ✅ 建立标准化的 AI 项目协作模板和规范文档
- ✅ 探索可复用的 Agent 协作模式，沉淀实践经验
- ❌ 不追求高性能、高可用或真实用户级体验
- ❌ 不涉及跨项目共享状态或 Agent 记忆持久化

## 3. 技术架构

- **架构风格**: 待定（预留 Python FastAPI 技术栈）
- **推荐技术栈**:
  - 语言: Python 3.11+
  - Web 框架: FastAPI ≥ 0.104.0 + uvicorn
  - 数据模型: Pydantic ≥ 2.5.0
  - 数据库: SQLite（开发）/ PostgreSQL（生产）
  - 测试: pytest + pytest-cov
  - 代码检查: ruff ≥ 0.1.0
- **通信方式**: RESTful API（规划中）
- **环境**: 本地开发无需 Docker，Python venv 即可

## 4. 基础契约

- **目录结构**:
  ```
  test-repo/
  ├── .ai/              # AI Agent 项目宪法
  ├── src/              # 源代码（待创建）
  │   ├── core/        # 核心业务逻辑
  │   ├── api/         # API 接口层
  │   ├── models/      # 数据模型
  │   ├── services/    # 服务层
  │   └── utils/       # 工具函数
  ├── tests/           # 测试代码
  ├── docs/            # 文档
  ├── scripts/         # 辅助脚本
  ```
- **命名规范**: 类名 `PascalCase`、函数/变量 `snake_case`、常量 `UPPER_SNAKE_CASE`
- **Git 提交规范**: `<type>: <描述>`（feat/fix/docs/refactor/test/chore/style）
- **分支策略**: `main` 为稳定分支，开发分支命名 `YYYYMMDDHH-<descriptive-name>` 或 `flyinghub-<timestamp>`
- **禁止行为**: 禁止未经验证的跨分支合并、禁止直接推送 main、禁止删除远程分支而不确认

## 5. Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 6. 运行与依赖

- **Python**: 3.11+
- **依赖安装**:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- **开发工具**: 文本编辑器 + Git 客户端，无需 Docker/Node.js
- **CI**: GitHub Actions（待配置）

## 7. 协作规则

- **契约优先**: 编码前必须先完成 Spec → Plan → Contract 文档
- **日志规范**: 通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误
- **上下文隔离**: 每个 FlyingHub Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **审核门槛**: 所有 PR 应有清晰变更描述，关键逻辑变更需至少一个 Agent 审核
- **自动修复优先**: 遇错先自行重试修复，仅 OS 级权限、认证鉴权、资源缺失等问题上报

## 8. 演进原则

- **简单优先**: 不做过度设计，够用就好
- **契约先于实现**: 任何新功能必须先完成 Spec 和 Contract 再编码
- **可替换性**: 组件间通过接口解耦，便于替换
- **测试驱动**: 核心逻辑必须可测试，覆盖率不低于 80%
- **ADR**: 架构决策记录存于 `docs/adr/` 目录（待创建）
