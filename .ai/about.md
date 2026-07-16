# Test Repo — AI Agent Project Constitution

## 1. Project Overview
A Todo List Web App with FastAPI backend and vanilla JS frontend. Supports CRUD, filtering, inline editing, and localStorage persistence. This project demonstrates a complete MVC architecture with clear separation of concerns.

## 2. Core Objectives
- Full CRUD: create, read, update, delete todo items
- Completion status toggle with visual feedback (strikethrough, opacity)
- Filtering: all / active / completed views
- Inline editing: double-click to edit, Enter to save, Escape to cancel
- Clear completed tasks with one click
- Task count statistics (total / incomplete)
- Persistence: localStorage with 5MB capacity, JSON serialization
- Security: XSS protection via textContent rendering, try-catch for storage operations
- Zero external frontend dependencies, single HTML file delivery

## 3. Technical Architecture
- **Architecture Pattern**: MVC (Model-View-Controller) 3-layer
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **Backend**: FastAPI + Uvicorn + Pydantic
- **Persistence**: localStorage (5MB), JSON serialization/deserialization
- **Data Flow**: User → EventHandler (Controller) → Store (Model) → Renderer (View) → DOM
- **Module Layers**:
  - Store: CRUD data operations, localStorage abstraction, unified API
  - Renderer: DOM rendering, task list generation, stats update
  - EventHandler: event binding, data orchestration, view refresh trigger
- **Communication**: Synchronous function calls, no network communication
- **Container IDs**: `#todo-input`, `#todo-add-btn`, `#todo-list`, `#todo-stats`, `#filter-all`, `#filter-active`, `#filter-completed`, `#clear-completed`, `.filter-bar`

## 4. Base Contract
- **Data Format**: TodoItem as JSON object with `id` (string), `text` (string), `completed` (boolean), `createdAt` (number timestamp)
- **Storage Key**: `todo_tasks`, value as JSON stringified array
- **Error Handling**: localStorage failures silently degrade with try-catch (console.warn), no exceptions thrown
- **Forbidden**: `innerHTML` for user content, `eval()`, `new Function()`, DOM manipulation outside todo-list container
- **Interface Contracts**:
  - `Store.getAll()` → TodoItem[]
  - `Store.add(text: string)` → TodoItem
  - `Store.update(id, partialData)` → TodoItem
  - `Store.delete(id)` → void
  - `Store.getByFilter(filter)` → TodoItem[]
  - `Store.clearCompleted()` → void
  - `Renderer.render(tasks, filter)` → void
  - `Renderer.renderTaskItem(task)` → HTMLElement
  - `Renderer.renderEmptyState()` → HTMLElement
  - `Renderer.renderStats(tasks)` → void
  - `Renderer.renderFilterButtons(filter)` → void

## 5. Agent Division
| Agent | Role | Responsibilities |
|-------|------|------------------|
| Worker-A | UI Engineer | TASK-1 HTML structure, TASK-2 CSS styles |
| Worker-B | JS Core | TASK-3 Store, TASK-4 Renderer, TASK-5 EventHandler, TASK-6 Inline Edit, TASK-7 Filter/Clear, TASK-8 Edge Cases |
| Worker-C | Integration | TASK-9 End-to-end acceptance testing |
| Host | Group Coordinator | Welcome, status broadcasts |
| Manager | Requirements Analysis | Spec → Plan → Contract generation |

## 6. Running & Dependencies
- **Runtime**: Modern browser (Chrome ≥ 90, Firefox ≥ 90, Safari ≥ 15, Edge ≥ 90)
- **Start**: Open `src/web/todo/index.html` in browser
- **Backend**: FastAPI + Uvicorn (if backend mode selected)
- **Deps (Python)**: FastAPI, Uvicorn, Pydantic, pytest, ruff, httpx
- **Dev tools**: Text editor + Git client
- **Not required**: Node.js, npm, Docker, build tools (for frontend)

## 7. Collaboration Rules
- **Branch Strategy**: main → feature branches (feat/task-xx or flyinghub-YYYYMMDDHHmmss)
- **PR Workflow**: feature branch → PR → review → squash merge to main
- **Communication**: Group chat, 2h blocker response, interface change notifications
- **Context passing**: Each Hub maintains its own branch and docs, no cross-Hub state sharing
- **Logging**: Action logs via Base64-encoded JSON in action_trace fields
- **Contract-first**: Code only after Spec → Plan → Contract documents are complete

## 8. Evolution Principles
- Contract before implementation: any new feature must complete Spec + Contract first
- New capabilities through new modules, not by breaking existing module boundaries
- ADR location: TBD
- Security invariants: textContent only (no innerHTML), try-catch for storage, no eval()
- Browser compatibility: standard DOM APIs only, no experimental features
