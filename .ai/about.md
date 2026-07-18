# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目是一个 **AI Agent 协作编程试验场**，旨在通过 git 仓库协作让多个 AI Agent 在统一架构规范下协同工作
- 解决的核心问题：验证 AI Agent 协作编程工作流，建立标准化的 AI 项目协作流程（需求 → 方案 → 任务 → 开发 → 审核），探索可复用的协作模板与规范
- 技术栈：Python 3.11+ / FastAPI / Pydantic / SQLite
- 仓库：https://github.com/sensee-arch/test-repo
- 许可：MIT License

## 核心目标

- ✅ 验证和演练 AI Agent 协作编程工作流
- ✅ 建立标准化协作流程：需求规格 → 技术方案 → 任务分解 → 开发实现 → 代码审查
- ✅ 沉淀可复用的 AI Agent 协作模板（Spec / Plan / Contract / Task）
- ✅ 记录和整理 AI 辅助开发的实践经验与避坑指南
- ❌ 不追求生产级稳定性或性能优化
- ❌ 不涉及用户认证、多租户、分布式部署

## 技术架构

- **架构风格**：轻量级 RESTful API 单体应用
- **核心组件**：
  - FastAPI 应用层：路由定义、请求/响应处理
  - Pydantic 模型层：数据模型定义与校验
  - 服务层（services）：业务逻辑封装
  - 存储层：SQLite + 可选 ORM
- **通信方式**：HTTP/JSON（REST API）、函数内部同步调用
- **技术栈**：Python 3.11+ / FastAPI / Uvicorn / Pydantic v2 / pytest / Ruff

## 基础契约

- 数据格式：所有接口使用 JSON 序列化，遵循 Pydantic 模型定义
- API 设计：RESTful 风格，路径使用小写蛇形（`/api/v1/items`）
- 错误语义：统一返回 `{"detail": "error message"}`，HTTP 状态码区分错误类型
- 禁止行为：禁止使用 `eval()` 或动态执行用户输入；禁止硬编码敏感信息
- 代码规范：PEP 8 风格，Ruff 检查，函数参数和返回值必须有类型注解
- 提交规范：`<type>: <描述>` — `feat`/`fix`/`docs`/`refactor`/`test`/`chore`/`style`

### JSON 示例
```json
{
  "id": "m3xq8f2k1a",
  "name": "example_item",
  "description": "An example data item",
  "created_at": 1720000000000
}
```

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

```bash
# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt   # fastapi, uvicorn, pydantic
pip install -r requirements-dev.txt  # pytest, ruff, httpx

# 运行开发服务器
uvicorn src.main:app --reload

# 运行测试
pytest --cov

# 代码检查
ruff check .
```

- **无需**：Docker、Node.js、数据库客户端安装（SQLite 为内置）
- **启动方式**：Uvicorn 开发服务器

## 协作规则

- 分支命名：`flyinghub-YYYYMMDDHHmmss`（按时间戳命名）
- 契约优先：编码前必须先完成 Spec → Plan → Contract 文档（存放于 `.agent/YYYYMMDDHH-<feature>/`）
- 日志规范：通过 action_log / task_output.json 记录操作步骤和结果
- 上下文隔离：每个 Hub 独立维护分支和文档，不跨 Hub 共享状态
- 禁止：未经验证就假设全局状态或历史记忆，必须从文件读取当前最新状态

## 演进原则

- 契约优先于实现：任何新功能必须先完成 Spec 和 Contract 再编码
- 新能力优先通过新增模块实现，不破坏现有模块边界
- ADR 位置：`docs/adr/` — 架构决策记录存放于此目录
- 技术栈决策坚持"简单优先、可替换性、测试驱动"
