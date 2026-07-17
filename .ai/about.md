# .ai/about.md — Project Constitution

> Last updated: 2026-07-17
> Repository: https://github.com/sensee-arch/test-repo
> Branch: flyinghub-20260717155057

## 1. Project Overview

A collaborative Web-based Todo List application built with pure HTML/CSS/JS (no frameworks, no build tools). Data is persisted via localStorage in the browser with no backend server required. The project follows a spec-first, contract-first development methodology.

## 2. Core Objectives

- Build a fully functional single-page Todo List application
- Implement CRUD (Create, Read, Update, Delete) operations
- Support completion status toggle (completed/active)
- Provide filtering by all/active/completed
- Maintain data persistence through localStorage
- Ensure responsive, user-friendly interface

## 3. Technical Architecture

**4-Layer Architecture (Unidirectional Data Flow):**

```
Event Layer → State Layer → Render Layer → DOM
  ↑                           ↓
  └───────── Storage Layer ←──┘
```

- **Storage Layer**: localStorage + JSON serialization/deserialization
- **State Layer**: In-memory state (todos[], filter, onChange callback), CRUD operations
- **Render Layer**: Pure DOM manipulation, renders list, count, filter buttons, empty state
- **Event Layer**: DOM event handlers (add, toggle, delete, edit, filter)

**Tech Stack:**
- HTML5 semantic markup
- CSS3 (Flexbox/Grid, responsive design, hover/focus states)
- Vanilla JavaScript ES6+ (const/let over var, arrow functions)
- Web Storage API (localStorage)

**Source files (3 files in src/web/todo/):**
- `index.html` — HTML structure
- `style.css` — Visual styling
- `app.js` — All 4 layers (Storage, State, Render, Event)

## 4. Base Contract

### TodoItem Data Model
```javascript
{
  "id": "a1b2c3d4",        // string, 8-char unique ID
  "title": "Buy groceries",  // string, 1-200 chars
  "completed": false,        // boolean
  "createdAt": 1721193600000 // number, Unix ms timestamp
}
```

### localStorage Persistence
| Key | Type | Value |
|-----|------|-------|
| `todo_items` | JSON | Array of TodoItem objects |

### State Interface
- `todos[]` — sorted by createdAt descending
- `filter` — 'all' | 'active' | 'completed'
- `addTodo(title)` → void
- `deleteTodo(id)` → void
- `toggleTodo(id)` → void
- `updateTodo(id, newTitle)` → void
- `setFilter(filter)` → void
- `getFilteredTodos()` → TodoItem[]
- `getActiveCount()` → number
- `clearCompleted()` → void

### UI Layout
- Header: input field + Add button
- Main: task list with checkbox, title (editable on double-click), delete button
- Footer: active count, filter buttons (All/Active/Completed), clear completed

## 5. Agent Division

| Role | Responsibility |
|------|---------------|
| Host (Javis) | Welcome, announce topic, status updates |
| Admin | Requirements spec, planning, contract |
| Developer | Implementation (coding tasks) |
| Reviewer | Code review, acceptance testing |

## 6. Running & Dependencies

- No build step required
- Open `src/web/todo/index.html` in any modern browser (Chrome/Firefox/Safari/Edge)
- No server, no database, no package installation needed
- All data stored in browser localStorage (clearing browser data resets the app)

## 7. Collaboration Rules

- **Spec-first**: Requirements spec must be finalized before any planning
- **Contract-first**: Interface contracts must be agreed before coding begins
- **Branch naming**: `flyinghub-YYYYMMDDHHmmss`
- **Source files**: All code lives in `src/web/todo/`
- **ADR location**: `docs/adr/`
- **Commit style**: Descriptive messages, one logical change per commit
- **No empty commits**: If no changes exist, do not create a commit

## 8. Evolution Principles

- Keep the tech stack pure — no frameworks, no build tools, no transpilers
- Maintain 4-layer separation — do not mix Storage, State, Render, or Event concerns
- localStorage is the single source of truth — no external sync
- All UI state changes must flow through State Layer → Render Layer
- New features must pass through: Spec → Plan → Contract → Code → Review
- Polyfill for IE support is acceptable if needed
- Branch per feature, merged via PR after review

