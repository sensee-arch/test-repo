# Project Constitution

## 1. Project Overview

- **Project Name**: test-repo
- **Description**: 自动化测试创建的Hub — A test repository for automation testing purposes
- **Repository**: https://github.com/sensee-arch/test-repo
- **Language**: English (docs), Chinese (channels)
- **Purpose**: Automation workflow testing, CI/CD pipeline validation, development workflow experimentation

## 2. Core Objectives

- **Test automation**: Validate FlyingHub platform automation workflows end-to-end
- **Development pipeline**: Demonstrate boot → setup → spec → plan → contract → coding → review → summary pipeline
- **Clean state**: Each feature branch starts fresh from main for reproducible testing
- **Traceability**: All actions logged via action_trace for audit and debugging

## 3. Technical Architecture

- **Stack**: Pure HTML/CSS/JS (no backend, no frameworks, no build tools)
- **Persistence**: Web Storage API (localStorage, ~5MB per origin, synchronous JSON)
- **Architecture Pattern**: MVC 3-Layer (Model-View-Controller)
  - **Store** (Model): Task CRUD, input validation, localStorage persistence, error recovery
  - **Renderer** (View): DOM construction, stats display, filter state, empty state
  - **EventHandler** (Controller): Event binding, user interaction flow, Store↔Renderer coordination
- **Data Flow**: Unidirectional — User Input → EventHandler → Store → _save() → Renderer → DOM
- **Files**: `src/web/todo/index.html`, `src/web/todo/style.css`, `src/web/todo/app.js`

### Interface Contracts

| Module | Exports | Contract |
|--------|---------|----------|
| Store | class Store | `add(text)→task\|null`, `update(id,changes)→task\|null`, `delete(id)`, `getAll()→tasks[]`, `getByFilter(filter)→tasks[]`, `clearCompleted()` |
| Renderer | class Renderer | `render(tasks, filter)`, `renderTaskItem(task)→HTMLElement`, `renderStats(tasks)`, `renderFilterButtons(filter)` |
| EventHandler | class EventHandler | `init()`, `onAdd()`, `onToggle(id)`, `onDelete(id)`, `onStartEdit(id)`, `onFilterChange(filter)`, `onClearCompleted()` |
| DOM IDs | Fixed 9 elements | `#todo-input`, `#todo-add-btn`, `#todo-list`, `#todo-stats`, `#filter-all`, `#filter-active`, `#filter-completed`, `#clear-completed`, `.filter-bar` |

### Security Constraints

- `textContent` only — NO `innerHTML` under any circumstance
- `try-catch` wrapping for all localStorage operations
- Input validation: empty text rejected, >200 chars rejected, whitespace-only rejected
- No `eval()`, no `new Function()`, no string-based DOM construction

## 4. Base Contract

- **Language**: All code and comments in English
- **Commit format**: `[Phase] Action description` (e.g., `[Boot] add project constitution document`)
- **Branch naming**: `flyinghub-YYYYMMDDHHmmss` (timestamped from main)
- **Output format**: Pure JSON only — no markdown code blocks, no extra commentary
- **Base64 encoding**: All `_doc`, `_trace` string fields must be base64-encoded
- **Spec storage**: `spec_doc` JSON field only — never written to file
- **Session isolation**: Each workflow run uses a fresh timestamped branch from main

## 5. Agent Division

| Role | Responsibilities |
|------|-----------------|
| **Boot Agent** | Check project existence, git status, branch health, working tree |
| **Setup Agent** | Branch creation, git pull/push, project constitution generation |
| **Spec Agent** | Requirements analysis, spec generation (8 chapters, 8 FRs, 12 ACs) |
| **Plan Agent** | Technical architecture design, task decomposition (9 tasks), risk analysis |
| **Contract Agent** | Worker assignment, delivery standards, dependency protocol, collaboration rules |
| **Coding Agent** | Implementation per tasks (HTML/CSS/JS), inline edit, filter, security hardening |
| **Review Agent** | Integration testing, acceptance criteria verification, quality check |
| **Summary Agent** | Final close-out report, lessons learned, status broadcast |

## 6. Running & Dependencies

- **Runtime**: No build step; static files only, served via file:// or any HTTP static server
- **Dependencies**: Zero external dependencies (no CDN, no npm, no pip)
- **Python**: Used only for generation scripts (spec, plan, contract) — not for the app itself
- **Node.js**: Not required for the app; OpenClaw runtime environment
- **Source directory**: `src/web/todo/` — contains index.html, style.css, app.js
- **Testing**: Manual visual testing via browser; localStorage inspection via DevTools

## 7. Collaboration Rules

- **Single source of truth**: Spec document lives in `spec_doc` field — never duplicated to disk
- **Stash before branch**: Dirty working tree stashed before switching branches
- **Push after create**: Every feature branch pushed to origin immediately after creation
- **No force push**: Never rebase or force-push to shared branches
- **No empty commits**: Skip commit when there are no changes to record
- **Auto-fix first**: Attempt self-healing before escalating errors
- **Escalation only for**: OS permissions, auth failures, resource limits, hard constraints

## 8. Evolution Principles

- **Incremental builds**: Each task builds on previous; dependency DAG respected
- **Phase gates**: Phase I (Foundation: HTML+CSS+Store) → Phase II (Core: Renderer+EventHandler) → Phase III (Polish: Edit+Filter+Security+Integration)
- **MVC decoupling**: No layer directly manipulates another's internals; Store never touches DOM, Renderer never touches data
- **Defensive coding**: All external inputs validated; all storage ops wrapped in try-catch; all DOM writes use textContent
- **Traceability**: Every generation script produces action_trace with Reasoning→Decision→Action→Observation→Reflection
