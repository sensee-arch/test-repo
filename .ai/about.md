# 项目概览 — Todo List Web 应用

## 1. 项目概述
- **项目名称**：Todo List Web 应用
- **仓库**：https://github.com/sensee-arch/test-repo
- **类型**：纯前端单页应用（SPA），无后端依赖
- **分支**：flyinghub-20260716214109

## 2. 核心目标
实现一个轻量级纯前端 Todo List 应用，支持待办事项的增删改查、完成状态切换、数据本地持久化，无需后端服务，开箱即用。

## 3. 技术架构
- **语言**：HTML5 + CSS3 + Vanilla JS (ES6+)
- **存储**：localStorage
- **架构模式**：三层 MVC 变体（Store → Renderer → EventHandler）
- **依赖**：无外部依赖

## 4. 基础合约
- **Worker-A**：HTML 结构 + CSS 样式
- **Worker-B**：JavaScript 核心模块（Store / Renderer / EventHandler）
- **Worker-C**：集成验证与发布
- **总工时估算**：7h（9 个任务）

## 5. 分工与接口
- **DOM 容器约定**：#todo-input, #todo-list, #todo-count, #clear-completed, .filters
- **CSS 类约定**：.todo-item, .todo-checkbox, .todo-text, .todo-delete, .completed, .editing, .filter.active
- **Store 接口**：init(), getState(), addTodo(), toggleTodo(), deleteTodo(), updateTodo(), clearCompleted(), setFilter(), getFilteredTodos()

## 6. 运行方式
直接浏览器打开 `src/web/todo/index.html` 即可运行，无需构建步骤

## 7. 协作规则
- 分支命名：`flyinghub-YYYYMMDDHHmmss`
- 提交规范：`[TASK-N] 任务描述`
- 检查点：5 个 Sync 点验证接口一致性

## 8. 演进原则
- 严格遵循三层架构，保持单向数据流
- 优先使用标准 Web API，避免框架锁定
- 每次迭代保持向后兼容
