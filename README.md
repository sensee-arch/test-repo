# ToDo List

A minimalist, zero-dependency ToDo List web application built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Add tasks** — type a description and press Enter or click "Add"
- **Mark complete** — toggle the circular checkbox
- **Delete tasks** — hover to reveal the ✕ delete button
- **Filter** — view All / Active / Completed tasks
- **Sort** — by creation date or title (A-Z)
- **Clear completed** — remove all finished tasks with one click
- **Persistent storage** — data saved to browser `localStorage`
- **Dark mode** — automatically adapts to system preference
- **Keyboard accessible** — fully operable with Tab, Enter, and Space keys
- **Responsive** — works on desktop and mobile

## Live Demo

Open `index.html` in any modern browser. No build step, no server required.

## Tech Stack

| Layer   | Technology  | Description                  |
|---------|-------------|------------------------------|
| Model   | JavaScript  | TodoItem, Repository pattern |
| View    | JavaScript  | DOM rendering, event delegation |
| Controller | JavaScript | User interaction coordination |
| HTML    | HTML5       | Semantic, ARIA labels        |
| CSS     | CSS3        | Responsive, dark/light theme |
| Storage | localStorage | Browser-native persistence   |

## Project Structure

```
.
├── index.html       # Entry point (HTML skeleton)
├── css/
│   └── style.css    # All styles (responsive, themes)
├── js/
│   ├── model.js     # TodoItem model + LocalStorageRepository
│   ├── view.js      # TodoView renderer + event delegation
│   └── app.js       # TodoController (orchestrator)
└── README.md        # This file
```

## Development

No build tools or package managers required. To run:

1. Clone the repository
2. Open `index.html` in your browser

To modify styles or logic, edit the corresponding files under `css/` or `js/`.

## WCAG Compliance

- All interactive elements are keyboard-operable
- Color contrast ratios meet WCAG 2.1 AA standards
- ARIA labels and roles applied throughout
- `prefers-reduced-motion` respected

## License

MIT
