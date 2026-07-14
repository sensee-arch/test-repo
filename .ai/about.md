# About — 项目宪法

> 更新日期: 2026-07-14
> 分支: flyinghub-20260714140640

---

## 项目概述

- 本项目（test_repo）是一个 AI Agent 协作编程的试验场，用于验证和沉淀多 Agent 协作开发工作流。
- 解决的问题：标准化 AI Agent 从需求到代码的协作流程，建立可复用的协作模板与规范。
- 不做的事情：
  - 不面向最终用户提供产品级服务
  - 不追求生产级性能或高可用部署
  - 不依赖复杂基础设施（Kubernetes、消息队列等）

## 核心目标

- ✅ 建立并验证完整的 AI Agent 协作流水线：需求 → 方案 → 任务 → 编码 → 审核 → 合并
- ✅ 构建至少一个可运行的示例功能（当前规划：Web Todo List）
- ✅ 沉淀可迁移的 Agent 协作规范与文档模板
- ✅ 所有关键决策以 ADR 文档记录
- ❌ 不追求代码覆盖率指标
- ❌ 不作为生产系统的参考实现

## 技术架构

- **架构风格**：单体前端应用（当前规划）+ 可选 API 后端
  - Web Todo List：单页应用（SPA），所有逻辑内聚在单一 HTML 文件
  - 后端（可选扩展）：FastAPI RESTful API
- **核心组件**：
  - `src/web/todo/index.html` — 待办事项前端（HTML + CSS + Vanilla JS）
  - `src/api/` — [待补充] 后端 API
  - `src/core/` — [待补充] 核心业务逻辑
- **通信方式**：
  - 前端：localStorage API（同步，同域）
  - 后端：HTTP/REST（JSON），待补充
- **技术栈**：
  - 语言：Python 3.11+ / JavaScript (ES6+)
  - Web 框架：FastAPI（若启用后端）
  - 数据库：localStorage（前端）/ [待补充] 后端存储
  - 测试：pytest + pytest-cov + httpx
  - 代码检查：ruff
  - 依赖管理：pip + requirements.txt

## 基础契约

- **消息格式**：JSON，所有 API 请求/响应体使用 application/json
  ```json
  {"id": "abc123", "title": "待办事项", "completed": false, "createdAt": 1700000000000}
  ```
- **错误语义**：
  - HTTP 4xx：客户端错误，响应体包含 `{"error": "描述", "code": "ERROR_CODE"}`
  - HTTP 5xx：服务端错误，不允许向客户端传播内部堆栈
- **幂等性保证**：[待补充]
- **禁止的行为**：
  - 禁止在 API 响应中返回明文密码或密钥
  - 禁止在前端存储敏感信息
  - 禁止使用 `eval()` 或动态代码执行

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| **Spec Agent** | 编写需求规格说明书 | 用户自然语言输入 | 输出 `.ai/spec-*.md` 文档 |
| **Plan Agent** | 技术方案与任务分解 | 规格说明书 | 输出 `tech_plan_*.md` + 任务列表 |
| **Dev Agent** | 功能实现与测试 | 任务列表 + 项目文档 | 提交代码到功能分支 |
| **Review Agent** | 代码评审与合并 | 功能分支 PR | 合并到 main 或打回修改 |

- Agent 注册与发现：通过 `.agent/` 目录下的工作文件进行状态传递，无独立注册中心。

## 运行与依赖

- **运行环境**：Python 3.11+，现代浏览器（Chrome/Firefox/Edge 最新版）
- **启动入口**：
  - Web Todo List：直接用浏览器打开 `src/web/todo/index.html`
  - API 后端（待实现）：`uvicorn src.api.main:app --reload`
- **本地开发流程**：
  1. `python -m venv venv && source venv/bin/activate`
  2. `pip install -r requirements.txt && pip install -r requirements-dev.txt`
  3. 修改代码后运行 `ruff check .` 检查代码风格
  4. 运行 `pytest` 执行测试

## 协作规则

- **日志规范**：Agent 工作日志写入 `.agent/` 目录下的同名文件，使用 Markdown 格式
- **修改共享契约**：必须先更新 `.ai/about.md` 对应的章节，然后通知所有在线 Agent 重新加载
- **上下文传递**：Agent 间通过 `.agent/` 目录中的 JSON/Markdown 文件传递状态与决策
- **禁止**：
  - 禁止未经验证就假设全局变量、文件系统或外部服务的状态
  - 禁止在未通知其他 Agent 的情况下修改共享文件

## 演进原则

- **契约优先于实现**：任何代码变更须先有对应的规范或契约文档
- **新能力优先通过新 Agent 实现**：不修改现有 Agent 的核心职责，而是通过新增 Agent 扩展能力
- **ADR 文档位置**：`docs/adr/` 目录，格式 `YYYY-MMDD-标题.md`
