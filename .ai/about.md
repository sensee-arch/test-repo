# .ai/about.md — AI Agent Project Constitution

## 1. 项目概述

- 本项目是一个 **Web Todo List 单页应用（SPA）**，使用纯 HTML/CSS/JavaScript 构建，单文件可部署
- 解决用户在日常任务管理中快速记录、跟踪和完成待办事项的需求，无需安装任何软件或依赖
- 所有数据通过浏览器 `localStorage` 持久化，页面刷新不丢失
- 仓库地址：https://github.com/sensee-arch/test-repo
- 主要编程语言：HTML5、CSS3、Vanilla JavaScript (ES6+)
- 不涉及：用户认证、后端服务、数据库、API 接口、分页、标签分类、自动化测试、CI/CD 部署

## 2. 核心目标

- ✅ 完整的 CRUD 功能：创建、读取、更新、删除待办事项
- ✅ 完成状态切换与视觉反馈（删除线、透明度变化）
- ✅ 按全部/活跃/已完成三种视图过滤
- ✅ 通过 `localStorage` 持久化数据，刷新不丢失
- ✅ 零外部依赖，单文件部署，浏览器打开即可使用
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知
- ❌ 不追求多用户或权限管理

## 3. 技术架构

- **架构风格**：单体 SPA（Single-Page Application），所有逻辑在单个 HTML 文件中完成
- **核心分层**：
  - **HTML 模板层** — 页面结构：输入框、待办列表容器、底部控制栏（统计+过滤+清除）
  - **CSS 样式层** — 布局（Flexbox/Grid）、组件状态（完成/编辑/悬停）、响应式适配
  - **JavaScript 逻辑层** — 四层模块：存储层（Storage）→ 数据管理层（Model）→ 渲染层（View）→ 事件控制器（Controller）
- **通信方式**：函数内部调用（同步），无网络通信
- **技术栈**：HTML5 + CSS3 + Vanilla JavaScript ES6+，`localStorage` API

## 4. 基础契约

- **数据格式**：每个待办项为 JSON 对象，字段为 `id`（字符串）、`title`（字符串）、`completed`（布尔）、`createdAt`（数字时间戳）
- **存储键名**：`todo_items`，值为 JSON 对象数组的 JSON 字符串
- **错误处理**：`localStorage` 操作失败时静默降级（`console.warn`），不抛出异常
- **禁止行为**：
  - 禁止使用 `innerHTML` 渲染用户输入内容（防止 XSS）
  - 禁止使用 `eval()` 或 `new Function()`
  - 禁止修改待办列表容器之外的 DOM
- **编码规范**：
  - 使用 `const`/`let`，不使用 `var`
  - 函数使用 `function` 声明或箭头函数，不使用类继承
  - 字符串使用反引号模板字面量
  - 注释使用单行 `//`，关键逻辑标注 TODO/FIXME

### JSON 示例
```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

## 5. Agent 划分

| 名称 | 职责 | 输入来源 | 输出去向 |
|------|------|----------|----------|
| Host | 群聊主持人，发送欢迎/状态广播 | 用户 | 群聊 |
| Manager | 需求分析、方案设计、契约制定、Spec/Plan/Contract 文档编写 | 用户需求、Spec 模板 | Plan、Contract |
| Developer | 编码实现、代码提交、文件修改 | Task 描述、Contract | 代码提交 |
| Reviewer | 代码审查、AC 验证、质量标注 | 代码文件、Contract | Review 报告 |

**文档流转顺序**：Spec → Plan → Contract → Code → Review，每步必须在上一步完成后开始。

## 6. 运行与依赖

- **运行环境**：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90、Safari ≥ 15）
- **启动方式**：直接在浏览器中打开 `src/web/todo/index.html`
- **本地开发**：仅需文本编辑器（如 VSCode） + Git 客户端
- **无需安装**：Node.js、Python、Docker、包管理器、构建工具、编译步骤
- **项目路径**：`src/web/todo/` 目录下存放所有源代码
- **文件结构**：
  - `src/web/todo/index.html` — 主入口文件（含全部 HTML/CSS/JS）
  - 支持未来拆分为独立 CSS 和 JS 文件

## 7. 协作规则

- **日志规范**：通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档流程
- **上下文隔离**：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **禁止假设**：不允许未经验证就假设全局状态、历史记忆或跨会话上下文
- **Git 分支规范**：新分支从 `main` 创建，命名格式 `flyinghub-YYYYMMDDHHmmss`
- **提交规范**：使用语义化提交消息（`feat:`、`fix:`、`docs:`、`refactor:` 等）
- **输出规范**：用户可见输出带阶段前缀（`[Boot]`、`[Plan]`、`[Coding]`、`[Review]` 等），内部跟踪记录使用 Base64 编码的 `action_trace`

## 8. 演进原则

- **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract 再编码
- **渐进增强**：新能力优先通过新增模块实现，不破坏现有模块边界
- **向后兼容**：存储格式变更必须提供迁移逻辑，确保旧数据可读取
- **ADR 位置**：`docs/adr/` 目录下存储架构决策记录（待创建）
- **重构原则**：如有重构必要，必须单独提交，不与功能开发混合
- **版本管理**：主版本号对应不兼容 API 变更，次版本号对应向下兼容的新功能，补丁号对应 Bug 修复
