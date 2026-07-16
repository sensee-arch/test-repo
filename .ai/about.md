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
3 个 Worker、9 个任务（TASK-1~TASK-9）、5 个阶段、5 个检查点
Worker-A：界面工程师（HTML/CSS）
Worker-B：JS 核心开发（Store/Renderer/EventHandler）
Worker-C：集成测试工程师

## 5. 职责分配
Worker-A: TASK-1 (HTML) + TASK-2 (CSS)
Worker-B: TASK-3~TASK-8 (JS 核心 + 编辑/筛选/边界)
Worker-C: TASK-9 (集成测试)

## 6. 运行与依赖
依赖：FastAPI, Uvicorn, Pydantic, pytest, ruff, httpx
前端：单 HTML 文件（index.html），无需构建工具

## 7. 协作规则
分支策略：main → dev → feat/task-xx
PR 工作流：从 dev 拉功能分支 → 提交 PR → Review → 合并
沟通：每日站会、阻塞 2h 响应、接口变更群内通知

## 8. 演进原则
代码优先使用 textContent 防 XSS
本地存储异常 try-catch 兜底
浏览器兼容 Chrome/Firefox/Safari/Edge