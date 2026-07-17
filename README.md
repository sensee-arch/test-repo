# TodoList

A clean, responsive TodoList web application built with **vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3** — zero external dependencies.

## Features

- ✅ **Add tasks** — type and press Enter or click Add
- ✅ **Toggle completion** — check/uncheck with a single click
- ✅ **Delete tasks** — hover to reveal the delete button
- ✅ **Edit tasks** — double-click any task to edit inline
- ✅ **Filter views** — All / Active / Completed
- ✅ **Persistent storage** — data saved to `localStorage`
- ✅ **Active item count** — live counter in toolbar
- ✅ **Clear completed** — batch-remove finished tasks
- ✅ **Dark mode** — automatically matches system preference
- ✅ **Responsive** — mobile-first, works from 320px upward
- ✅ **Keyboard friendly** — Escape to blur input, Enter to submit edit
- ✅ **Reduced motion** — respects `prefers-reduced-motion`

## Architecture

```
├── index.html      # Semantic HTML5 structure
├── style.css       # CSS3 responsive styles (Flexbox/Grid, variables, dark mode)
├── app.js          # Application logic (DataStore, TodoItem, TodoApp)
├── LICENSE
├── README.md
└── ...
```

### Core Modules (app.js)

| Module | Responsibility |
|--------|---------------|
| `DataStore` | localStorage CRUD — load, save, ID generation |
| `TodoItem` | Data model with id, title, completed, createdAt |
| `TodoApp` | UI rendering, event handling, edit, filter, lifecycle |

## Usage

Open `index.html` directly in any modern browser. No build step, no server required.

```bash
# Just open the file
open index.html   # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

## Tech Stack

- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Custom Properties, Flexbox, Grid, Media Queries)
- **Storage**: Browser `localStorage` via Web Storage API
- **Dependencies**: Zero — no libraries, no frameworks, no CDN

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT — see [LICENSE](LICENSE).
