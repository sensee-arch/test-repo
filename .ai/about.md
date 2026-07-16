# About — test_repo

## Project Overview
test_repo（测试仓库）是一个用于验证 AI Agent 协作流程的沙箱项目。
项目包含前端 Todo List 单页应用和后端 FastAPI 服务框架，作为 Agent 协作模式的实验场。

## Core Objectives
1. 构建一个可工作的 Todo List Web 应用（纯前端 HTML/CSS/JS + localStorage）
2. 搭建 FastAPI 后端框架，支持 API 式交互
3. 验证 AI Agent 在版本控制、任务分解、代码生成、代码审查等环节的协作能力
4. 作为 CI/CD 和自动化测试的测试目标

## Technical Architecture
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript ES6+, 单页应用 (SPA)
- **Backend**: Python FastAPI + Uvicorn, RESTful API
- **Database (Frontend)**: 浏览器 localStorage, key: `todo_items`
- **Database (Backend)**: 待定（可扩展 SQLite/PostgreSQL）
- **Persistence**: Web Storage API + JSON 序列化
- **Dev Tools**: Python 3.10+, Node.js, Git, Ruff (linter), pytest

## Base Contract
- 所有代码提交需遵循 Conventional Commits 规范（feat/fix/docs/chore）
- 前端代码放置在 `src/web/todo/` 目录
- 后端代码放置在 `src/api/` 目录
- 配置文件、文档使用 `.ai/` 目录管理
- 分支命名规范: `flyinghub-YYYYMMDDHHmmss`
- Python 代码使用 Ruff 检查，通过 `requirements-dev.txt` 管理开发依赖

## Agent Division
- **Boot Agent**: 项目初始化、环境配置、文档生成
- **Spec Agent**: 需求分析、规格说明编写
- **Plan Agent**: 技术方案设计、任务分解
- **Coding Agent**: 代码实现
- **Review Agent**: 代码审查、质量保障
- **Test Agent**: 测试用例编写与执行

## Running & Dependencies
- **Requirements**: `requirements.txt` (FastAPI, Uvicorn, Pydantic)
- **Dev Requirements**: `requirements-dev.txt` (pytest, httpx, ruff)
- **Run Frontend**: 直接在浏览器中打开 `src/web/todo/index.html`
- **Run Backend**: `uvicorn src.api.main:app --reload`
- **Test**: `pytest`
- **Lint**: `ruff check .`

## Collaboration Rules
1. 每个独立任务从 main 创建新分支 `flyinghub-<timestamp>`
2. 每个任务单独提交，commit message 包含 task ID
3. 推送后通知协作成员
4. 代码审查通过后合并至 main
5. `.ai/about.md` 随项目演进持续更新

## Evolution Principles
- 保持架构简洁，避免过度设计
- 优先使用标准库，减少外部依赖
- 文档与代码同步更新
- 每次迭代保留可演示的可用版本