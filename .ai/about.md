# .ai/about.md — AI Agent Project Constitution

## 项目概述

- **项目名称**: test-repo
- **仓库**: https://github.com/sensee-arch/test-repo
- **许可证**: MIT
- **定位**: AI Agent 协作编程的试验场。以 git 仓库为载体，让多个 AI Agent 在统一架构规范下协同工作，验证和沉淀 AI 辅助开发的标准化流程。
- **当前应用**: Todo List 单页应用（SPA），使用纯 HTML/CSS/JavaScript 构建（Vanilla JS），无外部依赖。用户通过浏览器即可完成任务创建、编辑、完成切换、删除和过滤功能，数据通过浏览器 localStorage 持久化。
- **不涉及**: 用户认证、后端服务、数据库、API 接口、CI/CD 部署、PWA。

## 核心目标

### 实验平台目标
- 验证和演练 AI Agent 协作编程工作流（需求 → 方案 → 任务 → 开发 → 审核）
- 建立标准化的 AI 项目协作流程和模板
- 记录和沉淀 AI 辅助开发的实践经验

### Todo 应用目标
- ✅ 完整的 CRUD 功能：创建、读取、更新、删除待办事项
- ✅ 完成状态切换和视觉反馈（删除线、透明度变化）
- ✅ 按全部/活跃/已完成三种视图过滤
- ✅ 内联编辑功能（点击任务标题进入编辑模式，Enter 保存、Escape 取消）
- ✅ 空状态提示（无任务时显示友好提示）
- ✅ 输入验证（空标题禁用添加按钮）
- ✅ 删除前确认弹窗
- ✅ XSS 防护（使用 `escapeHtml()` 纯文本渲染，禁止 `innerHTML`）
- ✅ 数据通过浏览器 localStorage 持久化，刷新不丢失
- ✅ 零外部依赖，打开即用
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知

## 技术架构

### 当前 Todo 应用架构

- **架构风格**: 单体 SPA（Single-Page Application）
- **核心组件**:
  - `index.html` — HTML 模板（语义化标签: header/main/section）
  - `style.css` — 样式层（CSS 变量、响应式断点 480px、完成态样式）
  - `storage.js` — 数据持久层（localStorage CRUD，UUID v4 生成，ISO-8601 时间戳）
  - `app.js` — UI 控制器（渲染、事件绑定、过滤状态管理）
- **通信方式**: 函数内部调用（同步），无网络通信
- **技术栈**: HTML5 + CSS3 + Vanilla JavaScript ES6+，localStorage API

### 推荐技术栈（按具体需求确认，当前未使用）

| 类别 | 推荐选项 | 备选方案 |
|------|----------|----------|
| 编程语言 | Python 3.11+ | Go, TypeScript/Node.js |
| Web 框架 | FastAPI | Flask, Express, Gin |
| 数据库 | SQLite(开发) / PostgreSQL(生产) | MySQL, MongoDB |
| API 风格 | RESTful API | GraphQL |
| 测试框架 | pytest / vitest | unittest |
| 代码格式 | Ruff / Prettier | Black, gofmt |
| 包管理 | pip + requirements.txt / Poetry | npm, go mod |

### 技术选型原则
1. **简单优先** — 不做过度设计，够用就好
2. **可替换性** — 组件间通过接口解耦，便于替换
3. **测试驱动** — 核心逻辑必须可测试

## 基础契约

### Todo 数据契约

```json
{
  "id": "m3xq8f2k-1a1b-4c3d-8e5f-6a7b8c9d0e1f",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2026-07-20T03:00:00.000Z",
  "updatedAt": "2026-07-20T03:00:00.000Z"
}
```

- 数据格式：所有待办项为 JSON 对象，包含 `id`（UUID v4 字符串）、`title`（字符串）、`completed`（布尔）、`createdAt`（ISO-8601 字符串）、`updatedAt`（ISO-8601 字符串）
- 存储键名：`todolist_tasks`，值为此 JSON 对象数组的字符串序列
- UUID 生成：优先 `crypto.randomUUID()`，降级为手动 Math.random 实现
- 错误语义：localStorage 操作失败时静默降级（`console.warn`），不抛出异常
- 不可变字段：`id` 在创建后不可修改
- 禁止行为：禁止使用 `innerHTML` 渲染用户输入内容；禁止 `eval()` 或 `new Function()`；禁止修改待办列表容器之外的 DOM

### 目录结构

```
test-repo/
├── .ai/                  # AI Agent 宪法文档
│   └── about.md          # 本文件
├── docs/                 # 文档
├── tests/                # 测试代码
│   ├── test_quality.js   # 代码质量检查（Node.js 运行）
│   └── test_storage.js   # 存储层单元测试（Node.js 运行，含 localStorage mock）
├── app.js                # UI 控制器（渲染、事件绑定、状态管理）
├── storage.js            # 数据持久层（localStorage CRUD）
├── style.css             # 样式文件
├── index.html            # 入口 HTML 文件
├── package.json          # Node.js 测试依赖配置
├── ARCH.md               # 架构文档
├── requirements.txt      # 生产依赖（Python，当前未使用）
├── requirements-dev.txt  # 开发依赖（Python，当前未使用）
└── LICENSE               # MIT 许可证
```

### 编码规范
- **JavaScript**: 遵循标准 ES6+，使用 JSDoc 类型注释
- **命名**: 类名 `PascalCase`，函数/变量 `camelCase`，常量 `UPPER_SNAKE_CASE`
- **CSS**: 使用 CSS 变量（custom properties），遵循 BEM 类名风格
- **HTML**: 使用语义化标签（header/main/section/button），确保 ARIA label

### Git 提交规范
```
<type>: <简短描述>

<详细说明（可选）>
```

提交类型：`feat`(新功能)、`fix`(修复)、`docs`(文档)、`refactor`(重构)、`test`(测试)、`chore`(配置/工具)、`style`(格式化)

### 分支策略
- `main` — 稳定主分支，始终保持可部署状态
- `flyinghub-YYYYMMDDHHmmss` — 功能开发分支（按日期时间命名），功能完成后合并到 main

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

### Todo 应用
- 运行环境：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90、Safari ≥ 15）
- 启动方式：直接在浏览器中打开 `index.html`
- 无需：Node.js、Python、Docker、构建工具、网络连接

### 测试运行
```bash
cd test-repo
npm install          # 安装 vitest
npx vitest run       # 运行测试
# 或直接 Node.js 运行
node tests/test_storage.js
node tests/test_quality.js
```

### Python 环境（备选）
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## 协作规则

### 工作流程
```
需求描述 → /spec 生成需求规格 → /plan 分解任务 → /assign 分配任务 → 开发实现 → 审核合并
```

### 契约规则
- 契约优先：编码前必须先完成 Spec → Plan → Contract 文档
- 日志规范：通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
- 上下文传递：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- 禁止：未经验证就假设全局状态或历史记忆

### 代码评审规范
1. 所有 PR 应包含清晰的变更描述和测试覆盖
2. 关键逻辑变更需至少一个 Agent 审核
3. 测试覆盖率不低于 80%

## 演进原则

1. **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract 再编码
2. **模块边界**：新能力优先通过新增模块实现，不破坏现有模块边界
3. **ADR 记录**：重要架构决策记录于 `docs/adr/` 目录
4. **简单优先**：不做过度设计，够用就好
5. **可替换性**：组件间通过接口解耦，便于替换
6. **测试覆盖**：核心逻辑必须可测试，增量开发需追加对应测试
