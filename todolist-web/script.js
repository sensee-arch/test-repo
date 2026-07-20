// #region DataManager

/**
 * DataManager — TodoList 数据管理层
 * 封装 localStorage CRUD 操作、数据校验和统计功能
 */
class DataManager {
  constructor(storageKey = 'todolist_data') {
    this.storageKey = storageKey;
  }

  /**
   * 从 localStorage 读取并解析 Todo 数组
   * @returns {Array} Todo[]
   */
  _read() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * 将 Todo 数组写入 localStorage
   * @param {Array} todos
   */
  _write(todos) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(todos));
    } catch (e) {
      console.error('[DataManager] localStorage write failed:', e);
    }
  }

  /**
   * 生成 UUID v4，兜底方案
   * @returns {string}
   */
  _uuid() {
    try {
      return crypto.randomUUID();
    } catch {
      return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }
  }

  /**
   * 排序：按 createdAt 降序，已完成排在末尾
   * @param {Array} todos
   * @returns {Array}
   */
  _sort(todos) {
    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * 获取所有 Todo，已排序
   * @returns {Array} Todo[]
   */
  getAll() {
    return this._sort(this._read());
  }

  /**
   * 根据 ID 获取单个 Todo
   * @param {string} id
   * @returns {object|null}
   */
  getById(id) {
    const todos = this._read();
    return todos.find(t => t.id === id) || null;
  }

  /**
   * 添加新 Todo
   * @param {string} title
   * @returns {object} Todo
   * @throws {Error} 输入校验失败时抛出
   */
  add(title) {
    const trimmed = title.trim();
    if (!trimmed || trimmed.length > 200) {
      throw new Error('Title must be non-empty and ≤ 200 characters');
    }
    const todos = this._read();
    const todo = {
      id: this._uuid(),
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos.push(todo);
    this._write(todos);
    return todo;
  }

  /**
   * 更新 Todo 字段
   * @param {string} id
   * @param {object} fields - 要合并的字段
   * @returns {object|null} 更新后的 Todo，找不到返回 null
   * @throws {Error} title 校验失败时抛出
   */
  update(id, fields) {
    const todos = this._read();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return null;

    // title 校验
    if (fields.title !== undefined) {
      const trimmed = fields.title.trim();
      if (!trimmed || trimmed.length > 200) {
        throw new Error('Title must be non-empty and ≤ 200 characters');
      }
      fields.title = trimmed;
    }

    todos[index] = {
      ...todos[index],
      ...fields,
      updatedAt: new Date().toISOString(),
    };
    this._write(todos);
    return todos[index];
  }

  /**
   * 删除 Todo
   * @param {string} id
   */
  remove(id) {
    const todos = this._read();
    const filtered = todos.filter(t => t.id !== id);
    if (filtered.length === todos.length) return;
    this._write(filtered);
  }

  /**
   * 切换完成状态并重新排序
   * @param {string} id
   * @returns {object|null} 切换后的 Todo
   */
  toggle(id) {
    const todos = this._read();
    const todo = todos.find(t => t.id === id);
    if (!todo) return null;
    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    this._write(todos);
    // 返回排序后的结果
    const sorted = this._sort(todos);
    return sorted.find(t => t.id === id);
  }

  /**
   * 统计信息
   * @returns {{ total: number, active: number, done: number }}
   */
  stats() {
    const todos = this._read();
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    return { total, active: total - done, done };
  }
}

// #endregion

// #region App

/**
 * App — TodoList UI 控制器
 * 负责 DOM 渲染、事件绑定、内联编辑和全局交互控制
 */
class App {
  /**
   * @param {DataManager} dataManager
   */
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.todos = [];
    this.editingId = null;

    // DOM references
    this.inputEl = document.getElementById('todo-input-field');
    this.addBtn = document.getElementById('add-btn');
    this.listEl = document.getElementById('todo-list');
    this.totalCountEl = document.getElementById('total-count');
    this.activeCountEl = document.getElementById('active-count');
    this.doneCountEl = document.getElementById('done-count');
  }

  /**
   * Bootstrap: 加载数据、绑定事件、首次渲染
   */
  init() {
    this.todos = this.dataManager.getAll();
    this._bindEvents();
    this.render();
  }

  // ─── Event Binding ───

  _bindEvents() {
    // 添加任务：点击按钮
    this.addBtn.addEventListener('click', () => this._handleAdd());

    // 添加任务：输入框 Enter
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._handleAdd();
      }
    });

    // 事件委托：点击（切换完成 / 删除）
    this.listEl.addEventListener('click', (e) => {
      const item = e.target.closest('.todo-item');
      if (!item) return;
      const id = item.dataset.id;

      if (e.target.closest('.delete-btn')) {
        this._handleDelete(id);
      } else if (e.target.closest('.todo-checkbox')) {
        this._handleToggle(id);
      }
    });

    // 双击标题：进入内联编辑
    this.listEl.addEventListener('dblclick', (e) => {
      const title = e.target.closest('.todo-title');
      if (!title) return;
      const item = title.closest('.todo-item');
      if (!item) return;
      this._startEditing(item.dataset.id);
    });

    // 键盘事件：内联编辑 Enter 保存 / Escape 取消
    this.listEl.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== 'Escape') return;
      const editInput = e.target.closest('.edit-input');
      if (!editInput) return;
      const item = editInput.closest('.todo-item');
      if (!item) return;

      e.preventDefault();
      if (e.key === 'Enter') {
        this._finishEditing(item.dataset.id, editInput.value);
      } else {
        this._cancelEditing(item.dataset.id);
      }
    });

    // focusout（冒泡版 blur）：失焦取消编辑
    // 使用 capture + setTimeout 避免与 Enter/Escape 冲突
    this.listEl.addEventListener('focusout', (e) => {
      const editInput = e.target.closest('.edit-input');
      if (!editInput) return;
      const item = editInput.closest('.todo-item');
      if (!item) return;
      const id = item.dataset.id;
      setTimeout(() => {
        if (this.editingId === id) {
          this._cancelEditing(id);
        }
      }, 200);
    });
  }

  // ─── Actions ───

  _handleAdd() {
    this._clearMessage();
    this.inputEl.style.borderColor = '';

    const title = this.inputEl.value;
    if (!title.trim()) {
      this.inputEl.style.borderColor = '#e74c3c';
      this._showMessage('请输入任务内容', 'error');
      this.inputEl.focus();
      return;
    }

    try {
      this.dataManager.add(title);
      this.inputEl.value = '';
      this.inputEl.style.borderColor = '';
      this.todos = this.dataManager.getAll();
      this.render();
    } catch (e) {
      this._showMessage(e.message, 'error');
    }
  }

  _handleToggle(id) {
    try {
      this.dataManager.toggle(id);
      this.todos = this.dataManager.getAll();
      this.render();
    } catch (e) {
      console.warn('[App] Toggle failed:', e);
      this._showMessage('操作失败，请重试', 'error');
    }
  }

  _handleDelete(id) {
    try {
      this.dataManager.remove(id);
      this.todos = this.dataManager.getAll();
      this.render();
    } catch (e) {
      console.warn('[App] Delete failed:', e);
      this._showMessage('删除失败，请重试', 'error');
    }
  }

  // ─── Inline Editing ───

  _startEditing(id) {
    if (this.editingId) this._cancelEditing(this.editingId);

    this.editingId = id;
    const item = this.listEl.querySelector(`[data-id="${id}"]`);
    if (!item) return;

    item.classList.add('editing');
    const editInput = item.querySelector('.edit-input');
    const titleEl = item.querySelector('.todo-title');
    if (editInput && titleEl) {
      editInput.value = titleEl.textContent;
      // 使用 requestAnimationFrame 确保 DOM 更新后再聚焦
      requestAnimationFrame(() => {
        editInput.focus();
        editInput.select();
      });
    }
  }

  _finishEditing(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      this._showMessage('任务内容不能为空', 'error');
      // 保持编辑状态，重新聚焦
      const item = this.listEl.querySelector(`[data-id="${id}"]`);
      if (item) {
        const editInput = item.querySelector('.edit-input');
        if (editInput) editInput.focus();
      }
      return;
    }

    try {
      this.dataManager.update(id, { title: trimmed });
      this.editingId = null;
      this.todos = this.dataManager.getAll();
      this.render();
    } catch (e) {
      this._showMessage(e.message, 'error');
      const item = this.listEl.querySelector(`[data-id="${id}"]`);
      if (item) {
        const editInput = item.querySelector('.edit-input');
        if (editInput) editInput.focus();
      }
    }
  }

  _cancelEditing(id) {
    if (this.editingId !== id) return;
    this.editingId = null;
    const item = this.listEl.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.classList.remove('editing');
    }
  }

  // ─── Rendering ───

  /**
   * 全量重绘 Todo 列表
   * 使用 document.createElement + textContent，禁止 innerHTML
   */
  render() {
    this.listEl.innerHTML = '';

    if (this.todos.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = '暂无任务，添加一个吧';
      this.listEl.appendChild(emptyMsg);
      this.renderStats();
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const todo of this.todos) {
      const item = document.createElement('div');
      item.className = 'todo-item';
      item.dataset.id = todo.id;
      if (todo.completed) item.classList.add('completed');

      // 复选框
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', `标记 "${todo.title}" 为${todo.completed ? '未完成' : '已完成'}`);

      // 标题
      const title = document.createElement('span');
      title.className = 'todo-title';
      title.textContent = todo.title;

      // 内联编辑输入框（默认隐藏，.editing 时显示）
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-input';
      editInput.value = todo.title;
      editInput.setAttribute('aria-label', `编辑 "${todo.title}"`);

      // 删除按钮
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.setAttribute('aria-label', `删除 "${todo.title}"`);
      deleteBtn.title = '删除任务';

      item.appendChild(checkbox);
      item.appendChild(title);
      item.appendChild(editInput);
      item.appendChild(deleteBtn);
      fragment.appendChild(item);
    }

    this.listEl.appendChild(fragment);
    this.renderStats();
  }

  /**
   * 更新底部统计信息
   */
  renderStats() {
    const stats = this.dataManager.stats();
    this.totalCountEl.textContent = stats.total;
    this.activeCountEl.textContent = stats.active;
    this.doneCountEl.textContent = stats.done;
  }

  // ─── Message / Error Display ───

  _showMessage(text, type = 'info') {
    this._clearMessage();
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.id = 'app-message';
    msg.textContent = text;

    const container = document.querySelector('.app-container');
    const inputArea = document.getElementById('todo-input');
    container.insertBefore(msg, inputArea.nextSibling);

    // 3 秒后自动消失
    setTimeout(() => {
      const el = document.getElementById('app-message');
      if (el) el.remove();
    }, 3000);
  }

  _clearMessage() {
    const msg = document.getElementById('app-message');
    if (msg) msg.remove();
  }
}

// #endregion
