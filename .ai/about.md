# .ai/about.md — AI Agent Project Constitution

## 1. 项目概述

- **项目名称**: test-repo
- **仓库地址**: https://github.com/sensee-arch/test-repo
- **Hub**: 测试Hub（自动化测试创建的Hub）
- **定位**: 这是一个实验性测试项目，作为 AI Agent 协作编程的试验场，验证标准化协作工作流
- **当前阶段**: 已实现 Todo List SPA（Vanilla JS），规划中 FastAPI 后端
- **用户价值**: 快速记录、跟踪、完成待办事项，零安装，浏览器打开即用

## 2. 核心目标

- ✅ Todo List 单页应用（SPA）— 纯前端，CRUD，localStorage 持久化
- ✅ 任务增删改查（创建/读取/更新/删除待办事项）
- ✅ 完成状态切换 + 过滤视图（全部/活跃/已完成）
- ✅ 内联编辑（双击编辑标题，Enter 保存，Escape 取消）
- ✅ 零外部依赖，单文件部署 `src/web/todo/index.html`
- ⏳ 规划中：FastAPI 后端 + RESTful API + SQLite/PostgreSQL
- ⏳ 规划中：Agent 协作自动化开发流程

## 3. 技术架构

### 当前（Todo SPA）
- **架构风格**: 单体 SPA，单 HTML 文件
- **分层设计**:
  - Store 层: 状态管理 + localStorage 持久化
  - Renderer 层: DOM 构建、视图更新
  - EventHandler 层: 事件绑定、编排、验证
- **数据流**: User Action → DOM Event → EventHandler → Store → Renderer → View
- **技术栈**: HTML5 + CSS3 (Flexbox) + Vanilla JavaScript ES6+
- **存储**: Web Storage API (localStorage, key: `todo_items`)

### 规划中（FastAPI 后端）
- **架构风格**: RESTful API + 前端 SPA
- **Web 框架**: FastAPI (Python 3.11+)
- **数据库**: SQLite（开发）/ PostgreSQL（生产）
- **API 风格**: RESTful JSON API
- **ORM**: SQLAlchemy + Alembic（迁移）

### 目录结构
```
test-repo/
├── src/web/todo/          # Todo SPA 前端
│   └── index.html         # 单文件应用（HTML+CSS+JS）
├── src/api/               # (规划) API 接口
├── src/core/              # (规划) 核心业务逻辑
├── src/models/            # (规划) 数据模型
├── tests/                 # 测试
├── .ai/                   # AI Agent 工作文档
│   └── about.md           # 本文件 — 项目宪法
├── ARCH.md                # 架构文档
├── requirements.txt       # 生产依赖（FastAPI, Uvicorn, Pydantic）
├── requirements-dev.txt   # 开发依赖（pytest, ruff, httpx）
└── README.md
```

## 4. 基础契约

- **数据格式**: 每条待办项为 `{id: string, title: string, completed: boolean, createdAt: number}`
- **存储键名**: `todo_items`
- **安全约束**:
  - 禁止使用 `innerHTML` 渲染用户输入 → 必须用 `textContent`
  - 禁止 `eval()`、`new Function()`
  - 标题最大 500 字符，输入自动 trim
- **错误处理**: localStorage 读写失败时静默降级（`console.warn`），不崩溃
- **Git 分支命名**: `flyinghub-YYYYMMDDHHmmss`
- **提交规范**: `<type>: <描述>`（feat/fix/docs/refactor/test/chore/style）

## 5. Agent 划分

| Agent | 职责 | 输出 |
|-------|------|------|
| 🎩 Host | 群聊主持人，广播状态，引导流程 | 群聊消息 |
| 📋 Manager | 需求分析、方案设计、Spec/Plan 生成 | Spec, Plan, Contract |
| 💻 Developer | 编码实现、单元测试、提交代码 | 代码提交 |
| 👀 Reviewer | 代码审查、AC 验证、质量把关 | Review 报告 |

**工作流**: 需求 → `/spec` → `/plan` → 任务分解 → 编码 → 审查 → 合并

## 6. 运行与依赖

### 当前（Todo SPA）
- **运行环境**: 现代浏览器（Chrome 90+, Firefox 90+, Safari 15+, Edge 90+）
- **启动**: 浏览器直接打开 `src/web/todo/index.html`
- **开发工具**: 任意文本编辑器 + Git

### 规划中（FastAPI 后端）
- **运行环境**: Python 3.11+
- **启动**: `uvicorn src.api.main:app --reload`
- **依赖安装**: `pip install -r requirements.txt`
- **开发依赖**: `pip install -r requirements-dev.txt`
- **代码检查**: `ruff check .`
- **运行测试**: `pytest`

### 依赖文件
- `requirements.txt`: fastapi, uvicorn[standard], pydantic
- `requirements-dev.txt`: pytest, ruff, httpx

## 7. 协作规则

- **契约优先**: 编码前必须先完成 Spec → Plan → Task 文档
- **独立请求**: 每个 FlyingHub group_direct 请求视为独立，不依赖历史记忆
- **日志规范**: 通过 `action_trace`（Base64 编码 Markdown）记录操作
- **安全隔离**: 文件操作限制在工作目录内；凭据在日志中脱敏
- **失败重试**: 网络命令重试 2-3 次，目录自动创建，git pull 后再 push

## 8. 演进原则

- **契约优先于实现**: 任何新功能必须先编写 Spec 和 Plan
- **渐进增强**: 新增能力通过新增模块实现，不破坏现有模块边界
- **可替换性**: 组件间通过接口解耦，便于技术栈替换
- **可测试性**: 核心逻辑必须可测试
- **ADR 记录**: 重大架构决策记录在 `ARCH.md` 或独立 ADR 文件中
