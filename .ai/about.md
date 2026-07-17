# .ai/about.md — AI Agent Project Constitution

## 项目概述

- **项目名称**: test-repo
- **仓库地址**: https://github.com/sensee-arch/test-repo
- **定位**: AI Agent 协作编程的实验性/测试项目，为多个 AI Agent 在统一架构规范下协同工作提供试验场
- **解决的问题**: 验证和演练 AI Agent 协作编程工作流，建立标准化的 AI 项目协作流程（需求 → 方案 → 任务 → 开发 → 审核）
- **当前阶段**: 项目骨架搭建阶段，核心代码尚未实现

## 核心目标

- ✅ 验证 AI Agent 间任务分配、开发、评审的标准协作流程
- ✅ 建立可复用的 Agent 协作模板和规范（需求规格、技术方案、任务分解）
- ✅ 提供可选技术栈的快速原型验证能力
- ✅ 保持架构文档（ARCH.md）作为项目的主文档
- ✅ 沉淀 AI 辅助开发的实践经验
- ❌ 无需生产级部署
- ❌ 无需用户认证、数据库持久化或多端协同

## 技术架构

- **架构风格**: 待定（遵循简单优先原则）
- **推荐技术栈**:
  - 编程语言: Python 3.11+
  - Web 框架: FastAPI（推荐）/ Flask
  - 数据库: SQLite（开发）/ PostgreSQL（生产）
  - API 风格: RESTful
  - 测试框架: pytest + pytest-cov
  - 代码格式化: Ruff
- **已安装依赖**:
  - `requirements.txt`: fastapi, uvicorn[standard], pydantic
  - `requirements-dev.txt`: pytest, pytest-cov, ruff, httpx
- **目录结构**:
  ```
  test-repo/
  ├── .ai/                  # AI Agent 配置与约定文档
  ├── .agent/               # AI Agent 工作文件（计划、任务等）
  ├── src/                  # 源代码
  │   ├── core/            # 核心业务逻辑
  │   ├── api/             # API 接口层
  │   ├── models/          # 数据模型
  │   ├── services/        # 服务层
  │   └── utils/           # 工具函数
  ├── tests/               # 测试代码
  │   ├── unit/            # 单元测试
  │   └── integration/     # 集成测试
  ├── docs/                # 文档
  │   └── adr/             # 架构决策记录（ADR）
  ├── scripts/             # 辅助脚本
  ├── ARCH.md              # 架构文档
  ├── README.md            # 项目说明（待创建）
  └── LICENSE              # MIT 许可证
  ```

## 基础契约

### 数据格式（待定，根据具体需求确定）

### 代码规范
- **Python**: 遵循 PEP 8，使用 Ruff 进行代码检查
- **命名约定**:
  - 类名: `PascalCase`
  - 函数/方法: `snake_case`
  - 变量: `snake_case`
  - 常量: `UPPER_SNAKE_CASE`
  - 私有成员: `_prefix`
- **类型注解**: 所有函数参数和返回值需加类型注解

### Git 提交规范
```
<type>: <简短描述>

<详细说明（可选）>
```
- `feat`: 新功能 | `fix`: 修复 | `docs`: 文档变更
- `refactor`: 重构 | `test`: 测试相关 | `chore`: 构建/工具/配置变更
- `style`: 代码格式化

### 分支策略
- `main` — 稳定主分支，始终保持可部署状态
- `flyinghub-YYYYMMDDHHmmss` — 功能开发分支（按日期命名）
- 功能开发完成后合并到 `main`

### 禁止行为
- 禁止使用 `eval()` 或 `new Function()`
- 禁止在未提交代码的情况下切换分支
- 禁止创建空提交（`git commit --allow-empty`）

## Agent 划分

| 名称       | 职责                                                         | 输入来源         | 输出去向     |
|------------|--------------------------------------------------------------|------------------|--------------|
| Host       | 群聊主持人，发送欢迎/状态广播                                | 用户             | 群聊         |
| Manager    | 需求分析、方案设计、契约制定                                 | 用户需求 + Spec  | Plan+Contract |
| Developer  | 编码实现、提交代码                                           | Task 描述        | 代码提交     |
| Reviewer   | 代码审查、AC 验证                                            | 代码文件         | Review 报告  |

## 运行与依赖

### 开发环境
- **Python**: 3.10+（当前环境 3.10）
- **依赖安装**:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- **虚拟环境**: 已创建在 `.venv/`
- **代码检查**: `ruff check .`
- **测试**: `pytest`

### 无需
- Node.js / npm / package.json
- Docker
- 数据库服务器

## 协作规则

- **日志规范**: 通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
- **契约优先**: 编码前必须先完成 Spec → Plan → Contract 文档
- **工作目录**: `.agent/YYYYMMDDHH-<feature>/` 下存放 Agent 工作文件
- **上下文传递**: 每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **禁止**: 未经验证就假设全局状态或历史记忆
- **审核要求**: 所有 PR 应包含清晰的变更描述和测试覆盖；关键逻辑变更需至少一个 Agent 审核；测试覆盖率不低于 80%

## 演进原则

- **契约优先于实现**: 任何新功能必须先完成 Spec 和 Contract 再编码
- **简单优先**: 不做过度设计，够用就好
- **可替换性**: 组件间通过接口解耦，便于替换
- **测试驱动**: 核心逻辑必须可测试
- **新能力优先通过新增模块实现**, 不破坏现有模块边界
- ADR 位置: `docs/adr/`（待填入具体条目）
