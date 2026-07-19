# .ai/about.md — AI Agent 项目宪法

> 项目: test-repo
> 仓库: https://github.com/sensee-arch/test-repo
> 更新日期: 2026-07-19
> 分支: flyinghub-20260719122532

---

## 1. 项目概述

`test-repo` 是一个 AI Agent 协作编程的试验场与模板项目。项目以 Git 仓库协作的方式，让多个 AI Agent 在统一的架构规范下完成需求分析、方案设计、编码实现和代码审核的完整工作流。同时包含一个 Web Todo List SPA 作为参考实现（分支 `flyinghub-20260718173517`）。

- **仓库**: https://github.com/sensee-arch/test-repo
- **许可证**: 见 LICENSE 文件
- **协作模式**: 通过 FlyingHub 平台触发 Agent 任务，基于 Git 分支隔离开发

## 2. 核心目标

- **工作流验证**: 验证和演练 AI Agent 协作编程的标准工作流（需求 → 方案 → 任务 → 开发 → 审核）
- **规范沉淀**: 建立并持续改进标准化的 AI 项目协作流程和模板
- **技术探索**: 可选技术栈的快速原型验证（目前规划 FastAPI + Python 3.11+）
- **参考实现**: 提供 TodoList SPA（HTML/CSS/JS + localStorage）作为 Agent 协作的完整案例
- 不追求：生产级部署、多端同步、用户认证体系

## 3. 技术架构

### 整体架构

项目当前为"双轨"架构：

| 轨线 | 描述 | 状态 |
|------|------|------|
| **Agent 协作层** | FlyingHub + Git 分支驱动的 Agent 工作流 | 活跃 |
| **Web 应用层** | TodoList SPA — 单体前端应用 | 参考实现（分支） |

### 推荐技术栈（应用开发）

| 类别 | 推荐 | 备选 |
|------|------|------|
| 语言 | Python 3.11+ | Go, TypeScript |
| Web 框架 | FastAPI | Flask, Express |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） | MySQL |
| API 风格 | RESTful | GraphQL |
| 测试 | pytest + pytest-cov | unittest |
| 代码格式 | Ruff | Black, isort |
| CI/CD | GitHub Actions | — |

### 目录结构

```
test-repo/
├── .ai/                 # Agent 项目文档
│   └── about.md        # ← 本文档（项目宪法）
├── docs/
│   └── adr/            # 架构决策记录
├── src/                 # 源代码（按模块组织）
├── tests/               # 测试代码
├── requirements.txt     # 生产依赖
├── requirements-dev.txt # 开发依赖
├── ARCH.md              # 架构文档
├── README.md            # 项目说明
└── LICENSE              # 许可证
```

### 技术选型原则

1. **简单优先** — 不做过度设计，够用就好
2. **可替换性** — 组件间通过接口解耦
3. **测试驱动** — 核心逻辑必须可测试

## 4. 基础契约

### 数据契约

- 所有持久化数据使用 JSON 序列化格式
- Todo 项数据格式：`{ id: string, title: string, completed: boolean, createdAt: number }`
- localStorage 存储键名: `todo_items`
- 存储操作失败时静默降级（`console.warn`），不抛出异常

### 安全契约

- 禁止使用 `innerHTML` 渲染用户输入内容
- 禁止 `eval()` 或 `new Function()`
- 禁止修改待办列表容器之外的 DOM
- 日志中自动遮蔽 Token、Secret 等凭证字段（`***`）

### Git 契约

- 提交格式: `<type>: <简短描述>`
- 类型: `feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `style`
- 分支命名: `flyinghub-YYYYMMDDHHmmss`（基于 main 创建）
- push 前先 pull，合并冲突自主修复

## 5. Agent 划分

| Agent | 职责 | 输入 | 输出 |
|-------|------|------|------|
| **Boot (本 Agent)** | 环境初始化、分支创建、项目文档生成 | 项目信息 + check result | Git 分支 + 文档 |
| **Manager** | 需求分析、方案设计、契约制定 | 用户需求 | Spec + Plan + Contract |
| **Developer** | 编码实现、提交代码 | Task 描述 | 代码提交 |
| **Reviewer** | 代码审查、AC 验证 | 代码文件 | Review 报告 |

协作流程: 需求描述 → `/spec` → `/plan` → `/assign` → 开发实现 → 审核合并

## 6. 运行与依赖

### 环境准备

```bash
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 当前依赖

- **生产**: fastapi>=0.104.0, uvicorn[standard]>=0.24.0, pydantic>=2.5.0
- **开发**: pytest>=7.4.0, pytest-cov>=4.1.0, ruff>=0.1.0, httpx>=0.25.0
- **不需要**: Node.js, Docker, 数据库服务

### TodoList SPA 运行

直接在浏览器中打开对应分支的 `src/web/todo/index.html`

## 7. 协作规则

### 工作流规范

1. **契约优先**: 编码前必须先完成 Spec → Plan → Contract 文档
2. **独立分支**: 每个 Hub 任务在独立分支上完成，不交叉
3. **无状态假设**: 每个 Agent 会话为独立请求，不依赖历史记忆
4. **自主修复**: 遇到报错先自行排查（重试/装依赖/修复冲突），失败达上限才上报

### 日志规范

- 所有 Agent 操作通过 `action_trace`（Base64 编码 Markdown）记录
- 包含: Reasoning → Decision → Action → Observation → Reflection

### 代码规范

- Python 遵循 PEP 8，使用 `ruff` 检查
- 命名: 类 `PascalCase`，函数 `snake_case`，常量 `UPPER_SNAKE_CASE`
- 所有函数参数和返回值需加类型注解

## 8. 演进原则

1. **契约优先于实现**: 任何新功能必须先完成 Spec 和 Contract 再编码
2. **增量演进**: 新能力优先通过新增模块实现，不破坏现有模块边界
3. **文档同步**: 架构/契约变更必须同步更新本文档和 ARCH.md
4. **ADR 记录**: 重要架构决策写入 `docs/adr/` 目录
5. **回顾改进**: 每个里程碑完成后回顾协作流程，更新模板和规范
