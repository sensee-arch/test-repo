// js/view.js — Rendering Engine & DOM Management

class TodoView {
  constructor() {
    this.app = document.getElementById('app');
    this.render();
  }

  // ── Initial render ──────────────────────────────────────────

  render() {
    this.app.innerHTML = `
      <main class="todo-app" role="main">
        <header class="todo-header">
          <h1 class="todo-title">todos</h1>
          <p class="todo-subtitle">A simple ToDo list</p>
        </header>

        <section class="todo-main" aria-label="Todo list">
          <form class="todo-form" id="todo-form" aria-label="Add new todo">
            <input
              type="text"
              id="todo-input"
              class="todo-input"
              placeholder="What needs to be done?"
              autofocus
              aria-label="New todo item"
              maxlength="500"
            />
            <button type="submit" class="todo-add-btn" aria-label="Add todo">
              <span aria-hidden="true">+</span>
              <span class="sr-only">Add</span>
            </button>
          </form>

          <div class="todo-list-container" id="todo-list-container">
            <ul class="todo-list" id="todo-list" role="list" aria-label="Todo items"></ul>
            <div class="todo-empty" id="todo-empty">
              <p>No tasks yet. Add one above!</p>
            </div>
          </div>

          <footer class="todo-footer" id="todo-footer">
            <span class="todo-count" id="todo-count">0 items left</span>
            <div class="todo-filters" role="group" aria-label="Filter todos">
              <button class="filter-btn active" data-filter="all" aria-pressed="true">All</button>
              <button class="filter-btn" data-filter="active" aria-pressed="false">Active</button>
              <button class="filter-btn" data-filter="completed" aria-pressed="false">Completed</button>
            </div>
            <button class="todo-clear-btn" id="clear-completed" aria-label="Clear completed items">Clear completed</button>
          </footer>
        </section>

        <template id="todo-item-template">
          <li class="todo-item" role="listitem">
            <input type="checkbox" class="todo-checkbox" aria-label="Toggle completion" />
            <label class="todo-label"></label>
            <button class="todo-delete-btn" aria-label="Delete task">&times;</button>
          </li>
        </template>
      </main>
    `;

    this.cacheElements();
  }

  // ── DOM cache ───────────────────────────────────────────────

  cacheElements() {
    this.form = document.getElementById('todo-form');
    this.input = document.getElementById('todo-input');
    this.list = document.getElementById('todo-list');
    this.empty = document.getElementById('todo-empty');
    this.footer = document.getElementById('todo-footer');
    this.count = document.getElementById('todo-count');
    this.filters = document.querySelectorAll('.filter-btn');
    this.clearBtn = document.getElementById('clear-completed');
    this.template = document.getElementById('todo-item-template');
  }

  // ── List rendering ──────────────────────────────────────────

  renderList(items, filter = 'all') {
    this.list.innerHTML = '';

    const filtered = items.filter(item => {
      if (filter === 'active') return !item.completed;
      if (filter === 'completed') return item.completed;
      return true;
    });

    if (filtered.length === 0) {
      this.list.classList.add('hidden');
      this.empty.classList.remove('hidden');
    } else {
      this.list.classList.remove('hidden');
      this.empty.classList.add('hidden');
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(item => {
      fragment.appendChild(this.createTodoElement(item));
    });
    this.list.appendChild(fragment);

    this.updateCount(items);
  }

  createTodoElement(item) {
    const clone = this.template.content.cloneNode(true);
    const li = clone.querySelector('.todo-item');
    const checkbox = clone.querySelector('.todo-checkbox');
    const label = clone.querySelector('.todo-label');
    const deleteBtn = clone.querySelector('.todo-delete-btn');

    li.dataset.id = item.id;
    checkbox.checked = item.completed;
    label.textContent = item.title;
    li.classList.toggle('completed', item.completed);

    // Entry animation
    li.style.opacity = '0';
    li.style.transform = 'translateY(-8px)';
    requestAnimationFrame(() => {
      li.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    });

    return li;
  }

  // ── Single element mutations ────────────────────────────────

  updateTodoElement(item) {
    const li = this.list.querySelector(`[data-id="${item.id}"]`);
    if (!li) return;
    li.querySelector('.todo-checkbox').checked = item.completed;
    li.querySelector('.todo-label').textContent = item.title;
    li.classList.toggle('completed', item.completed);
  }

  removeTodoElement(id) {
    const li = this.list.querySelector(`[data-id="${id}"]`);
    if (!li) return;
    li.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    li.style.opacity = '0';
    li.style.transform = 'translateX(20px)';
    setTimeout(() => li.remove(), 200);
  }

  // ── Count / filter buttons / clear ──────────────────────────

  updateCount(items) {
    const n = items.filter(i => !i.completed).length;
    this.count.textContent = `${n} item${n !== 1 ? 's' : ''} left`;
  }

  updateFilterButtons(filter) {
    this.filters.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  updateClearButton(items) {
    this.clearBtn.style.display = items.some(i => i.completed) ? '' : 'none';
  }

  // ── Input helpers ───────────────────────────────────────────

  getInputValue() {
    const val = this.input.value.trim();
    this.input.value = '';
    return val;
  }

  showError(msg) {
    const existing = this.app.querySelector('.todo-error');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'todo-error';
    el.textContent = msg;
    el.setAttribute('role', 'alert');
    this.form.after(el);

    setTimeout(() => {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }
}
