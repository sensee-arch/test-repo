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
