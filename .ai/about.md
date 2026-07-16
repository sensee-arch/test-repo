## 1. Project Overview

- **Repository**: sensee-arch/test-repo
- **Type**: Todo List Web Application (Single Page Application)
- **Description**: A pure frontend Todo List SPA built with vanilla HTML/CSS/JS, using localStorage for persistence. Supports full CRUD operations, inline editing, filtering (All/Active/Completed), and clear completed.
- **Target Users**: Individual users for personal task management
## 2. Core Objectives

1. **Functional Completeness**: Provide full CRUD for todo items (create, read, update, delete) with completion status toggle.
2. **Persistence**: All data persisted via browser localStorage; survive page refreshes.
3. **Usability**: Inline editing via double-click, keyboard shortcuts (Enter/Escape), responsive layout.
4. **Robustness**: Graceful error handling for localStorage limits, data corruption, and edge cases.
5. **Security**: XSS-safe rendering (use textContent/innerText, never innerHTML).
## 3. Technical Architecture

### Architecture Pattern: Three-layer modular SPA
- **Store Module** (data layer): Manages state (todos array, filter string), handles all mutations, syncs to localStorage.
- **Renderer Module** (view layer): Pure rendering functions that take Store state and update the DOM. Stateless.
- **EventHandler Module** (control layer): Listens to DOM events, calls Store methods, triggers Renderer.

### Data Flow
```
User Action -> DOM Event -> EventHandler -> Store (mutate + persist) -> Renderer (re-render)
```

### Deployment
Single `index.html` file. No build step. Hostable on any static file server or GitHub Pages.
## 4. Base Contract

### Formatting
- **HTML**: HTML5 semantic markup, class names prefixed for clarity (.new-todo, .todo-list, .filter)
- **CSS**: CSS3 with Flexbox layout, no preprocessors
- **JS**: Vanilla ES6+, no frameworks, no build tools

### File Structure
```
src/web/todo/
  index.html          # Main SPA file (HTML + CSS + JS inline or linked)
  app.js              # Application logic (Store + Renderer + EventHandler)
  style.css           # Stylesheet
```

### Naming
- Branch: `flyinghub-YYYYMMDDHHmmss`
- Commits: imperative present tense, e.g., "Add HTML structure"
- JS identifiers: camelCase for variables/methods, PascalCase for constructors/interfaces
## 5. Agent Division

This project supports multiple AI Agents collaborating:
- **Boot Agent**: Project setup, environment initialization, branch creation, about.md generation.
- **Spec Agent**: Requirements specification generation.
- **Plan Agent**: Technical plan and task breakdown.
- **Coding Agent**: Implements individual tasks from the plan.
- **Review Agent**: Code review and quality assurance.
- **Auth Agent**: GitHub collaborator access management.
## 6. Running & Dependencies

### Dependencies
- **Runtime**: Modern web browser (Chrome 60+, Firefox 55+, Safari 11+, Edge 15+)
- **Backend**: None required (100% client-side)
- **Python Dependencies** (for tooling):
  - `requirements.txt`: fastapi, uvicorn[standard], pydantic
  - `requirements-dev.txt`: pytest, ruff, httpx

### Running
1. Open `src/web/todo/index.html` in a browser, OR
2. Serve locally: `python3 -m http.server 8000 -d src/web/todo`

### Testing
- Manual verification via browser
- Automated: pytest for any backend utilities
## 7. Collaboration Rules

1. **Branch isolation**: Each developer works on their own `flyinghub-*` branch.
2. **Commit discipline**: One commit per logical change. Clear message.
3. **No force push**: Use `git push --force-with-lease` only when necessary.
4. **Pull before push**: Always `git pull` to sync before pushing.
5. **Respect file structure**: Do not move or rename project files without agreement.
6. **Credential safety**: Never commit tokens, secrets, or `.env` files.
7. **Code review**: All changes should be reviewed before merging to main.
## 8. Evolution Principles

1. **Keep it simple**: Prefer vanilla solutions; add dependencies only when justified.
2. **Progressive enhancement**: Core features work without JS; rich experience with JS.
3. **Accessibility**: Keyboard navigable, ARIA labels, screen-reader friendly.
4. **Performance**: Optimize for <100ms response time; batch DOM updates.
5. **Graceful degradation**: Handle localStorage errors, unsupported browsers with fallback.
6. **Documentation**: Keep .ai/about.md and ARCH.md updated with architectural decisions.
7. **Testability**: Pure functions where possible; side-effects isolated to Store module.