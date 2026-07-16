# About test-repo

## 1. Project Overview

test-repo is a test project under the 测试Hub ecosystem. It serves as a collaborative playground for AI Agent development workflow validation and experimentation. The project currently features a pure frontend Todo List SPA (Single Page Application) in `src/web/todo/`, with planned backend expansion using Python/FastAPI.

- **Repository**: https://github.com/sensee-arch/test-repo
- **Hub**: 测试Hub
- **Status**: Active development

## 2. Core Objectives

- **Near-term (completed)**: Implement a zero-dependency Todo List web application with vanilla JavaScript, HTML5, CSS3, and localStorage persistence.
- **Medium-term (planned)**: Add a Python/FastAPI backend with SQLite database, RESTful API, and user authentication.
- **Long-term**: Demonstrate AI Agent collaboration workflows and serve as a reference architecture for similar projects.

## 3. Technical Architecture

### Current Architecture (Todo SPA)

```
┌──────────────────────────────────────┐
│            index.html                 │
│  Store ←→ Renderer ←→ EventHandler   │
│         ↕ (localStorage)              │
└──────────────────────────────────────┘
```

- **Language**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Storage**: Web Storage API (localStorage, key: `todo_items`)
- **External Dependencies**: Zero (no frameworks, no CDN)
- **Dev Tools**: ruff (code style), pytest (testing)

### Planned Architecture (Full Stack)

- **Backend**: Python/FastAPI + Uvicorn
- **Database**: SQLite via SQLAlchemy
- **Frontend**: SPA with API client layer

## 4. Base Contract

### Module Contracts (Current)

| Module | Responsibility | Interface |
|--------|---------------|-----------|
| Store | State management + localStorage sync | `init()`, `addTodo()`, `toggleTodo()`, `deleteTodo()`, `updateTodo()`, `clearCompleted()`, `setFilter()`, `getFilteredTodos()` |
| Renderer | DOM construction & view updates | `render()`, `renderItem()`, `enterEditMode()`, `exitEditMode()`, `updateCount()`, `highlightFilter()` |
| EventHandler | Event orchestration | `init()`, `handleAdd()`, `handleToggle()`, `handleDelete()`, `handleDblClick()`, `handleFilter()`, `handleClearCompleted()` |

### Data Contract

```javascript
TodoItem {
  id: string,          // Date.now().toString(36) + random char
  title: string,       // 1-500 chars, trimmed
  completed: boolean,  // false = active, true = completed
  createdAt: number    // Date.now() timestamp
}
```

### Storage
- **Key**: `todo_items`
- **Format**: JSON-serialized `TodoItem[]`
- **Error handling**: try/catch on parse, fallback to `[]`

### Security Rules
- **NEVER** use `innerHTML` — always `textContent` + `createElement`
- **NEVER** use `eval()` or `new Function()`
- Sanitize title input (trim, max 500 chars, reject whitespace-only)

## 5. Agent Division

| Role | Agent | Responsibility |
|------|-------|---------------|
| 🏗️ Architect | Javis | System design, architecture decisions, module boundaries |
| 💻 Developer | Javis | Implementation, testing, code review |
| 🧪 QA  | Javis | Integration testing, acceptance criteria verification |
| 📋 Scripter | Javis | Specification writing, plan generation, documentation |
| 🚀 DevOps | Javis | CI/CD, git operations, environment setup |

## 6. Running & Dependencies

### Frontend (Current)
- No build step required — open `src/web/todo/index.html` directly in a browser
- Pure static files, works offline after first load

### Backend (Planned)
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn src.web.main:app --reload
```

### Requirements
- `requirements.txt`: fastapi, uvicorn[standard], pydantic
- `requirements-dev.txt`: pytest, httpx, ruff

### First-time Setup
```bash
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo
```

## 7. Collaboration Rules

### Git Convention
- **Branch naming**: `flyinghub-YYYYMMDDHHmmss` (per-session feature branches)
- **Commit style**: Clear imperative messages describing what was done
- **PR process**: Create PR via GitHub web interface from feature branch into `main`

### Coding Standards
- Vanilla JS: ES6+ syntax, `const`/`let` over `var`
- CSS: responsive design (320px–1920px), BEM-like class naming
- Rendered via `createElement` + `textContent` — no `innerHTML` under any circumstances

### AI Agent Protocol
- Each `group_direct` request is treated as **fresh and independent** — no cross-request memory
- All artifacts (specs, plans, docs) stored in `.ai/` directory
- Status broadcasts use [Boot], [Spec], [Plan], [Coding], [Review] tags
- Output format: valid JSON with base64-encoded document fields

## 8. Evolution Principles

1. **Simplicity first**: Use the simplest viable solution; add complexity only when justified
2. **Zero external dependencies for frontend**: Maximize portability and longevity
3. **Explicit over implicit**: All module interfaces clearly documented in ARCH.md and this file
4. **Security by design**: NO innerHTML, NO eval, NO unsanitized user input
5. **Incremental development**: Feature branches → small commits → integration testing
6. **Documentation as code**: `.ai/about.md` and `ARCH.md` are living documents kept in sync with implementation
7. **Backward compatibility**: API changes must preserve or extend existing contracts, never break them without major version bump
