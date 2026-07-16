# .ai/about.md — AI Agent Project Constitution

## 1. 项目概述

- 仓库: `https://github.com/sensee-arch/test-repo`
- 这是一个**实验性/测试项目**，为 AI Agent 协作编程提供试验场
- **当前已实现**: Todo List Web SPA（纯 HTML/CSS/JavaScript，浏览器 localStorage 持久化）
- **规划中**: Python FastAPI 后端服务 + RESTful API
- 项目支持 AI Agent 全流程协作：需求 → 规格 → 方案 → 任务分配 → 编码 → 审核
- 已授权协作者: `wangxi0618`

## 2. 核心目标

- ✅ **Todo SPA**: 完整的 CRUD + 完成状态切换 + 三视图过滤（全部/活跃/已完成）+ localStorage 持久化
- ✅ 零外部依赖，单文件部署，打开即用
- ⏳ **FastAPI 后端**: RESTful API 服务，Pydantic 数据模型，Uvicorn 运行
- ⏳ 标准化 AI Agent 协作工作流沉淀
- ❌ 不追求多端同步、PWA、推送通知
- ❌ 不追求认证/登录系统

## 3. 技术架构

### 当前（Todo SPA）

- **架构风格**: 单体 SPA（Single-Page Application）
- **核心模块**:
  - `Store` 模块: 数据层 — CRUD 操作、localStorage 读写、应用状态管理
  - `Renderer` 模块: 视图层 — 将数据渲染为 DOM、列表更新模板
  - `EventHandler` 模块: 控制层 — 事件绑定、委托、协调 Store 和 Renderer
- **数据流**: 用户操作 → EventHandler → Store 更新 state + localStorage → Renderer 刷新 DOM
- **技术栈**: HTML5 + CSS3 + Vanilla JavaScript ES6+，localStorage API
- **部署**: 浏览器直接打开 `src/web/todo/index.html`

### 规划（FastAPI 后端）

- **架构**: RESTful API
- **框架**: FastAPI + Uvicorn
- **数据模型**: Pydantic v2
- **测试**: pytest + httpx
- **代码质量**: Ruff

### 目录结构

```
test-repo/
├── .ai/                  # AI Agent 项目文档（本文件）
├── src/
│   └── web/
│       └── todo/         # Todo SPA 前端
│           └── index.html
├── tests/                # 测试代码（规划）
├── ARCH.md               # 架构文档
├── requirements.txt      # 生产依赖（FastAPI + Uvicorn + Pydantic）
├── requirements-dev.txt  # 开发依赖（pytest + ruff + httpx）
└── LICENSE
```

## 4. 基础契约

### 数据格式（Todo Item）

```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

- `id`: 字符串，由 `Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` 生成
- `title`: 字符串，trim 后长度 ≥ 1，禁止以 innerHTML 渲染
- `completed`: 布尔，默认 false
- `createdAt`: 数字，Unix 毫秒时间戳

### 存储

- **前端**: localStorage 键 `todo_items`，JSON 序列化
- **后端（规划）**: SQLite（开发）/ PostgreSQL（生产）

### 安全规则

- **禁止**: `innerHTML` 渲染用户输入、`eval()`、`new Function()`
- 所有用户文本通过 `document.createTextNode()` 或 `textContent` 渲染
- DOM 操作限制在待办列表容器内，不越界修改

### Git 提交规范

```
<type>: <简短描述>

<详细说明（可选）>
```

- `feat` — 新功能 | `fix` — 修复 | `docs` — 文档 | `refactor` — 重构
- `test` — 测试 | `chore` — 工具/配置 | `style` — 格式化

### 分支策略

- `main` — 稳定主分支
- `flyinghub-YYYYMMDDHHmmss` — 按日期命名的功能开发分支
- 功能完成后合并回 `main`

### 错误语义

- localStorage 操作失败时静默降级（`console.warn`），不抛出异常
- 网络/API 请求超时重试 2-3 次后报错

## 5. Agent 划分

| 角色 | 职责 | 输入 | 输出 |
|------|------|------|------|
| **Host** | 群聊主持人，欢迎/状态广播 | 用户 | 群聊消息 |
| **Manager** | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| **Developer** | 编码实现、提交代码 | Task 描述 | 代码提交 |
| **Reviewer** | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 6. 运行与依赖

### 前端 SPA

- **运行环境**: Chrome ≥ 90 / Firefox ≥ 90 / Edge ≥ 90
- **启动**: 浏览器直接打开 `src/web/todo/index.html`
- **无需**: Node.js、Python、Docker、任何构建工具

### 后端（规划）

- 安装依赖: `pip install -r requirements.txt`
- 启动服务: `uvicorn src.api.main:app --reload`
- 运行测试: `pytest`

## 7. 协作规则

- **契约优先**: 编码前必须完成 Spec → Plan → Contract 文档
- **分支隔离**: 每个开发会话创建独立 feature 分支，不直接在 main 开发
- **日志记录**: 通过 `action_trace`（Base64 编码）记录操作步骤和错误
- **上下文独立**: 每个 Hub/请求独立处理，不假设全局状态或历史记忆
- **代码审核**: 关键变更至少一个 Agent 审核后合并

## 8. 演进原则

- **契约优先于实现**: 新功能必须首先完成 Spec 和 Contract 再进入编码
- **模块边界**: 新能力优先通过新增模块实现，不改动现有模块接口
- **简单优先**: 不做过度设计，够用就好
- **可替换性**: 组件间通过接口解耦，便于技术栈替换
