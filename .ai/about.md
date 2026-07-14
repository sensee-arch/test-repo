# About

> AI Agent Project Constitution

---

## 项目概述

- **项目名称**: test-repo
- **一句话描述**: AI Agent 协作编码实验场，通过多 Agent 自动化流程实现 Web 应用开发。
- **解决的问题**: 验证多 Agent（主持人、Manager、Developer）协作流程在真实 git 仓库上的可行性，从需求到代码的全生命周期。
- **明确不做的**:
  - 不是面向最终用户的生产项目
  - 不涉及部署、运维或 CI/CD 管道
  - 不包含自动化测试或端到端测试
  - 不生成 API 端点细节或参数表

## 核心目标

- 完成至少 1 个完整 Web 应用的端到端开发（Spec → Plan → Contract → Setup → Coding → Review → Summary）
- 所有代码变更必须通过独立分支推送至远程仓库
- 每个功能增量必须对应独立 git commit，消息前缀格式统一
- 代码必须通过 Review 阶段后方可进入 Summary
- ❌ 不追求高并发、高可用或生产级部署

## 技术架构

- **架构风格**: 单体单页应用（SPA），零后端依赖
- **核心组件**:
  - 前端层：HTML + CSS + JavaScript（ES6+），单文件 `index.html`
  - 持久化层：浏览器 localStorage，key `todo_items`
  - 状态管理层：全局 JS 对象 `state = { todos: [], filter: 'all' }`
- **通信方式**: 无网络通信，所有逻辑在浏览器单进程中执行
- **技术栈**: HTML5 / CSS3 / Vanilla JavaScript ES6+ / localStorage

## 基础契约

- **数据格式**: TodoItem JSON 结构
  ```json
  {
    "id": "string",
    "title": "string",
    "completed": "boolean",
    "createdAt": "number"
  }
  ```
- **存储 Key**: `todo_items`（localStorage）
- **错误语义**: 全部静默捕获，console.warn 记录，不抛异常
- **禁止行为**:
  - 禁止使用 `innerHTML` 渲染用户输入
  - 禁止使用 `eval()` 或 `new Function()`
  - 禁止修改 `.git` 目录或仓库配置
  - 禁止路径穿越到工作区之外

## Agent 划分

| Agent | 职责 | 输入来源 | 输出去向 |
|-------|------|----------|----------|
| 主持人 | 创建 Hub、发送欢迎消息、协调流程 | 用户指令 | 群聊消息 |
| Manager | 生成 Spec/Plan/Contract、分配任务 | 主持人指令 | 代码仓库 + 群聊 |
| Developer | 执行编码任务、提交代码 | Manager 分配的 Task | git commit |
| Reviewer | 代码审查、验收 | Developer 提交的代码 | Review Report |

## 运行与依赖

- **运行环境**: 浏览器（Chrome ≥ 90 / Firefox ≥ 90 / Edge ≥ 90）
- **启动方式**: 直接打开 `src/web/todo/index.html`
- **依赖**: 零外部依赖，无 npm/pip，无需后端
- **本地开发**: 任意文本编辑器修改 `index.html`，浏览器刷新即生效

## 协作规则

- **日志规范**: 每条 Agent 消息需带阶段标签前缀（如 [Boot]、[Coding]、[Review]）
- **契约修改**: 修改 Shared Base Contract 前必须经过 Review 同意
- **上下文传递**: Agent 之间不共享运行时状态，所有持久状态通过 localStorage 和 git 传递
- **禁止行为**: 未经验证不得假设全局状态或 localStorage 中存在特定数据

## 演进原则

- **契约优先**: 先定义接口和数据格式，再实现代码
- **新 Agent 优先**: 新能力优先通过新增 Agent 角色实现，不修改已有 Agent 职责
- **ADR 位置**: `ARCH.md`（仓库根目录）
