# About — 项目宪法

> 版本: v1.0
> 仓库: https://github.com/sensee-arch/test-repo

---

## 项目概述

test_repo 是一个实验性 AI Agent 协作编程的试验场。项目通过 Git 仓库协作的方式，让多个 AI Agent 在统一的架构规范下协同开发功能模块。

- 解决 AI Agent 在独立会话中无法共享上下文的问题，通过文件系统实现状态传递
- 解决多 Agent 协作中规范不统一的问题，通过本宪约定义服务与协作规则
- **不涉及**：生产环境部署、多租户、用户认证体系、高可用架构

---

## 核心目标

- 验证 AI Agent 协作编程工作流的可行性和效率
- 建立标准化需求→方案→任务→编码→评审 pipeline
- 沉淀可复用的 Agent 协作模板和项目规范
- 支持多 Hub 场景下的并行分支开发

❌ 明确拒绝的目标：
- 不追求性能基准或微基准优化
- 不实现自动化部署（CI/CD 仅做代码检查）
- 不做跨仓库的 Agent 协作

---

## 技术架构

### 架构风格
- **单体仓库模式（Monorepo）**: 所有功能模块在同一仓库中，按 `src/<domain>/<module>/` 组织
- **纯前端模块**: 零后端依赖，浏览器直接运行（如 Todo List）
- **可选后端模块**: FastAPI + SQLite，RESTful API 风格（非当前阶段）

### 核心组件
| 组件 | 职责 |
|------|------|
| Spec 文档 | 需求规格定义，AC 验收条件 |
| Plan 文档 | 技术方案与任务分解 |
| Contract 文档 | 执行契约——环境/接口/约束 |
| 功能代码 | 按任务独立提交至工作分支 |

### 数据流
```
用户需求 → /spec 生成规格 → /plan 任务分解 → /coding 实现 → Review 审核 → 合并
```

### 技术栈
- **语言**: JavaScript (ES6+)，Python 3.10+
- **存储**: localStorage（前端）/ SQLite（后端，可选）
- **工具**: Ruff（Python lint）、Vanilla JS（前端，零依赖）

---

## 基础契约

### 消息/数据格式
Agent 间的通信输出统一为 JSON：

```json
{
  "content": "群聊摘要消息",
  "status": "done",
  "action_log": "base64编码的详细操作日志"
}
```

### 错误语义
- `status: "done"` — 操作成功
- `status: "failed"` — 操作失败，需人工介入
- 失败时必须通过 `action_log` 记录完整错误详情

### 明确禁止的行为
- 禁止在 `content` 中暴露文件路径、Token、内部路径
- 禁止在 JSON 输出外添加注释/Markdown 代码块标记
- 禁止跳过自主修复步骤直接上报失败
- 禁止生成空 commit

---

## Agent 划分

| 名称 | 职责 | 输入 | 输出 |
|------|------|------|------|
| Javis（主持人） | 主持群聊、决策分发、阶段推进 | 用户需求 | 执行简报、阶段输出（Spec/Plan/Contract） |
| Worker | 编码实现、调试修复 | 任务描述 + Contract + 分支信息 | 功能代码、commit 提交 |
| Reviewer | 代码审查、AC 验证 [待补充] | 代码变更 | 审查报告 |

[待补充] Agent 注册与发现方式。

---

## 运行与依赖

### 运行环境
- **OS**: Linux / macOS / Windows
- **Node.js**: v24.13.1（当前环境）
- **Python**: 3.10.12（当前环境）
- **浏览器**: Chrome ≥ 90 / Firefox ≥ 90 / Edge ≥ 90

### 启动入口
- **前端单文件**: 浏览器直接打开 `file://` 路径
- **后端服务（如有）**: `uvicorn src.api.main:app --reload`

### 本地开发流程
1. `git checkout main && git pull`
2. 创建功能分支 `flyinghub-YYYYMMDDHHmmss`
3. 实现功能代码
4. 提交并推送（`git push -u origin <分支>`）

---

## 协作规则

### 日志规范
- `action_log` 必须 Base64 编码
- 遮蔽所有敏感信息（Token、Secret → `***`）
- 使用结构化 JSON 记录步骤描述

### 修改共享契约的前提条件
- 修改 `.ai/about.md` 必须独立 commit，message 以 `[Boot]` 开头
- 修改执行契约需与其他 Agent 协商一致

### 上下文传递规则
- 每个 Hub 的请求必须视为独立全新请求
- 分支名时间戳作为唯一标识，避免交叉引用

### 禁止行为
- 禁止未经验证就假设全局状态或引用历史记忆
- 禁止在 `content` 中使用 `"根据您的要求"` 等冗余措辞

---

## 演进原则

### 契约优先于实现
- Spec → Plan → Contract → Setup → Coding 的流程不可逆序
- 每个阶段输出需确认后再进入下一阶段

### 新能力优先通过新 Agent 实现
- 现有 Agent 职责明确后才扩展新 Agent
- 新 Agent 须先在预期文档中定义

### ADR 文档位置
- 架构决策记录（ADR）存放于 `docs/adr/` 目录
- 格式：`docs/adr/YYYYMMDD-<标题>.md`

[待补充] 更多演进细则。
