# ToDo List App

A simple, fast, accessible ToDo list web application — pure vanilla HTML, CSS, and JavaScript. Zero dependencies, zero build step.

## Features

- **Add, toggle, delete, inline-edit** todo items
- **Filter** by All / Active / Completed
- **Clear completed** in one click
- **Dark mode** — auto-detects system preference
- **High contrast** support
- **Reduced motion** respect
- **Keyboard accessible** — full keyboard navigation + Ctrl/Cmd+N shortcut
- **Persistent** — data saved to `localStorage`
- **Responsive** — mobile-first, works on all screen sizes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| HTML  | Semantic HTML5, ARIA roles |
| CSS   | Custom properties, media queries (`prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`) |
| JS    | ES6+ classes, arrow functions, template literals, event delegation |
| Store | `localStorage` — single key `todolist_data` |

## Architecture

```
index.html
├── css/style.css     (Responsive styles, themes, animations)
├── js/model.js       (TodoItem model, LocalStorageRepository)
├── js/view.js        (DOM rendering, event delegation, animations)
└── js/app.js         (Controller — wires Model ↔ View)
```

### Module responsibilities

| Module    | File          | Responsibility                           |
|-----------|---------------|------------------------------------------|
| Model     | `js/model.js` | `TodoItem` class, `LocalStorageRepository` CRUD, validation |
| View      | `js/view.js`  | DOM construction/update, event delegation, animations, empty state |
| Controller| `js/app.js`   | User interaction handling, filter/sort state, coordination |
| HTML      | `index.html`  | Skeleton, semantic tags, script/style refs |
| CSS       | `css/style.css`| Responsive layout, themes, transitions  |

## Usage

Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).

```
# Or serve locally:
python3 -m http.server 8000
# then open http://localhost:8000
```

- Type a task → press **Enter** or click **+**
- **Check** the box to mark complete
- **Double-click** a task to inline-edit
- **Hover** to reveal the **×** delete button
- Use **All / Active / Completed** filter buttons
- **Clear completed** removes all done items
- **Ctrl+N** (or **Cmd+N**) focus the input

## Development

No build tools required. Edit source files and refresh the browser.

```sh
git clone <repo-url>
cd todo-app
# edit files, then open index.html
```

## License

MIT
