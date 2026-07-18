# Todo List Web Application

A zero-dependency vanilla JavaScript single-page Todo List application with localStorage persistence.

## Features

- **CRUD operations** — Add, view, edit, delete todo items
- **Completion toggle** — Mark items as complete/incomplete with visual feedback
- **Filter views** — All / Active / Completed
- **Inline editing** — Double-click to edit any todo title
- **Persistent storage** — Data saved to browser localStorage, survives refreshes
- **Responsive design** — Works on desktop and mobile
- **Accessibility** — ARIA labels, keyboard navigation, focus management

## Usage

Open `index.html` in any modern browser. No server or build step required.

## Tech Stack

- HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- localStorage API for persistence
- Zero external dependencies

## Project Structure

```
├── index.html    — DOM structure & entry point
├── styles.css    — Visual presentation & responsive layout
├── app.js        — Model (todoStore) + View (todoApp) controller
├── ARCH.md       — Architecture documentation
├── .ai/about.md  — Project constitution & contracts
└── README.md     — This file
```

## License

MIT
