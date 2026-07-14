# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目是一个 Web Todo List 单页应用（SPA），使用纯 HTML/CSS/JavaScript 构建
- 解决用户在日常任务管理中快速记录、跟踪和完成待办事项的需求，无需安装任何软件
- 本项目不涉及：用户认证、后端服务、数据库、API 接口、分页、标签分类、自动化测试、CI/CD 部署

## 核心目标

- ✅ 实现完整的 CRUD 功能：创建、读取、更新、删除待办事项
- ✅ 支持完成状态切换和视觉反馈（删除线、透明度变化）
- ✅ 支持按全部/活跃/已完成三种视图过滤
- ✅ 数据通过浏览器 localStorage 持久化，刷新不丢失
- ✅ 零外部依赖，单文件部署，打开即用
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知

## 技术架构

- **架构风格**：单体 SPA（Single-Page Application）
- **核心组件**：
  - HTML 模板层：页面结构（输入框、列表容器、底部控制栏）
  - CSS 样式层：布局、组件状态、响应式适配
  - JavaScript 逻辑层：存储模块 → 状态管理 → 渲染函数 → 事件处理
- **通信方式**：函数内部调用（同步），无网络通信
- **技术栈**：HTML5 + CSS3 + Vanilla JavaScript ES6+，localStorage API

## 基础契约

- 数据格式：所有待办项为 JSON 对象，包含 `id`（字符串）、`title`（字符串）、`completed`（布尔）、`createdAt`（数字时间戳）
- 存储键名：`todo_items`，值为此 JSON 对象数组的字符串序列
- 错误语义：localStorage 操作失败时静默降级（`console.warn`），不抛出异常
- 禁止行为：禁止使用 `innerHTML` 渲染用户输入内容；禁止 `eval()` 或 `new Function()`；禁止修改待办列表容器之外的 DOM

### JSON 示例
```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
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

- 运行环境：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90）
- 启动方式：直接在浏览器中打开 `src/web/todo/index.html`
- 本地开发：只需文本编辑器 + Git 客户端
- 无需：Node.js、Python、Docker、包管理器、构建工具

## 协作规则

- 日志规范：通过 `action_log`（Base64 编码 JSON）记录操作步骤和错误
- 契约优先：编码前必须先完成 Spec → Plan → Contract 文档
- 上下文传递：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- 禁止：未经验证就假设全局状态或历史记忆

## 演进原则

- 契约优先于实现：任何新功能必须先完成 Spec 和 Contract 再编码
- 新能力优先通过新增模块实现，不破坏现有模块边界
- ADR 位置：`[待补充]`
