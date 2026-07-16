# .ai/about.md — AI Agent Project Constitution

## 项目概述

- **项目名称**: test_repo
- **仓库**: https://github.com/sensee-arch/test-repo
- **许可证**: MIT (2026 sensee-arch)
- **定位**: 实验性/测试项目，提供灵活的 AI Agent 协作编程试验场，验证和演练多 Agent 协同工作流
- **主要模块**: Web Todo List 单页应用（SPA），纯 HTML5/CSS3/Vanilla JavaScript ES6+ 构建
- **规划能力**: FastAPI 后端、RESTful API、SQLite/PostgreSQL 存储（见 requirements.txt）
- **不涉及**: 用户认证系统、后端服务、API 接口、多端数据同步、PWA/离线能力、CI/CD 部署流水线

## 核心目标

- ✅ 提供 AI Agent 协作编程试验场，沉淀可复用协作模板
- ✅ 实现 Web Todo List SPA：完整的 CRUD 功能（创建、读取、更新、删除待办事项）
- ✅ 支持完成状态切换和视觉反馈（删除线、透明度变化）
- ✅ 支持按全部/活跃/已完成三种视图过滤
- ✅ 数据通过浏览器 localStorage 持久化，刷新不丢失
- ✅ 零外部依赖，单文件部署，打开即用
- 🚧 验证 FastAPI + SQLite/PostgreSQL 后端技术栈的快速原型
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知

## 技术架构

### 当前架构（已实现）

- **架构风格**: 单体 SPA（Single-Page Application）
- **前端**: HTML5 + CSS3 + Vanilla JavaScript ES6+
- **存储**: 浏览器 localStorage API
- **核心组件**:
  - HTML 模板层：页面结构（输入框、列表容器、底部控制栏）
  - CSS 样式层：布局、组件状态、响应式适配
  - JavaScript 逻辑层：存储模块 → 状态管理 → 渲染函数 → 事件处理
- **通信方式**: 函数内部调用（同步），无网络通信

### 规划架构

- **后端**: FastAPI + Uvicorn (Python 3.11+)
- **数据模型**: Pydantic v2
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **API 风格**: RESTful
- **测试框架**: pytest + pytest-cov
- **代码规范**: Ruff (PEP 8)
- **包管理**: pip + requirements.txt

### 目录结构

```
test-repo/
├── .ai/                  # AI Agent 项目认知文件
│   └── about.md         # 本文件 — 项目宪法
├── src/                  # 源代码
│   ├── web/
│   │   └── todo/        # Todo List SPA
│   ├── core/            # （规划）核心业务逻辑
│   ├── api/             # （规划）API 接口层
│   ├── models/          # （规划）数据模型
│   ├── services/        # （规划）服务层
│   └── utils/           # （规划）工具函数
├── tests/               # （规划）测试代码
├── docs/                # （规划）文档
├── scripts/             # （规划）辅助脚本
├── ARCH.md              # 架构文档
├── LICENSE              # MIT 许可证
├── requirements.txt     # 生产依赖（FastAPI, Uvicorn, Pydantic）
├── requirements-dev.txt # 开发依赖（pytest, ruff, httpx）
```

## 基础契约

### 数据格式（Todo 项）

所有待办项为 JSON 对象：

```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，`Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` |
| title | string | 是 | 待办内容，去除首尾空格后不可为空字符串 |
| completed | boolean | 是 | 完成状态，默认 false |
| createdAt | number | 是 | 创建时间戳（毫秒） |

### 存储约定

- 键名：`todo_items`
- 值：JSON 序列化的待办项数组
- 默认值：`[]`（空数组）
- 错误处理：读取失败返回 `[]`，写入失败 `console.warn`

### 应用状态

```javascript
const state = {
  todos: [],        // 所有待办项
  filter: 'all'     // 'all' | 'active' | 'completed'
}
```

### 安全约束

- 禁止使用 `innerHTML` 渲染用户输入内容（XSS 防护）
- 禁止 `eval()` 或 `new Function()`
- 禁止修改待办列表容器之外的 DOM
- 所有用户输入必须通过 textContent 或 text 节点方式渲染

### Git 提交规范

```
<type>: <简短描述>

<详细说明（可选）>
```

提交类型：`feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `style`

### 分支策略

- `main` — 稳定主分支，始终保持可部署状态
- `flyinghub-YYYYMMDDHHmmss` — 功能开发分支（按日期命名）
- 功能开发完成后合并到 `main`

### 编码规范（Python 规划）

- PEP 8，使用 `ruff` 检查
- 类名: `PascalCase`，函数/方法: `snake_case`，常量: `UPPER_SNAKE_CASE`，私有: `_prefix`
- 所有函数参数和返回值需加类型注解

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户消息 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

### 工作流程

```
用户需求 → /spec (Manager: Spec 生成) → /plan (Manager: 技术方案 + 任务分解) → /coding (Developer: 编码实现) → Reviewer: 代码审查 → 合并到 main
```

## 运行与依赖

### 当前（前端）

- **运行环境**: 现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90）
- **启动方式**: 浏览器直接打开 `src/web/todo/index.html`
- **本地开发**: 文本编辑器 + Git 客户端
- **无需**: Node.js、Python、Docker、包管理器、构建工具

### 规划（后端 Python）

- **运行环境**: Python 3.11+
- **虚拟环境**: `python -m venv venv && source venv/bin/activate`
- **安装依赖**: `pip install -r requirements.txt && pip install -r requirements-dev.txt`
- **启动服务**: `uvicorn src.api.main:app --reload`

## 协作规则

- **日志规范**: 通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误
- **契约优先**: 编码前必须先完成 Spec → Plan → Contract 文档
- **上下文隔离**: 每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **禁止行为**: 未经验证就假设全局状态或历史记忆
- **代码评审**: 关键逻辑变更需至少一个 Agent 审核
- **安全约束**: 数据输出必须屏蔽 Token/Secret；禁止 `../` 路径穿越；单次下载不超过 100MB

## 演进原则

- **契约优先于实现**: 任何新功能必须先完成 Spec 和 Contract 再编码
- **简单优先**: 不做过度设计，够用就好
- **可替换性**: 组件间通过接口解耦，便于替换
- **增量扩展**: 新能力优先通过新增模块实现，不破坏现有模块边界
- **自适应**: 随着项目实体模块的增多，本宪法应随之演进更新
