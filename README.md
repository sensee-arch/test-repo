# ToDo List

A zero-dependency, accessible ToDo List web application built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- ✅ **Add tasks** — type and press Enter or click "+ Add"
- 🔄 **Toggle completion** — checkbox marks tasks as done/undone
- ✏️ **Edit in-place** — edit task title via prompt dialog
- 🗑️ **Delete with confirmation** — prevents accidental removal
- 🎯 **Filter** — view All / Active / Completed tasks
- 🧹 **Clear completed** — bulk-remove finished tasks with confirmation
- 💾 **Persistent** — data saved to `localStorage`, survives page refresh
- 🖥️ **Cross-tab sync** — changes in one tab reflect in others automatically
- 🌙 **Dark mode** — automatically adapts to system preference
- ♿ **Accessible** — fully keyboard-operable, ARIA labels, WCAG 2.1 AA contrast
- 📱 **Responsive** — works on desktop and mobile
- 🛡️ **Edge case hardened** — corrupted data recovery, quota overflow warning, input validation, duplicate ID prevention

## Quick Start

Open `index.html` in any modern browser. No build step, no server required.

## Project Structure

```
.
├── index.html       # Entry point — HTML skeleton with ARIA attributes
├── css/
│   └── style.css    # All styles: responsive layout, dark theme, toast, animations
├── js/
│   ├── model.js     # TodoItem model + LocalStorageRepository with edge case handling
│   ├── view.js      # TodoView — DOM rendering, event delegation, animations
│   └── app.js       # TodoController — orchestrates Model and View
└── README.md        # This file
```

## Architecture

| Layer      | File            | Responsibility                                    |
|------------|-----------------|---------------------------------------------------|
| Model      | `js/model.js`   | Data model, validation, storage (CRUD)            |
| View       | `js/view.js`    | DOM rendering, event delegation, animations       |
| Controller | `js/app.js`     | Coordination, interaction handling, cross-tab sync |

## Edge Cases Handled

| Edge case                          | Mitigation                                    |
|------------------------------------|-----------------------------------------------|
| Empty / whitespace-only title      | Rejected at model-level with validation error |
| Title exceeds 200 characters       | Max length enforced in input and model        |
| Corrupted localStorage data        | Auto-reset with backup on boot                |
| localStorage quota exceeded        | Persist error surfaced via toast + footer bar |
| Duplicate item IDs                 | ID collision check on `add()`                 |
| Rapid double-click delete          | Confirmation dialog prevents accidents        |
| Cross-tab data change              | `storage` event listener re-renders on change |
| Missing localStorage support       | Graceful degradation with user-facing alert   |
| `prefers-reduced-motion`           | All animations disabled for accessibility     |

## Development

No build tools or package managers required. Edit files directly and reload.

### Validation rules
- Title: 1–200 characters, non-empty after trim
- ID: generated via `crypto.randomUUID()`
- Dates: ISO 8601 strings

## License

MIT
