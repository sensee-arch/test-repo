# Project Constitution (.ai/about.md)

## 1. Project Overview
- **Project**: test-repo
- **Application**: Todo List Web App
- **Stack**: Pure HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- **Architecture**: MVC (Model-View-Controller)
- **Persistence**: localStorage (key: `todo_tasks`)
- **Style**: Zero framework, zero build tools, zero external dependencies
- **Target**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 2. Core Objectives
| Objective | Priority | Description |
|-----------|----------|-------------|
| CRUD Tasks | P0 | Create, Read, Update, Delete tasks |
| Completion Toggle | P0 | Toggle task completed state via checkbox |
| Inline Edit | P1 | Double-click to edit, Enter/blur to save, Escape to cancel |
| Filter Views | P1 | All / Active / Completed filter switching |
| Clear Completed | P1 | Remove all completed tasks with one click |
| Live Stats | P1 | Display "X item(s) left" with real-time updates |
| Security | P0 | textContent only (no innerHTML), try-catch for storage |
| Responsive Design | P1 | Adapt to desktop, tablet, and mobile viewports |

## 3. Technical Architecture

### 3.1 Architecture Pattern: MVC

```
User Action → EventHandler → Store (update data) → Renderer (re-render) → DOM
                                        ↕
                                  localStorage
```

### 3.2 Store (Model)
```javascript
class Store {
  constructor()                    // Load from localStorage
  getAll() → TodoItem[]            // All tasks, sorted by createdAt desc
  add(text) → TodoItem|null        // Validate & add
  update(id, changes) → TodoItem|null // Merge changes
  delete(id)                       // Remove by id
  getByFilter(filter) → TodoItem[] // 'all' | 'active' | 'completed'
  clearCompleted()                 // Remove completed
}
```
- Internal: `this.tasks` (private array), `STORAGE_KEY = 'todo_tasks'`
- ID generation: 8-char random alphanumeric

### 3.3 Renderer (View)
```javascript
class Renderer {
  constructor()                    // Cache 9 DOM element references
  render(tasks, filter)            // Main entry: list + stats + filter
  renderTaskItem(task) → HTMLElement // Single <li>
  renderStats(tasks)               // Update stats text
  renderFilterButtons(filter)      // Highlight active filter
  renderEmptyState() → HTMLElement // Empty placeholder
}
```

### 3.4 EventHandler (Controller)
```javascript
class EventHandler {
  constructor(store, renderer)     // DI: inject Store + Renderer
  init()                           // Initial render + bind events
  onAdd()                          // Add button / Enter key
  onToggle(id)                     // Toggle completion
  onDelete(id)                     // Delete task
  onStartEdit(id)                  // Enter inline edit (dblclick)
  onSaveEdit(id, newText)          // Save edit (Enter/blur)
  onCancelEdit(id)                 // Cancel edit (Escape)
  onFilterChange(filter)           // Switch filter
  onClearCompleted()               // Clear completed
}
```

### 3.5 Data Model (TodoItem)
| Field | Type | Constraints |
|-------|------|-------------|
| id | string | 8-char random, unique |
| text | string | 1-200 chars, trimmed |
| completed | boolean | Default: false |
| createdAt | number | Unix timestamp (ms) |

### 3.6 Fixed DOM IDs
| ID | Element | Purpose |
|----|---------|---------|
| #todo-input | input[type="text"] | New task input |
| #todo-add-btn | button | Add task |
| #todo-list | ul | Task list container |
| #todo-stats | span/div | Stats display |
| #filter-all | button | "All" filter |
| #filter-active | button | "Active" filter |
| #filter-completed | button | "Completed" filter |
| #clear-completed | button | Clear completed |
| .filter-bar | div | Filter container |

### 3.7 Source Layout
```
src/web/todo/
├── index.html     # HTML skeleton (all fixed DOM IDs)
├── style.css      # Responsive styling (CSS variables, Flexbox)
└── app.js         # MVC: Store + Renderer + EventHandler
```

## 4. Base Contract
### 4.1 Security
- **No innerHTML**: All DOM text via textContent
- **No eval()**: No dynamic code execution
- **Input validation**: Trim, non-empty, max 200 chars
- **localStorage safety**: All operations wrapped in try-catch; in-memory fallback

### 4.2 Code Quality
- ES6 class syntax for all three MVC modules
- UPPER_SNAKE_CASE for constants, camelCase for methods/variables
- JSDoc-style comments on all class methods
- Event delegation on #todo-list for click events

### 4.3 Naming Conventions
- File names: lowercase with hyphens (kebab-case)
- CSS classes: lowercase with hyphens
- JS classes: PascalCase
- JS methods/variables: camelCase
- JS constants: UPPER_SNAKE_CASE

### 4.4 Branch Strategy
- Feature branches: `flyinghub-YYYYMMDDHHmmss`
- Main branch: `main` (protected, stable)

## 5. Agent Division
Three agents working in the MVC coding pipeline:

| Agent | Role | Owns | Input | Output |
|-------|------|------|-------|--------|
| Worker-1 | HTML & CSS | index.html, style.css | Spec DOM ID contract | Complete static structure + styling |
| Worker-2 | Store + Renderer | Store class, Renderer class | Spec data model + DOM contract | Data layer + view layer |
| Worker-3 | EventHandler | EventHandler class, integration | All prior work + event spec | Controller + final integration |

Dependency flow:
```
Worker-1 (HTML)    Worker-2 (Store)
       ↘               ↙
    Worker-2 (Renderer)
           ↓
    Worker-3 (EventHandler + Integration)
```

## 6. Running & Dependencies
### 6.1 Runtime
- **Zero** runtime dependencies
- Open `src/web/todo/index.html` directly in browser (file:// or any static server)
- No build step, no package manager, no server required

### 6.2 Development Tools
- Python 3 (for generation scripts only, not for the app)
- Git for version control
- No npm, pip, or CDN dependencies

### 6.3 Testing
- Manual testing via browser (Chrome DevTools)
- Test against all 34 acceptance criteria
- Verify localStorage persistence by refresh

## 7. Collaboration Rules
### 7.1 Communication
- Spec document is the single source of truth for all implementation decisions
- Interface contracts between Store → Renderer → EventHandler must not be broken
- Any deviation from DOM ID contract or CSS class contract requires spec update

### 7.2 Code Review
- Verify no innerHTML in any file
- Verify all 9 DOM IDs match exactly
- Verify all 7 CSS class names match exactly
- Verify all input paths are validated (add + edit)
- Verify all localStorage paths are try-catch wrapped

### 7.3 Conflict Resolution
- If a Worker cannot complete its module due to missing interface, immediately request the upstream dependency
- If breaking changes needed, update .ai/about.md first
- Integration issues escalate to full re-render path audit

## 8. Evolution Principles
### 8.1 Adding Features
- New features must follow the MVC pattern
- New DOM elements must use textContent (no innerHTML)
- New storage fields must be backward-compatible with existing localStorage schema
- New CSS classes must follow the established naming convention

### 8.2 Refactoring
- Store is the only module that touches localStorage
- Renderer is the only module that touches the DOM
- EventHandler coordinates but never directly manipulates data or DOM
- This strict layering enables isolated testing

### 8.3 Performance
- O(n) rendering is acceptable for practical usage (<1000 tasks)
- localStorage 5MB limit acts as natural ceiling
- No virtual DOM or diffing needed

### 8.4 Maintenance
- This file (.ai/about.md) must be updated whenever architecture, contracts, or conventions change
- Daily notes in memory/YYYY-MM-DD.md for tracking progress
- MEMORY.md for long-term project context
