# ToDo List Web App

A simple, clean, and fully client-side ToDo List single-page application built with vanilla HTML, CSS, and JavaScript.

## Features

- **CRUD** — Create, read, update, and delete todo items
- **Toggle completion** — Check/uncheck items with visual feedback (strikethrough + dimming)
- **Inline editing** — Double-click any title to edit it in-place
- **Filter views** — All / Active / Completed
- **Clear completed** — Remove all completed items in one click
- **Persistent data** — All items saved to browser `localStorage`, survives page refreshes
- **Dark mode** — Automatically adapts to system color scheme preference
- **High contrast** — Respects `prefers-contrast: high` for accessibility
- **Responsive** — Works on desktop, tablet, and mobile
- **Zero dependencies** — No frameworks, no build tools, no CDN. Open `index.html` and go.

## Usage

1. Open `index.html` in any modern browser (Chrome 90+, Firefox 90+, Edge 90+).
2. Type a task in the input field and press **Enter** or click the **+** button.
3. Click the checkbox to mark an item as complete.
4. Double-click a task title to edit it inline.
5. Use the filter buttons (All / Active / Completed) to toggle views.
6. Click **Clear completed** to remove all finished items at once.

## Project Structure

```
├── index.html      # HTML skeleton, semantic tags, references CSS + JS
├── css/
│   └── style.css   # Responsive layout, themes, transitions, dark/high-contrast support
├── js/
│   ├── model.js    # Data model, validation, LocalStorageRepository
│   ├── view.js     # DOM rendering, event delegation, empty state, animations
│   └── app.js      # Controller: coordinates Model & View, state management
└── README.md       # This file
```

## Architecture

The app follows a simple **Model-View-Controller (MVC)** pattern:

| Layer | File | Responsibility |
|-------|------|----------------|
| Model | `js/model.js` | TodoItem factory, input validation, `LocalStorageRepository` (CRUD) |
| View | `js/view.js` | DOM build/update, event delegation, filters UI, empty state, animations |
| Controller | `js/app.js` | User interaction handling, orchestrates Model↔View, filter/edit state |

Data is persisted in the browser's `localStorage` under the key `todo_items`.

## Data Format

```json
{
  "id": "m3xq8f2k1a",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1720000000000
}
```

## Browser Support

- Chrome ≥ 90
- Firefox ≥ 90
- Edge ≥ 90
- Safari ≥ 15

## License

MIT — see [LICENSE](LICENSE).
