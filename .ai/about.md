# Project Constitution — test-repo

## 1. Project Overview

test-repo is a technical exploration hub created for automated testing under the "测试Hub" ecosystem. It serves as a sandbox for AI Agent collaboration, feature prototyping, and workflow validation. The repository contains a Todo List SPA application in `src/web/todo/` and is designed to demonstrate modern front-end development patterns without external frameworks.

**Repository**: https://github.com/sensee-arch/test-repo  
**Hub**: 测试Hub  
**Workspace**: `~/.openclaw/workspace/test-repo`

## 2. Core Objectives

- ✅ **Todo List SPA** (current) — Fully functional single-page todo application using vanilla JavaScript, HTML5, CSS3 with localStorage persistence
- ⏳ **FastAPI Backend** (planned) — Python/FastAPI-based backend with RESTful API for future expansion
- **AI Agent Collaboration** — Establish clear collaboration patterns between human developers and AI agents
- **Workflow Validation** — Serve as a testbed for the FlyingHub development workflow (spec → plan → coding → review)

## 3. Technical Architecture

### Current Architecture (SPA)

```
index.html
├── EventHandler  (事件监听 + 编排调度)
├── Renderer      (DOM构建 + 视图更新)
└── Store         (状态管理 + localStorage同步)
      └── localStorage (key: todo_items)
```

| Layer | Responsibility |
|-------|---------------|
| EventHandler | Event listening, orchestration, input validation |
| Renderer | DOM creation, view updates, edit mode toggling |
| Store | State management, CRUD operations, localStorage persistence |
| localStorage | Data persistence (key: `todo_items`) |

### Planned Architecture (Full Stack)

```
React SPA → FastAPI + Uvicorn → SQLite/PostgreSQL → Nginx reverse proxy
```

## 4. Base Contract

### Code Standards
- **Language**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Style**: const/let over var, descriptive class/id naming
- **Security**: All user content via `textContent`, NEVER `innerHTML`
- **Storage**: Web Storage API (localStorage, key: `todo_items`)

### Branch Convention
- Feature branches: `flyinghub-YYYYMMDDHHmmss`
- Branch from `main`, push to remote, work in feature branch

### Commit Convention
- Format: `type: description` (e.g., `feat: add todo item`, `docs: update about.md`)
- Types: feat, fix, docs, refactor, test, chore

### Agent Behavior
- **Directory isolation**: All operations within `workspace/test-repo/`
- **Fresh start**: Each group_direct request is independent with no conversational memory
- **Auto-fix**: Retry network commands 2-3 times, create dirs before writing, git pull before push

## 5. Agent Division

| Role | Responsibility |
|------|---------------|
| **Host Agent** | Greet participants, announce topics, manage group flow |
| **Boot Agent** | Project status checks, environment setup, documentation generation |
| **Spec Agent** | Requirements specification, feature contract generation |
| **Plan Agent** | Technical planning, task decomposition, risk assessment |
| **Coding Agent** | Implementation following task dependency chain |
| **Review Agent** | Integration testing, code review, acceptance verification |

## 6. Running & Dependencies

### Current Project
- **Dependencies**: None (vanilla JS, zero framework)
- **Run**: Open `src/web/todo/index.html` in browser or serve via any static file server
- **Dev tools**: pytest, ruff, httpx (from `requirements-dev.txt`)

### Python Backend (Planned)
- FastAPI + Uvicorn + Pydantic
- Run: `uvicorn src.api.main:app --reload`
- Dependencies listed in `requirements.txt`

## 7. Collaboration Rules

- **Independent requests**: Every group_direct message is treated as a brand new request with no prior context
- **Output format**: All responses must be valid JSON with double-quoted strings
- **Content style**: 150-250 characters, [Tag] prefix, emojis allowed, no pleasantries
- **Python execution**: All Python code must be written to standalone `.py` files, never inline `-c`
- **Git hub auth**: Use `gh api` for collaborator management, verify with permission endpoint
- **Escalation**: Only after 2-3 retry attempts for self-healable errors

## 8. Evolution Principles

- **Incremental expansion**: Start with SPA, add backend later
- **Documentation first**: Update `.ai/about.md` when project scope changes
- **Security by design**: No innerHTML, no eval, input sanitization enforced
- **Task isolation**: Each TASK in plan maps to a single commit
- **Minimal dependencies**: Prefer vanilla solutions over frameworks to reduce maintenance burden
- **Backward compatibility**: Never break existing interfaces when adding new features
