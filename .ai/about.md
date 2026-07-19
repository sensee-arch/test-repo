# .ai/about.md — AI Agent Project Constitution

> 更新日期: 2026-07-19
> 仓库: https://github.com/sensee-arch/test-repo
> 分支: main → flyinghub-20260719115805

---

## 1. 项目概述

**test_repo** 是一个 AI Agent 协作编程的试验场项目，用于演练和沉淀标准化 AI 协作工作流。项目以 Git 仓库为协作中心，支持多 Agent 在统一架构规范下协同开发，覆盖从需求分析、方案设计、编码实现到代码审核的完整生命周期。

同时，项目包含一个 **Web Todo List 单页应用（SPA）** 的初始实现作为验证载体，使用纯前端技术栈构建，提供基础的待办事项管理能力。

- **定位**: 实验性 AI Agent 协作编程沙箱 + Web Todo 应用
- **协作模式**: 群聊驱动 → /spec → /plan → /coding → /review
- **数据持久化**: Todo 数据通过浏览器 localStorage 实现

---

## 2. 核心目标

### AI 协作层
- ✅ 验证和演练 AI Agent 协作编程工作流
- ✅ 建立标准化的 Agent 协作流程（需求 → Spec → Plan → Task → Coding → Review）
- ✅ 探索可复用的 Agent 协作模板和规范文档
- ✅ 记录 AI 辅助开发的实践经验
- ❌ 不追求大规模代码产出，强调流程质量

### Todo 应用层
- ✅ 完整的 CRUD 功能：创建、读取、更新、删除待办事项
- ✅ 完成状态切换（删除线 + 透明度视觉反馈）
- ✅ 按全部/活跃/已完成三种视图过滤
- ✅ localStorage 持久化，刷新不丢失
- ✅ 零外部依赖，单文件部署
- ❌ 不追求后端同步、多端协同、PWA、推送通知

---

## 3. 技术架构

### AI 协作层
- **通信载体**: 群聊（FlyingHub 平台）+ Git 仓库
- **工作产物**: Markdown 文档（Spec / Plan / Contract）+ 代码提交
- **状态管理**: Git 分支隔离，每个 Hub/开发者独立分支
- **文档体系**: `.ai/about.md`（项目宪法）+ `ARCH.md`（架构）+ `docs/adr/`（决策记录）

### Todo 应用层
- **架构风格**: 单体 SPA（Single-Page Application），纯静态页面
- **核心组件**:
  - HTML 模板层 — 页面结构（输入框、列表容器、底部控制栏）
  - CSS 样式层 — 布局、状态配色、响应式适配
  - JavaScript 逻辑层 — localStorage 存储 → 状态管理 → 渲染 → 事件处理
- **通信方式**: 函数内部调用（同步），无网络请求
- **技术栈**: HTML5 + CSS3 + Vanilla JavaScript ES6+
- **数据方案**: 浏览器 Web Storage API（localStorage）

### 可选后端栈（AI 协作试验验证用）
| 类别 | 推荐 | 备选 |
|------|------|------|
| 语言 | Python 3.10+ | Go, TS/Node.js |
| Web 框架 | FastAPI + uvicorn | Flask, Express |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） | — |
| 测试 | pytest + pytest-cov | unittest |
| 格式 | ruff（Black + isort） | — |

---

## 4. 基础契约

### Todo 数据格式
```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```
- `id`: 字符串，唯一标识
- `title`: 字符串，待办内容
- `completed`: 布尔，完成状态
- `createdAt`: 数字，Unix 毫秒时间戳
- **存储键名**: `todo_items` → JSON 数组字符串序列

### 错误处理
- `localStorage` 写入失败静默降级（`console.warn`），不抛出异常
- 解析失败返回空数组

### 安全约束
- 禁止 `innerHTML` 渲染用户输入
- 禁止 `eval()` 或 `new Function()`
- 禁止修改待办列表容器之外的 DOM

### Git 提交规范
```
<type>: <简短描述>

<详细说明（可选）>
```
- 类型: `feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `style`

### 分支策略
- `main` — 稳定主分支，始终可部署
- `flyinghub-YYYYMMDDHHmmss` — 每次开发会话的独立分支
- 开发完成后通过 PR 合并到 `main`

---

## 5. Agent 划分

| Agent 名称 | 职责 | 输入 | 输出 |
|-----------|------|------|------|
| **Host** | 群聊主持人，发送欢迎/状态广播 | 用户消息 | 群聊通知 |
| **Manager** | 需求分析、方案设计、契约制定 | 用户需求 + /spec | Plan + Contract |
| **Developer** | 编码实现、代码提交 | Task 描述 | 代码 + 提交 |
| **Reviewer** | 代码审查、AC 验证 | 代码文件 | Review 报告 |

### 工作流程
```
用户需求 → /spec (需求规格) → /plan (任务分解) → /coding (开发实现) → /review (代码审核) → main 合并
```

---

## 6. 运行与依赖

### Todo 应用（前端）
- **运行环境**: 现代浏览器（Chrome ≥ 90, Firefox ≥ 90, Edge ≥ 90）
- **启动方式**: 直接在浏览器中打开 `src/web/todo/index.html`（待创建）
- **本地开发**: 只需文本编辑器 + Git 客户端
- **无需**: Node.js、Python、Docker、包管理器

### AI 协作试验（后端，按需）
```bash
# Python 虚拟环境（已存在 .venv/）
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 运行服务（待创建）
uvicorn src.api.main:app --reload

# 运行测试
pytest --cov=src tests/
```

### 依赖清单
| 文件 | 用途 |
|------|------|
| `requirements.txt` | fastapi, uvicorn, pydantic |
| `requirements-dev.txt` | pytest, pytest-cov, ruff, httpx |

---

## 7. 协作规则

### 流程规则
1. **契约优先**: 编码前必须完成 Spec → Plan → Contract 文档
2. **分支隔离**: 每次开发使用独立分支，禁止直接提交 `main`
3. **日志规范**: 通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
4. **上下文独立**: 每个 Hub 维护独立的分支和文档，不跨 Hub 共享状态

### 代码规范
- **Python**: 遵循 PEP 8，使用 `ruff` 检查
- **命名**: 类名 `PascalCase`，函数/变量 `snake_case`，常量 `UPPER_SNAKE_CASE`
- **类型**: 所有 Python 函数参数和返回值需加类型注解
- **测试**: 核心逻辑必须可测试，覆盖率不低于 80%

### 目录结构
```
test-repo/
├── .ai/                 # AI Agent 项目文档
│   └── about.md        # 项目宪法（本文档）
├── src/                 # 源代码
│   ├── core/           # 核心业务逻辑
│   ├── api/            # API 接口层
│   ├── models/         # 数据模型
│   ├── services/       # 服务层
│   ├── utils/          # 工具函数
│   └── web/            # 前端页面
├── tests/              # 测试代码
│   ├── unit/           # 单元测试
│   └── integration/    # 集成测试
├── docs/               # 文档
│   └── adr/            # 架构决策记录
├── ARCH.md             # 架构文档
├── requirements.txt    # 生产依赖
├── requirements-dev.txt # 开发依赖
└── LICENSE             # 许可证
```

---

## 8. 演进原则

1. **契约优先于实现** — 任何新功能必须先完成 Spec 和 Contract 再编码
2. **增量演进** — 新能力优先通过新增模块实现，不破坏现有模块边界
3. **简单优先** — 不做过度设计，够用就好；允许重构但避免预优化
4. **决策可追溯** — 架构决策通过 `docs/adr/` 记录，注明日期、背景、结论
5. **测试先行** — 核心逻辑变更必须伴随测试覆盖
6. **知识沉淀** — 实践经验定期归档到 `ARCH.md` 和本文件，形成团队记忆
