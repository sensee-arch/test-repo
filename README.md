# ToDo List

A responsive, accessible, **zero-dependency** todo list web application built with vanilla **HTML5 / CSS3 / ES6+ JavaScript**. Data is persisted in the browser via `localStorage`.

## Features

- ✅ **Create, toggle, delete** tasks
- 🎯 **Filter** by All / Active / Completed
- 🌙 **Dark mode** (persisted preference + respects `prefers-color-scheme`)
- 📱 **Responsive** layout — works on desktop, tablet, and mobile
- ♿ **Accessible** — semantic HTML, ARIA attributes, keyboard navigation, WCAG 2.1 AA
- 🎞️ **Smooth animations** for entering/leaving items
- 🧹 **Clear completed** bulk action
- ⚡ **Zero dependencies** — no CDN, no npm, no build tools

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| UI        | HTML5 semantic markup               |
| Styles    | CSS3 (custom properties, flexbox, animations, media queries) |
| Logic     | JavaScript ES6+ (classes, modules via script order) |
| Storage   | `localStorage` (key: `todolist_data`) |

## Architecture

```
todo-app/
├── index.html        # Skeleton — semantic HTML, ARIA labels
├── README.md         # This file
├── css/
│   └── style.css     # Responsive styles, themes, animations
└── js/
    ├── model.js      # TodoItem domain model + LocalStorageRepository
    ├── view.js       # DOM rendering engine, event binding helpers
    └── app.js        # Controller — coordinates model & view
```

### Modules

- **`model.js`** — `TodoItem` class with validation, serialisation (`toJSON`), and the `LocalStorageRepository` persistence layer (CRUD).
- **`view.js`** — `TodoView` encapsulates all DOM queries, builds markup from data, manages empty/error states, and provides theme helpers.
- **`app.js`** — `TodoController` wires model to view, handles form submit, checkbox toggle, delete, filter, and clear-completed.

## Usage

No server required — just open `index.html` in any modern browser.

```bash
# Clone or copy the directory, then:
open todo-app/index.html
# or drag it into your browser
```

## Development

No build step. Edit the source files directly. File order for scripts in `index.html`:

1. `js/model.js`
2. `js/view.js`
3. `js/app.js`

### Validation

- Task title is required and cannot exceed 200 characters.
- Invalid input shows an inline error message (auto-dismisses after 3 seconds).

## Accessibility

- Proper heading hierarchy (`<h1>`)
- ARIA `role="list"` / `role="alert"` / `aria-live="polite"` for dynamic content
- Visible focus indicators (`:focus-visible`)
- Semantic form labels
- High-contrast mode support via `prefers-contrast: more`

## License

MIT
