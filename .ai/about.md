# .ai/about.md — AI Agent Project Constitution

## 1. 项目概述

- **仓库**: `https://github.com/sensee-arch/test-repo`
- **用途**: AI Agent 协作实验性测试仓库，用于验证自动化工作流、Git 协作和全流程开发管线
- **当前阶段**: 已完成项目初始化，进入功能开发阶段
- **目标**: 通过 Todo List Web 应用（纯前端 + FastAPI 后端）验证 AI Agent 协作模式

## 2. 核心目标

- **首要目标**: 实现并交付 Todo List SPA（纯 HTML/CSS/JS，localStorage 持久化）— 当前进行中
- **扩展目标**: 为后续 FastAPI 后端 + REST API 实现预留扩展点
- **协作目标**: 验证多 Agent（Host / Manager / Developer / Reviewer）在 GitHub 分支流程中的协同效率

## 3. 技术架构

### 当前架构（SPA 阶段）

```
src/web/todo/
├── index.html    # 主入口（HTML + CSS + JS 内联）
```

**三层模块设计**:
- **Store** — 数据层: state 管理、CRUD 操作、localStorage 读写
- **Renderer** — 视图层: DOM 安全渲染、列表/计数/过滤器更新
- **EventHandler** — 控制层: 事件绑定与委托、协调 Store ↔ Renderer

**数据流**: 用户操作 → EventHandler → Store（更新 state + localStorage）→ Renderer（DOM 重绘）

### 规划架构（FastAPI 后端）

- **后端**: Python FastAPI + Pydantic + Uvicorn
- **前端**: 升级为 REST API 调用模式（fetch/axios）
- **存储**: 从 localStorage 迁移至服务端持久化

## 4. 基础契约

### 数据契约（TodoItem）

```typescript
interface TodoItem {
  id: string          // Date.now().toString(36) + Math.random().toString(36).slice(2,6)
  title: string       // 1-500 字符，trim 后纯文本
  completed: boolean  // 完成状态，默认 false
  createdAt: number   // Unix 毫秒时间戳
}
```

### 安全规则

- **禁止** innerHTML — 必须使用 textContent / document.createElement
- **禁止** eval()、new Function()
- localStorage 写操作必须 try/catch 保护
- 触控区域最小 44×44px

### Git 提交规范

- 前缀: `[Doc]` 文档类 / `[Feat]` 功能类 / `[Fix]` 修复类 / `[Refactor]` 重构类
- 第一行不超过 72 字符
- 中文描述，保持清晰

## 5. Agent 分工

| 角色 | 职责 | 触发条件 |
|------|------|----------|
| **Host** | 群组主持、环境初始化、状态广播 | 群聊启动 |
| **Manager** | 任务分配、进度跟踪、工作流仲裁 | 收到 /spec 或 /coding |
| **Developer** | 功能实现、代码编写、单元测试 | 任务分配后 |
| **Reviewer** | 代码审查、质量把关、合并批准 | PR 提交后 |

## 6. 运行与依赖

### SPA 模式

- **启动**: 用浏览器直接打开 `src/web/todo/index.html`
- **无依赖**: 零构建、零后端、零框架

### API 模式（规划中）

```bash
pip install -r requirements.txt
cd src/web/todo
uvicorn main:app --reload
```

### 开发依赖

```
# requirements.txt
fastapi          # REST API 框架
uvicorn          # ASGI 服务器
pydantic         # 数据校验

# requirements-dev.txt
pytest           # 测试框架
httpx            # 异步 HTTP 客户端
ruff             # Python linter
```

## 7. 协作规则

1. **分支策略**: 每次任务从 main 创建 feature 分支 → 开发 → PR → Reviewer 审查 → 合并到 main
2. **文档优先**: 新增功能必须先更新 .ai/about.md 和 spec 文档，再编写代码
3. **提交粒度**: 每个提交对应一个逻辑单位（文档 / 数据层 / 视图层 / 事件层等）
4. **冲突处理**: pull 最新 main 后 rebase 或 merge 解决冲突
5. **通信**: 群聊中状态变更必须广播，Agent 间任务传递需明确依赖关系

## 8. 演化原则

- 本文件（.ai/about.md）是项目的**单一事实源**，所有 Agent 必须优先阅读
- 当项目发生以下变更时，须同步更新本文件：
  - 技术栈变更（添加/替换框架、数据库等）
  - 架构模式变更（单体 → 微服务、SPA → SSR 等）
  - 协作流程变更（新增 CI/CD、代码审查规则等）
  - 数据模型变更（字段增减、存储方式变化等）
- 本项目是实验性质，接受试错与迭代，但重大决策须在群聊中达成共识
