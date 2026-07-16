# .ai/about.md — AI Agent Project Constitution

## 1. 项目概述

- **仓库**: `https://github.com/sensee-arch/test-repo`
- **用途**: 实验性/测试项目，为 AI Agent 协作编程提供试验场
- **当前状态**: Todo List Web SPA 已实现（纯 HTML/CSS/JavaScript，浏览器 localStorage 持久化）
- **规划中**: Python FastAPI 后端服务 + RESTful API
- **项目支持**: AI Agent 全流程协作：需求 → 规格 → 方案 → 任务分配 → 编码 → 审核
- **已授权协作者**: `wangxi0618`

### 目录结构

```
test-repo/
├── .ai/
│   └── about.md          # 项目宪法（本文件）
├── ARCH.md               # 架构文档
├── LICENSE                # 许可证
├── requirements.txt       # Python 依赖（FastAPI 等）
├── requirements-dev.txt   # 开发依赖（pytest, ruff, httpx）
└── src/
    └── web/
        └── todo/          # Todo SPA 代码目录
```

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

### 规划中（FastAPI 后端）

- **框架**: FastAPI + Pydantic
- **运行**: Uvicorn ASGI 服务器
- **API 风格**: RESTful JSON API
- **数据层**: 待定（SQLite / 内存存储）

## 4. 基础契约

### 数据模型

```typescript
interface TodoItem {
  id: string;          // 唯一标识
  title: string;       // 待办内容
  completed: boolean;   // 完成状态
  createdAt: number;    // 创建时间戳
}
```

### 安全规则

- 禁止使用 `innerHTML` 渲染用户输入 — 必须使用 `textContent`
- 禁止使用 `eval()`、`new Function()` 执行动态代码
- 事件处理器使用后需清理（`removeEventListener`），防止重复绑定
- localStorage 写操作需包裹 `try/catch`，静默降级

### Git 提交规范

- 提交信息格式: `[Tag] 简短描述`
- Tag 规则: `[Init]` 初始化, `[Feat]` 新功能, `[Fix]` 修复, `[Doc]` 文档, `[Refactor]` 重构
- 分支命名: `flyinghub-YYYYMMDDHHmmss`

## 5. Agent 分工

| 角色 | 职责 |
|------|------|
| **Host**（主持人） | 群聊主持，宣布主题，协调沟通 |
| **Manager**（项目经理） | 需求分析、任务分解、进度跟踪 |
| **Developer**（开发者） | 编码实现、单元测试、问题修复 |
| **Reviewer**（审核人） | 代码审查、质量控制、验收测试 |

## 6. 运行与依赖

### Todo SPA（当前）

- **运行方式**: 浏览器直接打开 `src/web/todo/index.html`
- **依赖**: 无（纯前端，零外部依赖）

### FastAPI 后端（规划中）

- **运行方式**: `uvicorn src.api.main:app --reload`
- **依赖**: 见 `requirements.txt`（FastAPI, Uvicorn, Pydantic）
- **开发工具**: pytest, ruff, httpx（见 `requirements-dev.txt`）

## 7. 协作规则

- 所有 AI Agent 操作必须在独立 feature branch 上进行
- 功能完成后通过 PR 合并到 `main` 分支
- 每次变更需更新 `.ai/about.md` 保持同步
- 禁止直接向 `main` 分支推送代码
- 每个 Agent 任务完成后，需提交变更总结

## 8. 进化原则

- `.ai/about.md` 是**唯一真相来源**，随项目演进持续更新
- 新功能引入需先经过 `/spec` 输出规格文档
- 重大架构变更需同步更新 `ARCH.md`
- 项目目标（Section 2）也需同步更新
