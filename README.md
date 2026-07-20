# Test Repo — Todo List App

## Architecture

This repository contains a single canonical **Todo List** web application.

### Canonical Implementation: `todolist/`

- **Architecture**: Modular, three-file separation
  - `index.html` — HTML structure
  - `js/storage.js` — Storage abstraction layer (localStorage + in-memory fallback)
  - `js/app.js` — Application logic, rendering, event handling
  - `style.css` — Styles

- **Storage key**: `todolist_tasks`
- **Test coverage**: `tests/integration.test.js` (10 functional scenarios + edge cases + code quality checks)
- **Served via**: Static file server pointing to `todolist/index.html`

### Removed Implementation (former `todolist-web/`)

A monolithic single-file implementation (`script.js` containing both DataManager and App classes) was removed to eliminate code duplication. All functionality is preserved in the canonical `todolist/` implementation.

## Development

```bash
# Install dependencies
npm install

# Run integration tests
node tests/integration.test.js
```

## Architecture Decision Record

See `docs/adr/` for design decisions.
