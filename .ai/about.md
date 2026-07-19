# .ai/about.md — AI Agent Project Constitution

> 最后更新: 2026-07-19
> 仓库: sensee-arch/test-repo

---

## 1. 项目概述

### 项目定位

**test-repo** 是一个 AI Agent 协作编程实验场，提供标准化的多 Agent 协作工作流验证环境。仓库包含多个 Agent 独立开发的功能分支，涵盖从 HTML 结构、CSS 样式到完整 Todo List SPA 的多种实现变体。

### 解决的核心问题

- 建立 AI Agent 可复现的协作开发流程
- 验证多 Agent 开发模式中的任务分解、契约定义、代码评审等环节
- 沉淀 AI Agent 协作的最佳实践和模板

### 关键数据

- **仓库创建**: 2024年（MIT License）
- **分支数量**: 80+（含历史 flyinghub-* 和 feat/* 分支）
- **当前架构风格**: 纯前端 SPA（参考已有分支中的 Todo List 应用）
- **不涉及**: 用户认证、后端服务、数据库、生产部署

---

## 2. 核心目标

| 优先级 | 目标 | 说明 |
|--------|------|------|
| P0 | **标准协作流程** | 建立 Agent 需求 → 方案 → 任务 → 开发 → 评审的完整链路 |
| P0 | **契约驱动开发** | Agent 面向契约（Contract）编码而非口头描述 |
| P1 | **多 Agent 并行** | 同一功能由多个 Agent 独立开发后择优/合并 |
| P1 | **可复用的 AI 模板** | 沉淀 Spec、Plan、Contract、Task 模板 |
| P2 | **技术验证** | 快速原型验证可选技术栈 |

### 非目标

- ❌ 生产级部署运维
- ❌ 长期维护或向后兼容
- ❌ 用户认证/权限管理
- ❌ 后端服务或数据库

---

## 3. 技术架构

### 当前架构（main 分支）

```
test-repo/
├── .ai/                  # AI Agent 项目宪法
├── docs/
│   └── adr/              # 架构决策记录
├── ARCH.md               # 架构概览文档
├── requirements.txt      # Python 依赖（占位）
├── requirements-dev.txt  # 开发依赖（占位）
├── task_output.json      # 历史任务输出存档
└── LICENSE               # MIT License
```

### 推荐架构（参考已有功能分支）

```
test-repo/
├── src/                   # 源代码
│   └── web/
│       └── todo/
│           ├── index.html # 页面结构
│           ├── styles.css # 样式层
│           └── app.js     # 逻辑层（Store/State/Render/Events）
├── tests/                 # 测试代码
│   └── unit/
├── docs/
│   ├── adr/              # ADR 文档
│   └── spec/             # 需求规格
├── .agent/               # Agent 工作文件
└── .ai/                  # AI Agent 配置
```

### 分层架构（Todo List 参考实现）

| 层 | 职责 | 文件 |
|----|------|------|
| **HTML** | DOM 结构，提供契约 ID 锚点 | `index.html` |
| **CSS** | 布局、主题、状态视觉反馈 | `styles.css` |
| **Store** | localStorage 封装，错误静默处理 | `store.js` |
| **State** | 数据 CRUD + 过滤器管理 | `state.js` |
| **Render** | 视图更新，渲染列表 | `render.js` |
| **Events** | 事件绑定与处理 | `events.js` |

### 数据契约

```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

- **存储键**: `todo_items` → JSON 字符串数组
- **错误策略**: localStorage 失败时 `console.warn` 静默降级

---

## 4. 基础契约

### 编码约束

- ❌ 禁止 `innerHTML` 渲染用户输入（须用 `textContent` 或 `createElement`）
- ❌ 禁止 `eval()` / `new Function()`
- ❌ 禁止修改待办列表之外的其他 DOM 区域
- ✅ 数据操作必须通过 Store/State 模块，不直接操作 localStorage
- ✅ 所有 DOM ID 必须预先在 HTML 层面定义（不使用 JS 动态创建根容器）

### 文件命名

- 源文件: `src/web/todo/<module>.html|css|js`
- 工具/测试: `tests/unit/<module>_test.py`
- Agent 工作: `.agent/YYYYMMDDHH-<feature>/`
- 文档: `docs/adr/ADR-<NNN>-<title>.md`

### 分支命名

- 功能分支: `flyinghub-YYYYMMDDHHmmss` 或 `feat/<descriptive-name>`
- 冒烟: 创建后立即 push 到 origin

### Git 提交规范

```
<type>(<scope>): <简短描述>

<可选详细说明>
```

**类型**: `feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `style`

### 状态消息格式

```
🚀 [Boot]   — 引导、初始化
📋 [Plan]   — 计划/任务分解
📝 [Contract] — 契约定义
💻 [Coding] — 编码实现
👀 [Review] — 代码评审
🔄 [Fix]    — Bug 修复
```

---

## 5. Agent 划分

| 角色 | 职责 | 输入 | 输出 |
|------|------|------|------|
| **Host** | 群聊主持，广播状态 | 用户消息 | 群聊消息 |
| **Manager** | 需求分析 → Spec → Plan → Contract | 用户需求 | 文档 |
| **Developer** | 编码实现，提交代码 | Task 描述 | 代码提交 |
| **Reviewer** | 代码审查，AC 验证 | 代码文件 | Review 报告 |

### 协作流程

```
用户需求
  → Manager: /spec → 需求规格
  → Manager: /plan → 任务分解
  → Manager: /contract → 面向接口的契约
  → Developer: 编码实现 → git commit & push
  → Reviewer: AC 验证 → 合并
```

---

## 6. 运行与依赖

### 环境要求

- **浏览器**: Chrome ≥ 90 / Firefox ≥ 90 / Edge ≥ 90
- **运行**: 直接打开 `src/web/todo/index.html`（无构建步骤）
- **开发**: 文本编辑器 + Git 客户端即可
- **无需**: Node.js / Python / Docker / 包管理器

### 开发环境

```bash
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo
# 如需 Python 环境（用于测试等）
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

---

## 7. 协作规则

### 日志规范

所有 Agent 操作须通过输出 JSON 记录：

```json
{
  "content": "用户可见的摘要",
  "action_trace": "<Base64 编码的 Markdown 跟踪记录>",
  "status": "done|failed"
}
```

`action_trace` 须包含:
- `## Reasoning` — 推理过程
- `## Decision` — 决策
- `## Action` — 执行动作
- `## Observation` — 观察结果
- `## Reflection` — 反思总结

### 契约优先

- 编码前必须先完成 Spec → Plan → Contract
- 契约变更须走 ADR（`docs/adr/`）

### 上下文隔离

- 每个 Hub/FlyingHub 实例独立维护其分支和文档
- 不跨 Hub 共享状态或假设历史记忆
- Agent 每次启动视为全新会话，依赖 `.ai/about.md` 定位

### 自动修复规则

- 遇到报错先自主修复 2-3 次再上报
- 上报白名单限: OS 权限 / 认证 / 仓库不存在 / 硬性约束
- 禁止因「目录不存在」「命令未找到」等低级错误直接退出

---

## 8. 演进原则

### 变更管理

1. **契约优先于实现** — 任何新功能必须先完成 Spec 和 Contract
2. **模块边界** — 新能力优先通过新增模块实现，不破坏现有模块
3. **ADR 记录** — 架构决策记录位置: `docs/adr/ADR-<NNN>-<title>.md`
4. **不可删除** — 已有分支保持只读，不删除历史分支

### 质量要求

- 核心逻辑必须可测试
- 测试覆盖率不低于 80%（对于有测试的分支）
- 所有 PR 应包含清晰的变更描述

### 文档维护

- `.ai/about.md` — 每次启动的定位依据，Agent 可更新但须保持 8 章节结构
- `ARCH.md` — 架构概览，重大变更时更新
- `docs/adr/` — 架构决策记录，随契约变更追加
