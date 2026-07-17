# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目是一个 **AI Agent 协作编程试验平台**，提供标准化的多 Agent 协作工作流
- 解决多个 AI Agent 在同一代码仓库中高效协作的流程、规范和技术问题
- 核心输出包括：协作规范模板、需求规格模板、技术方案模板和可复用的协作模式
- 本项目不涉及：用户数据存储、外部 API 集成、生产级应用部署、商业化运营

## 核心目标

- ✅ 建立完整的 AI Agent 协作流程：需求 → 规格 → 方案 → 任务 → 开发 → 审核 → 合并
- ✅ 沉淀标准化的协作模板（Spec / Plan / Contract / Task）
- ✅ 验证多 Agent 在 git 分支上的并行工作模式
- ✅ 记录 AI 辅助开发的实践经验，形成可复用的知识资产
- ✅ 支持灵活的技术栈选择，便于快速原型验证
- ❌ 不追求成为生产级框架或商业产品
- ❌ 不保证与特定 AI 平台（如 OpenClaw / Claude / ChatGPT）的兼容性

## 技术架构

- **架构风格**：文档驱动（documentation-driven），以 Markdown 文档作为协作契约
- **工作流组件**：
  - 群聊层：Hub 消息通道，用于需求提出、状态广播、结果反馈
  - 协定层：Spec (需求规格) → Plan (技术方案) → Contract (实现契约)
  - 执行层：Task 分配 → 编码实现 → Review 审核 → Merge 合并
  - 知识层：ARCH.md（架构文档）、about.md（项目宪法）、ADR（架构决策记录）
- **推荐技术栈**：Python 3.11+ / FastAPI / SQLite / pytest（可选，根据实际需求选择）
- **协作工具**：Git + GitHub + Hub（FlyingHub / 群聊通道）

## 基础契约

- 工作流顺序：需求 → /spec → /plan → /coding → /review，不可跳过
- 分支命名：`flyinghub-YYYYMMDDHHmmss`，每个 Hub 会话独立分支
- 文档格式：所有协定文档使用 Markdown，UTF-8 编码
- 日志规范：Agent 执行记录通过 `action_trace`（Base64 编码）保存
- 禁止行为：禁止跳过契约步骤直接编码；禁止跨 Hub 共享状态；
  禁止未经验证就假设历史记忆或全局上下文

### Agent 状态传递
```
用户需求 → [Manager] Spec Draft → [Manager] Plan → [Developer] Code → [Reviewer] Report
                                                  ↑ 每个步骤输出文件 + 群聊通知
```

## Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 编码实现、提交代码 | Task 描述 | 代码提交 |
| Reviewer | 代码审查、AC 验证 | 代码文件 | Review 报告 |

## 运行与依赖

- 运行环境：Git + GitHub（远程仓库），本地开发机
- 依赖清单：`requirements.txt`（生产依赖）、`requirements-dev.txt`（开发依赖）
- 可选运行时：Python 3.11+（若选择 Python 技术栈）
- 无需：Docker、数据库服务、云服务器、域名
- 许可证：MIT（见 LICENSE 文件）

## 协作规则

- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档
- **分支隔离**：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **日志规范**：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误
- **提交规范**：使用 `<type>: <description>` 格式（feat/fix/docs/refactor/test/chore）
- **自修复优先**：出现错误先尝试自动修复（重试、创建路径、检测依赖），失败后再上报
- **禁止**：未经验证就假设全局状态或历史记忆；跳过文档直接编码

## 演进原则

- **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract 再编码
- **增量演进**：新能力优先通过新增模块实现，不破坏现有模块边界
- **文档同步**：ARCH.md 和 about.md 随项目演进同步更新
- **实践驱动**：规范从实践中沉淀，不做过度设计
- **ADR 记录**：重要架构决策记录在 `docs/adr/` 目录下
