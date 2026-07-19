/**
 * model.js — ToDo List 数据模型层
 *
 * 职责：
 *   - TodoItem 数据模型类
 *   - LocalStorageRepository 存储实现
 *   - 数据校验
 */

/* ===========================================
   TodoItem 数据模型
   =========================================== */
class TodoItem {
  /**
   * @param {string} title - 待办事项标题
   * @param {'low'|'medium'|'high'} [priority='medium'] - 优先级
   * @param {boolean} [completed=false] - 是否完成
   */
  constructor(title, priority = 'medium', completed = false) {
    this.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    this.title = title;
    this.completed = completed;
    this.priority = priority;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /** 切换完成状态 */
  toggle() {
    this.completed = !this.completed;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 批量更新字段
   * @param {Partial<Pick<TodoItem, 'title'|'priority'|'completed'>>} data
   */
  update(data) {
    if (data.title !== undefined) this.title = data.title;
    if (data.priority !== undefined) this.priority = data.priority;
    if (data.completed !== undefined) this.completed = data.completed;
    this.updatedAt = new Date().toISOString();
  }
}

/* ===========================================
   ITodoRepository 存储接口
   =========================================== */
/**
 * @interface ITodoRepository
 * @method getAll() - 获取所有待办项
 * @method saveAll(items) - 保存所有待办项
 * @method validate(item) - 校验单条数据
 */

/* ===========================================
   LocalStorageRepository
   =========================================== */
class LocalStorageRepository {
  /**
   * @param {string} [key='todolist_data'] - localStorage 存储键名
   */
  constructor(key = 'todolist_data') {
    this.key = key;
  }

  /** @returns {Array} 所有待办项数组 */
  getAll() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * 保存所有待办项
   * @param {Array} items - 待办项数组
   * @returns {boolean} 是否保存成功
   */
  saveAll(items) {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
      return true;
    } catch (e) {
      console.error('[Model] localStorage save failed:', e.message);
      return false;
    }
  }

  /**
   * 校验单条待办项数据
   * @param {Object} item - 待校验数据
   * @returns {boolean}
   */
  validate(item) {
    if (!item.title || typeof item.title !== 'string') {
      console.warn('[Model] Validation failed: invalid title');
      return false;
    }
    const trimmed = item.title.trim();
    if (trimmed.length === 0 || trimmed.length > 500) {
      console.warn('[Model] Validation failed: title length out of range');
      return false;
    }
    if (!['low', 'medium', 'high'].includes(item.priority)) {
      console.warn('[Model] Validation failed: invalid priority');
      return false;
    }
    return true;
  }
}
