# Project Constitution

> Version: v1.0 | Date: 2026-07-17 | Project: sensee-arch/test-repo

---

## 1. Project Overview

- **Name**: test-repo
- **Description**: A test repository for Todo List Web App development
- **Language**: HTML5 / CSS3 / Vanilla JavaScript ES6+
- **Stack**: Zero external dependencies, 100% offline
- **Storage**: Browser localStorage (`todo_items` key)
- **Source Path**: `src/web/todo/`

## 2. Core Objectives

- Build a pure front-end Todo List application with CRUD operations
- Implement status toggle (complete/incomplete) per item
- Provide filter views: All / Active / Completed
- Support inline editing with Enter-save and Escape-cancel
- Persist data via localStorage across sessions
- Follow spec-first, contract-first development methodology

## 3. Technical Architecture

### 4-Layer Unidirectional Data Flow

```
Event → State Mutation → onChange() → Render → DOM Update
```

| Layer | Location | Responsibility |
|-------|----------|---------------|
| Storage | `app.js` (lines 1-30) | `loadTodos()`, `saveTodos()` — localStorage wrapper |
| State | `app.js` (lines 31-120) | Central state: todos array, filter, CRUD methods, onChange trigger |
| Render | `app.js` (lines 121-200) | `render()` — full DOM rebuild from filtered state |
| Event | `app.js` (lines 201-280) | DOM event listeners wired to State methods |

### Data Model

```typescript
interface TodoItem {
  id: string;        // 8-12 chars, random
  title: string;     // 1-200 chars, trimmed
  completed: boolean; // default false
  createdAt: number;  // Date.now() ms
}
```

## 4. Base Contract

### File Structure
- `src/web/todo/index.html` — Semantic HTML skeleton with DOM IDs
- `src/web/todo/style.css` — All visual styles (Flexbox, custom properties, responsive)
- `src/web/todo/app.js` — All JavaScript (Storage + State + Render + Event)

### DOM ID Contract
| ID | Element | Purpose |
|----|---------|---------|
| `new-todo` | input | Add todo input field |
| `todo-list` | ul | Todo items container |
| `footer` | footer | Bottom controls area |
| `todo-count` | span | Active item count |
| `filter-all` | a/button | All filter |
| `filter-active` | a/button | Active filter |
| `filter-completed` | a/button | Completed filter |
| `clear-completed` | button | Clear completed button |

### CSS Class Contract
| Class | Applied To | Visual Effect |
|-------|-----------|---------------|
| `.completed` | li | text-decoration: line-through; opacity: 0.6 |
| `.editing` | li | Shows edit input, hides label |
| `.selected` | Filter button | Highlighted/active appearance |
| `.hidden` | Footer elements | display: none |

## 5. Agent Division

| Role | Responsibility | Current |
|------|---------------|---------|
| Host | Coordination, broadcasting | Javis |
| Manager | Spec, Plan, Contract | Javis |
| Developer | Implementation | TBD |
| Reviewer | Code review, AC verification | TBD |

## 6. Running & Dependencies

- **No build tools, no transpilers, no npm packages**
- Open `src/web/todo/index.html` directly in browser
- Compatible with Chrome/Firefox/Edge ≥ 90
- No CDN links, no external scripts, no fonts

## 7. Collaboration Rules

- **Branch naming**: `flyinghub-YYYYMMDDHHmmss`
- **Commit format**: `[TASK-X] module: short description`
- All work on feature branch, no direct commits to main
- Contract must be approved before coding begins
- Review required before merge

## 8. Evolution Principles

- Spec-first: any feature addition requires spec update first
- Contract-first: cross-layer interfaces must be contracted before implementation
- TASK-1 (HTML) must precede TASK-2 (CSS) and TASK-3 (Storage)
- TASK-2 and TASK-3 can parallel after TASK-1
- No scope creep: feature additions beyond spec require full spec + plan update
