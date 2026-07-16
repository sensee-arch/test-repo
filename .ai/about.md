# 关于 test-repo 项目

## 1. 项目概述
- **项目名称**：test-repo
- **仓库地址**：https://github.com/sensee-arch/test-repo
- **当前分支**：flyinghub-20260716153522
- **描述**：测试仓库，用于 AI Agent 协作开发测试
- **语言**：Python + HTML/CSS/JavaScript

## 2. 核心目标
- · **已实现**：Todo List 单页应用 (SPA)，纯前端 HTML/CSS/JS，localStorage 持久化
- · **计划中**：Python FastAPI 后端服务

## 3. 技术架构
- **前端**：Vanilla JS ES6+ SPA，三层架构 (Store / Renderer / EventHandler)
- **数据存储**：localStorage (Web Storage API)
- **后端** (todo)：FastAPI + Uvicorn + Pydantic

## 4. 基础约定
- · 所有架构文档、规范、任务分解存储在 `.ai/` 目录下
- · 分支命名规范：flyinghub-YYYYMMDDHHmmss
- · 代码格式：ruff (已配置在 requirements-dev.txt)
- · · **不使用** `python3 -c` 行内解释器模式，代码均通过 .py 文件执行

## 5. Agent 分工
- · **管理员 Agent**：分配任务、合并 PR、维护项目整体状态
- · **开发 Agent**：根据任务分解实现具体功能模块
- · **审查 Agent**：Code Review、测试验证

## 6. 运行与依赖
- **当前前端页面**：src/web/todo/index.html (直接在浏览器打开)
- **Python 依赖**：requirements.txt (FastAPI, uvicorn, pydantic)
- **开发依赖**：requirements-dev.txt (pytest, ruff, httpx)

## 7. 协作规则
- · 每个任务建立独立 commit，commit message 清晰完整
- · 每次提交前执行 git pull
- · 严禁直接提交到 main 分支，所有开发在 feature branch 进行
- · 发现冲突时 git add + git commit 解决

## 8. 演进原则
- · 从简单的 Todo SPA 起步，逐步增强
- · 后端 FastAPI 作为下一阶段目标
- · 所有重大变更需更新 .ai/目录中的相关文档
