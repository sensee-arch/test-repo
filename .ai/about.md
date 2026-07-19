# .ai/about.md — AI Agent 项目宪法

> 本文档是 AI Agent 在不阅读全部源码的前提下理解项目的唯一权威来源。
> 任何重大变更必须先更新本文档，再修改代码。

---

## 一、项目概述

- **项目名称**：test-repo
- **定位**：AI Agent 协作编程的实验与验证项目。提供标准化的 AI 协作工作流（需求 → 方案 → 任务 → 开发 → 审核），用于演练和沉淀 AI Agent 软件工程最佳实践。
- **仓库地址**：https://github.com/sensee-arch/test-repo
- **初始化日期**：2026-06-28
- **项目阶段**：Scaffold / Bootstrap 阶段
- **源起**：作为 FlyingHub 平台的测试 Hub，通过真实的 Agent 多轮协作，验证多 Agent 分布式软件开发的可行性和效率。
- **不是**：生产级应用、面向终端用户的 SaaS 产品、有长期维护承诺的项目。

## 二、核心目标

### 当前阶段目标
- ✅ 建立标准化多 Agent 协作流水线（Spec → Plan → Contract → Coding → Review）
- ✅ 验证 Git 分支协作模式在多 Agent 场景下的可行性
- ✅ 沉淀可复用的 Agent 工作模板（需求规格、技术方案、契约、工单）
- ✅ 积累 AI Agent 在真实软件开发中的效率数据和经验

### 长期愿景
- 📌 探索从自然语言需求到可运行软件的端到端自动化
- 📌 建立 Agent 间质量互检机制（Code Review + AC 验证）
- 📌 形成一套面向 AI Agent 的软件工程方法论

### 不追求
- ❌ 用户认证与多租户
- ❌ 高并发与性能优化
- ❌ 完整的 CI/CD 流水线
- ❌ PWA / 离线能力 / 推送通知

## 三、技术架构

### 选型决策（当前层）

| 层级 | 选型 | 说明 |
|------|------|------|
| 后端框架 | FastAPI (Python 3.11+) | 异步、自动 OpenAPI 文档 |
| 运行服务器 | uvicorn | ASGI 生产级服务器 |
| 数据校验 | Pydantic v2 | 与 FastAPI 原生集成 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产候选） | 按需扩展 |
| 测试框架 | pytest + pytest-cov | 单元 + 集成测试 |
| 代码检查 | ruff | 格式化 + lint 合一 |
| HTTP 测试 | httpx | 异步 HTTP 客户端测试 |

### 架构风格
- RESTful API 后端 + 纯前端 SPA 分离
- 前后端通过 HTTP JSON 通信
- 数据库通过 Repository 模式解耦

### 项目结构（规划）
```
test-repo/
├── .ai/                 # AI Agent 项目宪法（本文件）
├── .agent/              # Agent 工作文件（计划、任务等）
├── docs/                # 文档（架构、ADR 等）
├── src/                 # 源代码
│   ├── core/           # 核心业务逻辑
│   ├── api/            # API 路由层
│   ├── models/         # Pydantic 数据模型
│   ├── services/       # 服务层
│   ├── repository/     # 数据访问层
│   └── tests/          # 测试代码
├── requirements.txt    # 生产依赖
├── requirements-dev.txt# 开发依赖
└── ARCH.md             # 架构说明
```

### 当前实际结构
```
test-repo/
├── .ai/about.md          # 本项目宪法
├── ARCH.md               # 架构文档
├── docs/adr/             # 架构决策记录（空）
├── docs/                 # 其他文档
├── requirements.txt      # FastAPI + uvicorn + pydantic
├── requirements-dev.txt  # pytest + ruff + httpx
├── LICENSE               # MIT
└── .venv/                # Python 虚拟环境
```

## 四、基础契约

### 数据契约
- 所有 API 使用 JSON 格式请求/响应
- 数据模型使用 Pydantic BaseModel 定义，包含类型注解
- 时间戳统一使用 Unix 毫秒时间戳（整数）
- 分页参数：`page`（从 1 开始）、`page_size`（默认 20，最大 100）
- 错误响应格式：`{"detail": "错误描述", "code": "ERROR_CODE"}`

### 命名契约
- Python 代码：PEP 8（类名 PascalCase，函数/变量 snake_case）
- 类型注解：所有函数参数和返回值必须有类型注解
- 常量：`UPPER_SNAKE_CASE`

### Git 契约
- 提交格式：`<type>: <描述>`（类型见 ARCH.md）
- 分支命名：`flyinghub-YYYYMMDDHHmmss`（FlyingHub 标准）
- 特性分支从 main 创建，完成后 PR 合入 main

### 安全契约
- 禁止使用 `innerHTML` / `dangerouslySetInnerHTML` 渲染用户输入
- 禁止 `eval()` / `new Function()` / 脚本动态执行
- 数据持久化需兜底异常（降级打印警告，不抛出未捕获异常）

### 日志契约
- Agent 操作需记录 `action_log`（Base64 编码的 JSON 对象）
- 包含字段：timestamp、agent_id、action、status、error（可选）

## 五、Agent 划分

| 角色 | 职责 | 输入 | 输出 | 触发时机 |
|------|------|------|------|----------|
| **Host** | 群聊主持，欢迎/状态广播/结果通报 | 用户消息 | 群聊消息 | 每次 Agent 激活 |
| **Manager** | 需求分析、方案设计、契约制定 | 用户需求 + Spec 模板 | Plan + Contract | 需求输入后 |
| **Developer** | 编码实现、测试编写、代码提交 | Task 描述 + Contract | Git Commit | 任务分配后 |
| **Reviewer** | 代码审查、AC 验证、报告生成 | Commit 代码 | Review 报告 | 提交完成后 |
| **QA** | 集成测试、端到端验证 | 应用 URL | 测试报告 | Review 通过后 |

### 协作流程
```
用户需求
  → [Manager] Spec（需求规格）
  → [Manager] Plan（技术方案 + 任务分解）
  → [Manager] Contract（接口契约）
  → [Developer] Coding（编码 + 测试）
  → [Reviewer] Review（代码审查 + AC 验证）
  → [QA] E2E Test（端到端验证）
  → [Host] 结果广播
```

## 六、运行与依赖

### 开发环境
- Python 3.11+（推荐 3.12）
- Git（已配置 GitHub Token 或 SSH Key）
- 现代浏览器（用于前端开发）

### 启动方式
```bash
# 1. 进入项目
cd ~/.openclaw/workspace/test-repo

# 2. 激活虚拟环境
source .venv/bin/activate

# 3. 运行 FastAPI 开发服务器
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

# 4. 访问 http://localhost:8000/docs 查看 API 文档
```

### 依赖管理
- `requirements.txt`：生产依赖（fastapi, uvicorn, pydantic）
- `requirements-dev.txt`：开发依赖（pytest, ruff, httpx）
- 虚拟环境：`.venv/`（已创建）
- 安装命令：`pip install -r requirements.txt -r requirements-dev.txt`

### 测试与质量
```bash
# 运行测试
pytest --cov=src tests/

# 代码检查
ruff check src/
ruff format src/
```

### 无需
- ❌ Docker（本地开发阶段暂不容器化）
- ❌ Node.js / npm（当前阶段不使用前端构建工具）
- ❌ 数据库服务端（SQLite 可直接使用）

## 七、协作规则

### 上下文规则
- 每个 Hub 实例独立维护自己的分支和文档
- 不跨 Hub 共享状态或假设历史记忆
- 所有 Agent 工作产物必须写入 Git 仓库

### 文档规则
- 契约优先：编码前必须先完成 Spec → Plan → Contract
- 文档即代码：`.ai/about.md` 和 `ARCH.md` 必须随项目演进同步更新
- ADR 记录在 `docs/adr/`：任何架构变更必须记录决策上下文（Context、Decision、Consequences）

### 沟通规则
- 状态广播使用统一 prefix：🚀 [Boot]、📋 [Plan]、📝 [Contract]、💻 [Coding]、👀 [Review]
- 错误上报使用标准格式：目标 + 痕迹 + 已尝试 + 判定依据
- 禁止群聊中的冗余闲聊，只发送有信息量的消息

### 重试与容错规则
- 网络操作自动重试 2-3 次
- Git 操作前先 pull / fetch 确保最新
- 合并冲突：git add 解决后继续
- 低级错误（目录不存在、命令未找到）先自修复再上报

## 八、演进原则

### 设计原则
1. **简单优先** — 不做过度设计，够用就好
2. **契约驱动** — 接口即契约，编码先定约
3. **渐进增强** — 新能力通过新增模块实现，不破坏现有模块边界
4. **可测试性** — 核心逻辑必须可测试

### 分支演进
- main：始终保持稳定、可工作状态
- 特性分支：每个功能独立分支，完成后合入 main
- 分支清理：合入后远程特性分支可删除

### 文档演进
- `.ai/about.md` 随项目阶段更新（Bootstrap → Development → Mature → Archive）
- `ARCH.md` 随架构变更更新
- ADR 记录重大决策，永久保留

### 治理
- 项目无长期维护承诺
- 主要用于 FlyingHub 平台的 AI Agent 协作实验
- 实验性质优先于代码质量最优

---

*版本: v2 — 2026-07-19*
*上次更新: 全面重写，对齐当前 FastAPI 脚手架阶段*
