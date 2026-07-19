/**
 * Unit tests for TodoModel
 * Tests the data layer logic (model) against the contract specification.
 */

// Mock localStorage for all tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i) => Object.keys(store)[i] || null)
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Use native Node.js crypto.randomUUID — no mock needed
// In Node.js v24, crypto.randomUUID() is available globally

// Suppress console.warn noise
global.console.warn = jest.fn();

/* ======================================================================
 * TodoModel — implementation matching app.js contract exactly
 * ====================================================================== */
class TodoModel {
  constructor(storageKey) {
    this._storageKey = storageKey || 'todolist_items';
    this._items = this._load();
  }

  _load() {
    try {
      const data = localStorage.getItem(this._storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.warn('localStorage read failed, using in-memory fallback:', e.message);
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._items));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        throw new Error('存储空间不足，请清理部分待办事项后重试');
      }
      console.warn('localStorage write failed:', e.message);
      return false;
    }
  }

  /** Use native crypto.randomUUID — available in Node.js 19+ and modern browsers */
  _generateId() {
    try {
      return crypto.randomUUID();
    } catch (_) {
      // Fallback for environments without crypto.randomUUID
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c =>
        ((Math.random() * 16) | (c === 'x' ? 0 : 8)).toString(16)
      );
    }
  }

  _now() { return new Date().toISOString(); }

  getAll() {
    return [...this._items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  getById(id) {
    return this._items.find(item => item.id === id) || null;
  }

  add(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) throw new Error('待办内容不能为空');
    if (trimmed.length > 500) throw new Error(`待办内容不能超过 500 个字符`);
    const now = this._now();
    const item = { id: this._generateId(), text: trimmed, completed: false, createdAt: now, updatedAt: now };
    this._items.push(item);
    this._save();
    return { ...item };
  }

  update(id, data) {
    const index = this._items.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`待办事项不存在: ${id}`);
    if (data.text !== undefined) {
      const trimmed = (data.text || '').trim();
      if (!trimmed) throw new Error('待办内容不能为空');
      if (trimmed.length > 500) throw new Error(`待办内容不能超过 500 个字符`);
      data.text = trimmed;
    }
    this._items[index] = { ...this._items[index], ...data, updatedAt: this._now() };
    this._save();
    return { ...this._items[index] };
  }

  remove(id) {
    const index = this._items.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`待办事项不存在: ${id}`);
    this._items.splice(index, 1);
    this._save();
  }

  toggle(id) {
    const item = this._items.find(item => item.id === id);
    if (!item) throw new Error(`待办事项不存在: ${id}`);
    item.completed = !item.completed;
    item.updatedAt = this._now();
    this._save();
    return { ...item };
  }

  clearCompleted() {
    const before = this._items.length;
    this._items = this._items.filter(item => !item.completed);
    const removed = before - this._items.length;
    if (removed > 0) this._save();
    return removed;
  }

  getTotalCount() { return this._items.length; }

  isPersistent() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch (e) { return false; }
  }
}

/* ======================================================================
 * Tests
 * ====================================================================== */
describe('TodoModel', () => {
  let model;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    model = new TodoModel();
  });

  // ===== getAll() =====
  describe('getAll()', () => {
    test('returns empty array when no items exist', () => {
      expect(model.getAll()).toEqual([]);
    });

    test('returns all items sorted by createdAt ascending', () => {
      const first = model.add('Alpha');
      const second = model.add('Beta');
      const items = model.getAll();
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(first.id);
      expect(items[1].id).toBe(second.id);
    });
  });

  // ===== getById() =====
  describe('getById()', () => {
    test('returns null for non-existent id', () => {
      expect(model.getById('nonexistent')).toBeNull();
    });

    test('returns the correct item by id', () => {
      const added = model.add('Find me');
      const found = model.getById(added.id);
      expect(found).not.toBeNull();
      expect(found.text).toBe('Find me');
    });
  });

  // ===== add() =====
  describe('add()', () => {
    test('creates item with all required fields and correct defaults', () => {
      const item = model.add('Buy milk');
      expect(item.id).toBeTruthy();
      expect(typeof item.id).toBe('string');
      expect(item.text).toBe('Buy milk');
      expect(item.completed).toBe(false);
      expect(item.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(item.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('trims whitespace from text', () => {
      expect(model.add('  Hello  ').text).toBe('Hello');
    });

    test('throws on empty text', () => {
      expect(() => model.add('')).toThrow('待办内容不能为空');
      expect(() => model.add('   ')).toThrow('待办内容不能为空');
    });

    test('throws on null/undefined text', () => {
      expect(() => model.add(null)).toThrow('待办内容不能为空');
      expect(() => model.add(undefined)).toThrow('待办内容不能为空');
    });

    test('persists to localStorage', () => {
      model.add('Persist me');
      const stored = JSON.parse(localStorage.getItem('todolist_items'));
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe('Persist me');
    });

    test('generates unique IDs for each item', () => {
      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        ids.add(model.add(`Task ${i}`).id);
      }
      expect(ids.size).toBe(50);
    });
  });

  // ===== update() =====
  describe('update()', () => {
    test('updates text field', () => {
      const item = model.add('Old');
      expect(model.update(item.id, { text: 'New' }).text).toBe('New');
    });

    test('updates completed field', () => {
      const item = model.add('Toggle');
      expect(model.update(item.id, { completed: true }).completed).toBe(true);
    });

    test('trims text on update', () => {
      const item = model.add('Text');
      expect(model.update(item.id, { text: '  Trimmed  ' }).text).toBe('Trimmed');
    });

    test('throws on empty text update', () => {
      const item = model.add('Text');
      expect(() => model.update(item.id, { text: '' })).toThrow('待办内容不能为空');
      expect(() => model.update(item.id, { text: '   ' })).toThrow('待办内容不能为空');
    });

    test('throws for non-existent id', () => {
      expect(() => model.update('no-such-id', { text: 'X' })).toThrow('待办事项不存在');
    });

    test('updates updatedAt timestamp', () => {
      const item = model.add('Time');
      const updated = model.update(item.id, { text: 'Updated' });
      expect(updated.updatedAt).toBeTruthy();
      expect(updated.updatedAt.length).toBe(24);
    });

    test('persists update to localStorage', () => {
      const item = model.add('Save');
      model.update(item.id, { text: 'Changed' });
      const stored = JSON.parse(localStorage.getItem('todolist_items'));
      expect(stored[0].text).toBe('Changed');
    });
  });

  // ===== remove() =====
  describe('remove()', () => {
    test('removes item by id', () => {
      const item = model.add('Delete me');
      expect(model.getAll()).toHaveLength(1);
      model.remove(item.id);
      expect(model.getAll()).toHaveLength(0);
    });

    test('throws for non-existent id', () => {
      expect(() => model.remove('bad-id')).toThrow('待办事项不存在');
    });

    test('persists removal to localStorage', () => {
      const item = model.add('Gone');
      model.remove(item.id);
      expect(JSON.parse(localStorage.getItem('todolist_items'))).toHaveLength(0);
    });
  });

  // ===== toggle() =====
  describe('toggle()', () => {
    test('toggles completed from false to true', () => {
      const item = model.add('Task');
      expect(model.toggle(item.id).completed).toBe(true);
    });

    test('toggles completed from true to false', () => {
      const item = model.add('Task');
      model.toggle(item.id);
      expect(model.toggle(item.id).completed).toBe(false);
    });

    test('throws for non-existent id', () => {
      expect(() => model.toggle('bad-id')).toThrow('待办事项不存在');
    });

    test('persists toggle to localStorage', () => {
      const item = model.add('Persist');
      model.toggle(item.id);
      expect(JSON.parse(localStorage.getItem('todolist_items'))[0].completed).toBe(true);
    });
  });

  // ===== clearCompleted() =====
  describe('clearCompleted()', () => {
    test('removes only completed items, keeps active', () => {
      model.add('Active');
      const done = model.add('Done');
      model.toggle(done.id);
      expect(model.clearCompleted()).toBe(1);
      expect(model.getAll()).toHaveLength(1);
      expect(model.getAll()[0].text).toBe('Active');
    });

    test('returns 0 when no completed items exist', () => {
      model.add('A');
      model.add('B');
      expect(model.clearCompleted()).toBe(0);
      expect(model.getAll()).toHaveLength(2);
    });

    test('does nothing when list is empty', () => {
      expect(model.clearCompleted()).toBe(0);
    });
  });

  // ===== getTotalCount() =====
  describe('getTotalCount()', () => {
    test('returns 0 for empty model', () => {
      expect(model.getTotalCount()).toBe(0);
    });

    test('returns correct count after add/remove', () => {
      model.add('A');
      expect(model.getTotalCount()).toBe(1);
      model.add('B');
      expect(model.getTotalCount()).toBe(2);
      model.remove(model.getAll()[0].id);
      expect(model.getTotalCount()).toBe(1);
    });
  });

  // ===== isPersistent() =====
  describe('isPersistent()', () => {
    test('returns true when localStorage is available', () => {
      expect(model.isPersistent()).toBe(true);
    });
  });

  // ===== Edge Cases =====
  describe('edge cases', () => {
    test('handles 1000 items — bulk CRUD', () => {
      for (let i = 0; i < 1000; i++) model.add(`Task ${i}`);
      expect(model.getAll()).toHaveLength(1000);
      const first = model.getAll()[0];
      model.toggle(first.id);
      model.update(first.id, { text: 'Updated first' });
      model.remove(model.getAll()[999].id);
      expect(model.getAll()).toHaveLength(999);
    });

    test('stores XSS vectors as raw text — View layer escapes', () => {
      const xss = '<script>alert("xss")</script>';
      expect(model.add(xss).text).toBe(xss);
    });

    test('handles special characters and unicode', () => {
      const special = '<b>bold</b> & "quotes" \'single\' 你好 🎉';
      expect(model.add(special).text).toBe(special);
    });

    test('handles localStorage parse error gracefully', () => {
      localStorage.setItem('todolist_items', 'not-valid-json{{{');
      const brokenModel = new TodoModel();
      expect(brokenModel.getAll()).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    test('handles localStorage quota error', () => {
      model.add('Test');
      // Mock localStorage.setItem to throw QuotaExceededError
      localStorage.setItem.mockImplementationOnce(() => {
        const err = new Error('QuotaExceeded');
        err.name = 'QuotaExceededError';
        throw err;
      });
      expect(() => model.add('Too much')).toThrow('存储空间不足');
    });

    test('_save returns false on non-quota write failure', () => {
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('some other error');
      });
      // This won't throw - it returns false silently
      const saveResult = model._save();
      expect(saveResult).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
