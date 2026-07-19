# ToDo List Web Application

A minimalist, fully offline ToDo List web app built with vanilla HTML, CSS, and JavaScript. No build tools, no dependencies — just open `index.html` and go.

## Features

- ➕ **Add tasks** with a title (max 500 characters)
- ✅ **Toggle completion** — click the checkbox or title
- ✏️ **Inline edit** — click "Edit" to modify a task title
- 🗑️ **Delete tasks** — remove individual tasks
- 🔍 **Filter** — All / Active / Completed
- 🔀 **Sort** — by creation date (newest) or title (A-Z)
- 🧹 **Clear completed** — batch delete all done tasks
- 💾 **Persistent storage** — data saved to browser localStorage
- 🌙 **Dark mode** — automatic based on system preference
- ♿ **Accessible** — semantic HTML, ARIA roles, keyboard support

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| HTML       | Semantic HTML5, ARIA roles    |
| CSS        | CSS3, Flexbox, custom props   |
| JavaScript | ES6+ (classes, modules, etc.) |
| Storage    | localStorage (key: `todolist_data`) |

## Project Structure

```
.
├── index.html       # Application shell (semantic HTML)
├── css/
│   └── style.css    # Responsive styles, dark mode, WCAG AA
├── js/
│   ├── model.js     # TodoItem model + LocalStorageRepository
│   ├── view.js      # DOM rendering engine + event delegation
│   └── app.js       # Controller (orchestrates Model & View)
└── README.md
```

## Architecture

The app follows a **Model-View-Controller (MVC)** pattern:

```
┌──────────┐    ┌──────────┐    ┌──────────────┐
│  Model   │◄──►│Controller│──►│    View      │
│ (data +  │    │ (state + │   │ (DOM render) │
│  storage)│    │  logic)  │   │              │
└──────────┘    └──────────┘   └──────────────┘
     │                                │
     ▼                                ▼
 localStorage                    DOM Tree
```

## Usage

1. Open `index.html` in any modern browser.
2. Type a task in the input field and press **Add** or hit **Enter**.
3. Click a task's checkbox or text to mark it as done.
4. Use **Edit** to modify a task, **Del** to remove it.
5. Filter tasks using the **All / Active / Completed** buttons.
6. Sort tasks using the dropdown (Created / Title).

## Browser Support

All modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions).

## Development

No build tools required. Edit the source files directly and reload `index.html`.

```bash
# Serve locally with any HTTP server for best experience
python3 -m http.server 8000
# or
npx serve .
```

## License

MIT
