# .ai/about.md — AI Agent Project Constitution

> 更新日期: 2026-07-19

---

## 1. 项目概述

**test_repo** 是一个 AI Agent 协作编程试验场，托管于 [github.com/sensee-arch/test-repo](https://github.com/sensee-arch/test-repo)。项目提供标准化的 AI Agent 协作工作流（需求 → 方案 → 任务 → 开发 → 审核），以 git 仓库为协作载体，在 FlyingHub 平台上由多个 AI Agent 协同开发。

项目包含两条主要技术线：

- **主线（main）：Python/FastAPI 骨架** — 空白项目框架，用于验证后端协作工作流
- **功能分支：TodoList SPA** — 已完成的全功能单页待办应用（HTML/CSS/JS），用于验证前端协作工作流

## 2. 核心目标

- ✅ 验证和演练 AI Agent 协作编程工作流（需求 → 方案 → 任务 → 开发 → 审核）
- ✅ 建立标准化协作流程模板和规范文档
- ✅ 沉淀可复用的 Agent 协作模式
- ✅ 记录 AI 辅助开发的工程实践经验
- ❌ 不追求生产级部署
- ❌ 不涉及用户认证、后端服务、数据库、CI/CD 流水线

### TodoList SPA 子目标

- ✅ 完整的 CRUD：创建、读取、更新、删除待办事项
- ✅ 完成状态切换 + 视觉反馈（删除线、透明度变化）
- ✅ 三视图过滤：全部 / 活跃 / 已完成
- ✅ localStorage 持久化，刷新不丢失
- ✅ 零外部依赖，单文件部署，打开即用

## 3. 技术架构

### 双线架构

| 维度 | 后端骨架（main） | TodoList SPA（功能分支） |
|------|------------------|------------------------|
| **技术栈** | Python 3 + FastAPI + uvicorn + pydantic | HTML5 + CSS3 + Vanilla JS ES6+ |
| **架构风格** | RESTful API | 单体 SPA |
| **持久化** | SQLite（开发）/ PostgreSQL（生产） | localStorage API |
| **测试** | pytest + coverage | 无自动化测试 |
| **依赖管理** | pip + requirements.txt | 零外部依赖 |

### TodoList SPA 核心组件

```
HTML 模板层（index.html）
├── 输入表单（header）
├── 待办列表容器（section.todo-list）
│   └── <li> 动态渲染项
└── 底部控制栏（footer）
    ├── 活跃计数
    ├── 三视图过滤按钮
    └── Clear Completed 按钮

CSS 样式层（styles.css）
├── 渐变背景 + 布局
├── 组件样式（表单、列表项、按钮）
├── .completed / .editing 状态
└── 响应式（max-width: 480px）

JavaScript 逻辑层（app.js）
├── DataStore — localStorage CRUD + ID 生成
├── TodoApp — 状态管理 + 事件绑定 + 渲染管线
└── 安全：textContent（非 innerHTML）、无 eval
```

### 后端骨架目录结构

```
test-repo/
├── .ai/                 # AI Agent 项目宪法
├── docs/adr/            # 架构决策记录
├── requirements.txt     # 生产依赖
├── requirements-dev.txt # 开发依赖
├── ARCH.md              # 架构文档
├── .venv/               # Python 虚拟环境
├── output.json          # 运行输出
└── trace.md             # 执行跟踪
```

## 4. 基础契约

### 数据契约（TodoList SPA）

每个待办项为如下 JSON 对象：

```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

- 存储键名：`todo_items`，值为 JSON 数组字符串
- ID 生成：8 位小写字母数字随机字符串
- 错误语义：localStorage 失败时 `console.warn` 静默降级，不抛出异常

### 禁止行为

- 禁止使用 `innerHTML` 渲染用户输入内容
- 禁止 `eval()` 或 `new Function()`
- 禁止修改待办列表容器之外的 DOM

### 技术选型原则

1. **简单优先** — 不做过度设计
2. **可替换性** — 组件间通过接口解耦
3. **测试驱动** — 核心逻辑必须可测试

### 编码规范

- Python: PEP 8 + Ruff 检查
- 类名 `PascalCase`，函数 `snake_case`，常量 `UPPER_SNAKE_CASE`
- 所有函数参数和返回值需加类型注解

### Git 提交规范

```
<type>: <简短描述>

<type> 范围: feat / fix / docs / refactor / test / chore / style
```

### 分支策略

- `main` — 稳定主分支，始终可部署
- `flyinghub-YYYYMMDDHHmmss` — 功能开发分支（按日期命名）
- `feat/*` — 按功能命名的开发分支
- 功能完成后通过 PR 合并到 `main`

## 5. Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| **Host** 🎙 | 群聊主持人，发送欢迎/状态广播 | 用户 / 系统事件 | 群聊 |
| **Manager** 📋 | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| **Developer** 💻 | 编码实现、提交代码 | Task 描述 | 代码提交 |
| **Reviewer** 👀 | 代码审查、AC 验证 | 代码文件 | Review 报告 |
| **Boot Agent** 🚀 | 环境初始化、状态检查、项目准备 | 调度指令 | 状态广播 |

### 工作流程

```
需求描述
  → Manager: /spec 生成需求规格
  → Manager: /plan 分解任务
  → Developer: 编码实现
  → Reviewer: 审核 → 合并
```

### 工作文件

- `.agent/YYYYMMDDHH-<feature>/` — 按功能分支组织
  - `plan.md` — 技术方案和任务分解
  - `task-NNN.md` — 具体任务描述

### 日志规范

- 操作日志通过 `action_trace`（Base64 编码 Markdown）记录
- 必需章节：Reasoning / Decision / Action / Observation / Reflection

## 6. 运行与依赖

### 后端（main 分支）

```bash
cd test-repo
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn src.main:app --reload    # 启动 FastAPI 服务
```

### TodoList SPA（功能分支）

- 运行环境：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90）
- 启动方式：直接在浏览器打开 `index.html`
- 本地开发：只需文本编辑器 + Git 客户端
- 无需 Node.js、Python、Docker、包管理器

### 已知运行时

- Node.js v24.13.1 ✅
- Python 3.10 ✅ (.venv 已配置)
- Git ✅

## 7. 协作规则

- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档
- **Hub 隔离**：每个 Hub（FlyingHub 空间）独立维护自己的分支和文档
- **上下文传递**：通过群聊消息 + 输出 JSON 传递上下文
- **禁止**：未经验证就假设全局状态或历史记忆
- **自主修复**：遇到错误先自行排查解决，符合白名单条件才上报

### 自主修复规则

1. 网络类命令重试 2-3 次
2. push 前先 pull，合并冲突 git add 后继续
3. Detached HEAD 恢复到主分支
4. 无变更不提交空提交
5. 检测 requirements.txt/package.json 自动安装依赖
6. 写入任何路径前执行 `mkdir -p`

### 上报白名单

仅以下情况允许上报：OS 级权限（EACCES/EPERM）、认证鉴权 401/403、仓库 404 或无权限、端口独占、内核限制。

## 8. 演进原则

- **契约优先于实现**：新功能必须先完成 Spec 和 Contract 再编码
- **模块化演进**：新能力优先通过新增模块实现，不破坏现有模块边界
- **文档同步**：架构决策（ADR）写入 `docs/adr/`
- **分支隔离**：不跨 Hub 共享状态或历史记忆
- **试验导向**：允许并行尝试不同技术方案，通过对比沉淀最佳实践
- **轻量治理**：所有流程文档保持为 Markdown，避免过重流程阻碍探索

---

*本文档是 AI Agent 理解项目的唯一权威来源。变更需通过 PR 审核。*
