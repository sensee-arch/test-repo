# Test Repo - 项目概览

## 1. 项目概述
基于 FastAPI 的 Todo List Web 应用后端，配合前端单页应用。

## 2. 核心目标
提供完整的 Todo 任务管理功能（CRUD + 筛选 + 编辑 + 持久化）。

## 3. 技术架构
MVC 三层架构：Store（数据层）→ Renderer（视图层）→ EventHandler（控制层）
前端：HTML5 + CSS3 + Vanilla JS (ES6+)
后端：FastAPI + Uvicorn + Pydantic
数据持久化：localStorage (5MB)

## 4. 基础合约
3 个 Worker（界面/核心/集成）、9 个任务（TASK-1~TASK-9）、5 个阶段、5 个检查点

## 5. 职责分配
Worker-A（界面工程师）：TASK-1 HTML 结构 + TASK-2 CSS 样式
Worker-B（JS 核心开发）：TASK-3 Store 层 / TASK-4 Renderer / TASK-5 EventHandler / TASK-6 编辑 / TASK-7 筛选 / TASK-8 边界
Worker-C（集成测试）：TASK-9 端到端验收

## 6. 运行与依赖
依赖：FastAPI, Uvicorn, Pydantic, pytest, ruff, httpx
前端：单 HTML 文件（index.html），无需构建工具

## 7. 协作规则
分支策略：main → dev → feat/task-xx
PR 工作流：功能分支 → PR → Review → 合并
沟通：每日文字站会、阻塞 2h 响应、接口变更群内通知

## 8. 演进原则
所有用户内容使用 textContent 禁止 innerHTML（防 XSS）
localStorage 读写使用 try-catch 兜底
浏览器兼容 Chrome / Firefox / Safari / Edge