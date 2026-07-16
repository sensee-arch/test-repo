# .ai/about.md — AI Agent Project Constitution

## 项目概述
- 本项目是一个基于纯前端技术的 Web Todo List 单页应用（SPA）
- 使用 HTML5 + CSS3 + Vanilla JavaScript ES6+ 构建，无框架依赖
- 数据持久化采用浏览器 localStorage，无需后端服务
- 托管于 GitHub: sensee-arch/test-repo

## 核心目标
- 提供完整的待办事项管理：增（Create）、删（Delete）、改（Update）、查（Read）
- 支持完成状态切换（Toggle），按状态筛选（全部/未完成/已完成）
- 支持内联编辑、清除已完成、未完成计数
- 确保数据在页面刷新后不丢失
- 防范 XSS 攻击，所有用户输入使用 textContent 渲染

## 技术架构
- **模式**：三层 MVC 变体，所有代码位于单个 HTML 文件
- **Store（数据层）**：管理 todos 数组和 filter 状态，封装 CRUD + 筛选 + 清除方法，自动持久化到 localStorage
- **Renderer（视图层）**：根据 Store 状态快照渲染 DOM，使用 textContent 防 XSS，管理编辑模式 UI
- **EventHandler（控制层）**：绑定 DOM 事件（键盘/点击/双击/失焦），编排事件 → Store → Renderer 单向数据流
- **无外部依赖**：纯原生 Web API 实现

## 基础契约
- **数据实体**：TodoItem { id, title, completed, createdAt }
- **持久化 Key**：todo_items，Value 为 JSON.stringify(TodoItem[])
- **DOM 选择器规范**：#todo-input, #todo-list, #todo-count, .filters, #clear-completed, .todo-item, .todo-checkbox, .todo-text, .todo-delete, .edit-input
- **Store 接口**：init, getState, addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted, setFilter, getFilteredTodos
- **Renderer 接口**：render, enterEditMode, exitEditMode
- **EventHandler 接口**：init 及内部事件处理方法

## 任务分工
- **Worker-A**：HTML 结构（TASK-1）+ CSS 样式（TASK-2）— DOM 骨架与视觉设计
- **Worker-B**：Store（TASK-3）+ Renderer（TASK-4）+ EventHandler（TASK-5）+ 内联编辑（TASK-6）+ 筛选清除（TASK-7）+ 边界打磨（TASK-8）— 核心逻辑实现
- **Worker-C**：集成验证（TASK-9）— 端到端回归测试
- 依赖链：TASK-1 → TASK-2；TASK-3 → TASK-4 → TASK-5 → TASK-6/7/8 → TASK-9

## 运行与依赖
- **运行方式**：直接用浏览器打开 src/web/todo/index.html 即可运行
- **构建工具**：无，纯静态页面无需构建
- **依赖安装**：无需安装依赖，浏览器原生支持
- **requirements.txt**：FastAPI/Uvicorn/Pydantic（仅用于可能的本地服务测试，非核心必需）
- **requirements-dev.txt**：pytest, ruff, httpx（开发工具）

## 协作规则
- **分支策略**：从 main 创建 flyinghub-YYYYMMDDHHmmss 特性分支，全部任务在该分支完成
- **提交规范**：每个 TASK 独立 commit，格式 [TASK-N] 描述
- **沟通渠道**：测试Hub 群组，工作日 4 小时内响应
- **检查点**：5 个 Phase 检查点，完成后在群组同步进度
- **合并**：所有任务完成且集成验证通过后合并回 main

## 演进原则
- **模块化**：Store/Renderer/EventHandler 三层职责清晰，可独立修改和扩展
- **安全性优先**：禁止 innerHTML，统一使用 textContent/createElement
- **兼容性**：支持 Chrome 60+ / Firefox 55+ / Safari 11+ / Edge 15+
- **可维护性**：ES6 语法，const/let 声明，函数命名清晰，保留必要注释
- **渐进增强**：当前聚焦纯前端 Todo List 核心功能，未来可扩展后端同步、标签分类等