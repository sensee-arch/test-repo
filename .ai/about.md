# About

> AI Agent Project Constitution

---

## 项目概述

- **项目名称**: test-repo
- **一句话描述**: AI Agent 协作编码实验场，通过多 Agent 自动化流程实现 Web 应用开发。
- **解决的问题**: 验证多 Agent（主持人、Manager、Developer）协作流程的可行性，在真实 git 仓库上完成从需求到代码的全生命周期。
- **明确不做的**:
  - 不是面向最终用户的生产项目
  - 不涉及部署、运维或 CI/CD 管道
  - 不生成 API 端点细节或参数表
  - 不包含自动化测试或端到端测试

## 核心目标

- 验证多 Agent 协作编码流程（Boot → Spec → Plan → Contract → Setup → Coding → Review → Summary）的完整闭环
- 在 `test-repo` 上实现一个单文件 Web Todo List 应用（HTML/CSS/JS + localStorage）
- 实现过程必须遵守零外部依赖、纯前端、单文件交付的约束
- 所有代码变更通过 git 提交到 `flyinghub-*` 分支，且必须推送至远程
- ❌ 不引入任何构建工具、包管理器或后端运行时
- ❌ 不部署、不发布、不运行

## 技术架构

- **架构风格**: 单体单页应用（SPA），全部代码位于单一 HTML 文件
- **核心组件及职责**:
  - HTML 结构: 语义化标记载体（标题、输入框、列表、筛选栏、页脚）
  - CSS 样式: Flexbox 布局 + CSS3 动画，零外部样式
  - JavaScript 逻辑: 状态管理 + localStorage 存取 + DOM 操作
  - localStorage: 持久化存储层，key `todo_items`
- **通信方式**: 同步。JS 内存 `todos[]` 数组 ↔ `localStorage.setItem/getItem`，DOM 渲染为单向数据流
- **技术栈**:
  - 语言: HTML5, CSS3, Vanilla ES6+
  - 框架: 无
  - 数据库: 无（使用浏览器 localStorage）
  - 消息队列: 无

## 基础契约

- **消息/数据格式**: 单个 Todo 项必须是合法 JSON 对象:
  ```json
  {
    "id": "lorem-ipsum",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": 1800000000000
  }
  ```
- **数组格式**: `todos` 是上述对象的数组
- **错误语义**:
  - localStorage 读取失败 → 静默降级返回 `[]`
  - JSON 解析失败 → 静默降级返回 `[]`
  - localStorage 写入异常（QuotaExceededError）→ 静默忽略，console.warn 记录
- **幂等性保证**: `saveTodos()` 是全量覆盖写入，无增量合并；`toggleTodo(id)` 是幂等的
- **明确禁止**:
  - 禁止使用 `eval()` 或 `new Function()`
  - 禁止将用户输入通过 `innerHTML` 渲染（必须使用 `textContent` 或 `escapeHtml()`）
  - 禁止直接操作 `.git` 目录或仓库配置
  - 禁止在代码中包含 Token、Secret 等凭证

## Agent 划分

| Agent | 职责 | 输入来源 | 输出去向 |
|-------|------|---------|---------|
| 主持人 | 欢迎致辞、群聊氛围维护 | FlyingHub 群消息 | 群聊消息 |
| Manager | 工作流程编排、任务分配 | 用户 / 系统指令 | Developer、群聊 |
| Developer | 编码实现、代码提交 | Manager 分配的 TASK | git commit、群聊 |
| Reviewer | 代码审查、质量把关 | Developer 的代码输出 | 评审意见、fix_items |

## 运行与依赖

- **运行环境要求**: 仅浏览器（Chrome / Firefox / Edge ≥ 90 版本），无需 Node.js、Python 或其他后端运行时
- **启动入口**: 浏览器打开 `src/web/todo/index.html` 即可运行
- **本地开发与调试流程**:
  1. 任何 Agent 修改代码前必须先 `git checkout` 到正确的分支
  2. 修改后必须 `git add && git commit && git push`
  3. 每次 push 前必须 `git pull` 处理可能的冲突
  4. 代码审查通过后方可进入下一阶段

## 协作规则

- **日志规范**:
  - Agent 内部操作日志使用 JSON 格式，base64 编码后通过 `action_log` 字段传递
  - 群聊消息使用自然语言，禁止暴露内部路径、Token、错误堆栈
- **修改共享契约的前提条件**:
  - 修改 `.ai/about.md` 必须经主持人确认
  - 修改分支命名规则、提交信息格式等集体约定需要群聊表决
- **上下文传递规则**:
  - Manager 向 Developer 传递 TASK 时，必须包含 `task_doc` 的 base64 编码全文
  - Developer 完成 TASK 后，必须返回 commit hash 和变更摘要
  - Reviewer 发现 P0/P1 问题时，必须通过 `fix_items` 数组传递修复清单
- **禁止未经验证就假设全局状态**: 每个 Agent 在启动时都必须先通过 `git pull && git status` 确认当前分支和最新状态

## 演进原则

- **契约优先于实现**: `.ai/about.md` 中定义的条款优先于任何 Agent 的临时决策
- **新能力优先通过新 Agent 实现**: 如需新增职责，应新增 Agent 角色而非扩展现有 Agent 的职责边界
- **ADR（架构决策记录）**: 所有架构决策记录在 `ARCH.md` 中。新增决策须追加写入 `ARCH.md` 并提交
