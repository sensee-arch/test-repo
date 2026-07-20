# `.ai/about.md` — AI Agent Project Constitution

> **Repository**: sensee-arch/test-repo  
> **Updated**: 2026-07-20  
> **Version**: 1.0.0  

---

## 1. 项目概述

**test-repo** 是面向 AI Agent 协作编程的实战训练场。项目以标准 Git 仓库为协作载体，让多个 AI Agent 在统一架构规范下执行需求分析、任务分解、编码实现和代码评审。

- **产物**：一个功能完整的 Todo List SPA（单页应用），使用纯 HTML/CSS/JavaScript 构建
- **定位**：既是 AI 协作流程验证项目，也是可运行的实用前端应用
- **用户群**：AI Agent 开发者 & 协作流程研究者（最终用户是 Todo List 应用的普通使用者）
- **不涉及**：用户认证、后端服务、数据库、API 接口、多端同步、PWA 离线能力

---

## 2. 核心目标

### 产品目标
| 优先级 | 目标 | 状态 |
|--------|------|------|
| P0 | 完整的 CRUD：创建、读取、更新、删除待办事项 | ✅ 已完成 |
| P0 | 完成状态切换 + 视觉反馈（删除线、透明度） | ✅ 已完成 |
| P0 | 三种过滤视图：全部 / 活跃 / 已完成 | ✅ 已完成 |
| P0 | localStorage 持久化，刷新不丢失 | ✅ 已完成 |
| P1 | 行内编辑（双击标题编辑、Enter 确认、Escape 取消） | ✅ 已完成 |
| P1 | 新增/删除交互动画（slideIn / slideOut） | ✅ 已完成 |
| P1 | 完成动画（checkbox scaleIn + 标题过渡） | ✅ 已完成 |
| P1 | 集成测试覆盖（jsdom + Node.js） | ✅ 已完成 |
| P2 | 响应式布局（≤480px 适配） | ✅ 已完成 |

### 非目标
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA / 离线能力或推送通知
- ❌ 不追求复杂状态管理（如 Redux / Pinia）
- ❌ 不追求 TypeScript 迁移

---

## 3. 技术架构

### 架构风格
**单体 SPA**（Single-Page Application），所有逻辑在浏览器中运行。

### 技术栈
```
HTML5 + CSS3 + Vanilla JavaScript (ES6+) + localStorage API
Node.js + jsdom (仅测试环境)
```

### 模块划分

```
┌─────────────────────────────────────────────┐
│  index.html  (HTML 模板层)                   │
│  - 输入表单、任务列表容器、底部控制栏          │
├─────────────────────────────────────────────┤
│  css/style.css  (CSS 样式层)                 │
│  - BEM 命名、CSS 自定义属性、响应式           │
│  - GPU 友好的 transform/opacity 动画         │
├─────────────────────────────────────────────┤
│  js/app.js  (JavaScript 逻辑层)              │
│  ├── DataModule   存储模块 (类)              │
│  ├── RenderModule 渲染模块 (类)              │
│  └── EventModule  事件绑定 (类)              │
│  └── initApp()    应用启动函数               │
└─────────────────────────────────────────────┘
```

### 数据流
```
用户操作 → EventModule 监听 → 调用 DataModule API
                                ↓
                         DataModule 更新 localStorage
                                ↓
                         onChange 通知 RenderModule
                                ↓
                         RenderModule 更新 DOM
```

### 通信方式
- 模块间通过**函数调用**（同步），无网络通信
- 数据变更通过 `onChange` 回调机制广播

---

## 4. 基础契约

### 4.1 数据格式
每个待办项为 JSON 对象，严格遵守以下 Schema：

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2026-07-20T07:00:00.000Z",
  "updatedAt": "2026-07-20T07:00:00.000Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string (UUID v4) | 唯一标识，由 `crypto.randomUUID()` 生成 |
| `title` | string (1-200 字符) | 待办标题，前后自动 trim |
| `completed` | boolean | 完成状态 |
| `createdAt` | string (ISO 8601) | 创建时间 |
| `updatedAt` | string (ISO 8601) | 最后更新时间 |

### 4.2 存储键名
- `todolist-tasks` — 存储任务数组的 JSON 序列化字符串

### 4.3 错误语义
| 情况 | 行为 |
|------|------|
| localStorage 不可用 | 静默降级到内存数组，显示警告横幅 |
| localStorage 写入失败 | `console.error`，不抛出异常 |
| JSON 解析失败 | 返回空数组，`console.warn` |
| 空标题/超长标题 | 抛出 `Error`，调用方自行处理 |
| 操作不存在的 id | 抛出 `Error` |

### 4.4 禁止行为
- ❌ 禁止使用 `innerHTML` 渲染用户输入内容（使用 `textContent` + DOM API）
- ❌ 禁止 `eval()` 或 `new Function()`
- ❌ 禁止修改 `#todo-list` 容器之外的 DOM
- ❌ 禁止依赖浏览器专有 API（如 `chrome.*`、`webkit` 前缀）

### 4.5 边界值
| 项 | 值 |
|----|-----|
| 标题最小长度 | 1 字符（trim 后） |
| 标题最大长度 | 200 字符 |
| 动画时长 | 300ms（常量 `ANIMATION_DURATION_MS`） |
| localStorage 警告阈值 | 4 MB（常量 `STORAGE_WARN_SIZE`） |

---

## 5. Agent 划分

### 运行时协作角色

| 角色 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| **Host** | 群聊主持人，发送欢迎 / 状态广播 | 用户 / 系统 | 群聊消息 |
| **Manager** | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract 文档 |
| **Developer** | 编码实现、提交代码 | Task 描述 | 代码提交 + 文档更新 |
| **Reviewer** | 代码审查、AC 验证 | 代码文件 | Review 报告 |

### 文件约定

```
.ai/                    ← AI Agent 项目配置目录
  about.md              ← 项目宪法（本文件）
  contract/             ← 模块间契约文档
  tasks/                ← 任务分解文档
  reviews/              ← 评审报告
```

### 分支命名规范
- 功能分支：`feat/<descriptive-name>`
- 自动任务分支：`flyinghub-YYYYMMDDHHmmss`
- 修复分支：`fix/<issue-description>`

### 提交信息格式
```
<type>: <简短描述>

<详细说明（可选）>
```

| 类型 | 使用场景 |
|------|----------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `refactor` | 代码重构 |
| `test` | 测试相关 |
| `chore` | 构建/配置/依赖变更 |
| `style` | 代码格式 |

---

## 6. 运行与依赖

### 生产环境
- 任意现代浏览器（Chrome ≥ 90, Firefox ≥ 90, Edge ≥ 90）
- 打开 `index.html` 即可运行
- **零外部依赖**，无需构建工具或后端服务

### 开发环境
```bash
# 克隆
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo

# 安装测试依赖（可选，仅运行测试时需要）
npm install

# 运行测试
npm test

# 本地查看
# 直接在浏览器打开 index.html
```

### 目录结构
```
test-repo/
├── .ai/                  # AI Agent 配置文件
│   └── about.md          # 项目宪法（本文件）
├── css/
│   └── style.css         # 样式文件（BEM）
├── js/
│   └── app.js            # 主应用逻辑
├── test/
│   └── app.test.js       # 集成+单元测试（jsdom）
├── index.html            # 入口页面
├── package.json          # Node 配置（仅测试用）
├── requirements.txt      # Python 依赖（预留）
├── requirements-dev.txt  # Python 开发依赖（预留）
├── ARCH.md               # 架构文档
└── LICENSE               # 许可证
```

---

## 7. 协作规则

### 7.1 契约优先
所有功能开发前必须完成：
1. **Spec** — 需求规格说明
2. **Plan** — 技术方案和任务分解
3. **Contract** — 模块间接口契约
4. **Code** — 编码实现
5. **Review** — 自评与 AC 验证

### 7.2 上下文隔离
- 每个 Hub 独立维护自己的分支和文档
- 不跨 Hub 共享状态或假设全局记忆
- 所有决策和操作通过 `action_log`（Base64 JSON）记录

### 7.3 测试要求
- 核心逻辑（DataModule CRUD）必须有单元测试覆盖
- UI 操作路径必须有集成测试覆盖
- 新增功能必须包含对应测试用例
- 测试覆盖目标：核心逻辑 ≥ 80%

### 7.4 代码评审
- 所有合并到 main 的 PR 需经至少一个 Agent 评审
- 评审要点：功能正确性、边界情况、安全、性能

### 7.5 日志规范
- 使用 `action_trace`（Base64 编码 Markdown）记录 Agent 执行过程
- 包含：## Reasoning → ## Decision → ## Action → ## Observation → ## Reflection

---

## 8. 演进原则

1. **契约优先于实现** — 任何新功能必须先完成 Spec → Plan → Contract，再编码
2. **模块化扩展** — 新能力优先通过新增模块实现，不破坏现有模块边界
3. **向后兼容** — 数据格式变更必须提供迁移路径，确保旧数据可读
4. **简单优先** — 不做过度设计，够用就好
5. **测试驱动** — 核心逻辑必须可测试，新功能必须附带测试
6. **ADR 记录** — 重要架构决策记录在 `.ai/adr/` 目录下
7. **Git 历史可追溯** — 每个提交聚焦单一变更，提交信息清晰

---

*本项目宪法由 AI Agent 在 FlyingHub 协作框架下维护更新。*
