/**
 * app.js — ToDo List 控制器层（Controller）
 *
 * 职责：
 *   - 协调 Model 与 View
 *   - 用户交互处理（添加、删除、切换、批量操作）
 *   - 筛选 / 排序状态管理
 *   - 应用初始化
 */

/* ===========================================
   TodoApp 控制器
   =========================================== */
class TodoApp {
  constructor() {
    /** @type {LocalStorageRepository} */
    this.repo = new LocalStorageRepository();

    /** @type {TodoListView} */
    this.view = new TodoListView();

    /** @type {Array} */
    this.items = [];

    /** @type {'all'|'active'|'completed'} */
    this.filter = 'all';

    /** @type {'created-desc'|'created-asc'|'priority'|'title'} */
    this.sortBy = 'created-desc';

    this._init();
  }

  /* ===========================================
     初始化
     =========================================== */

  _init() {
    this._loadData();
    this._bindEvents();
    this._render();
  }

  /** 从 localStorage 加载数据 */
  _loadData() {
    const raw = this.repo.getAll();
    this.items = raw.map((d) => {
      const item = new TodoItem(d.title, d.priority, d.completed);
      item.id = d.id;
      item.createdAt = d.createdAt;
      item.updatedAt = d.updatedAt;
      return item;
    });
  }

  /** 写入 localStorage */
  _persist() {
    this.repo.saveAll(this.items);
  }

  /* ===========================================
     事件绑定
     =========================================== */

  _bindEvents() {
    // 提交表单
    const form = document.getElementById('todo-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleAdd();
      });
    }

    // 列表事件委托（点击删除、切换复选框）
    if (this.view.listEl) {
      this.view.listEl.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        if (!li) return;
        const id = li.dataset.id;

        if (e.target.classList.contains('todo-delete')) {
          this._handleDelete(id);
        }
      });

      this.view.listEl.addEventListener('change', (e) => {
        if (e.target.classList.contains('todo-checkbox')) {
          const li = e.target.closest('.todo-item');
          if (li) this._handleToggle(li.dataset.id);
        }
      });
    }

    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document
          .querySelectorAll('.filter-btn')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.dataset.filter;
        this._render();
      });
    });

    // 排序
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this._render();
      });
    }

    // 清除已完成
    const clearBtn = document.getElementById('clear-completed');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this._handleClearCompleted();
      });
    }

    // 全部切换
    const toggleBtn = document.getElementById('toggle-all');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this._handleToggleAll();
      });
    }
  }

  /* ===========================================
     操作处理器
     =========================================== */

  /** 添加待办事项 */
  _handleAdd() {
    const input = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('todo-priority');
    if (!input || !prioritySelect) return;

    const title = input.value.trim();
    const priority = prioritySelect.value;

    if (!title) {
      input.focus();
      return;
    }

    const item = new TodoItem(title, priority);

    if (!this.repo.validate(item)) {
      console.warn('[App] Item validation failed, skipping');
      return;
    }

    this.items.unshift(item);
    this._persist();
    this._render();

    // 清空输入并保持焦点
    input.value = '';
    input.focus();
  }

  /** 删除待办事项 */
  _handleDelete(id) {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return;

    this.items.splice(idx, 1);
    this._persist();

    // 动画删除
    this.view.removeItem(id, () => {
      this._updateEmptyState();
      this._updateStats();
    });
  }

  /** 切换完成状态 */
  _handleToggle(id) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    item.toggle();
    this._persist();
    this._render();
  }

  /** 清除所有已完成项 */
  _handleClearCompleted() {
    const completedIds = this.items
      .filter((i) => i.completed)
      .map((i) => i.id);

    if (completedIds.length === 0) return;

    // 播放删除动画
    let removed = 0;
    const total = completedIds.length;

    completedIds.forEach((id) => {
      this.view.removeItem(id, () => {
        removed++;
        if (removed === total) {
          this.items = this.items.filter((i) => !i.completed);
          this._persist();
          this._render();
        }
      });
    });

    // 回退：2s 后强制清除
    setTimeout(() => {
      if (removed < total) {
        this.items = this.items.filter((i) => !i.completed);
        this._persist();
        this._render();
      }
    }, 2000);
  }

  /** 全部切换 (active↔completed) */
  _handleToggleAll() {
    const activeItems = this.items.filter((i) => !i.completed);
    const allCompleted = activeItems.length === 0;

    this.items.forEach((i) => {
      i.completed = allCompleted ? false : true;
      i.updatedAt = new Date().toISOString();
    });

    this._persist();
    this._render();
  }

  /* ===========================================
     数据加工：筛选 + 排序
     =========================================== */

  /**
   * 获取筛选排序后的数据副本
   * @returns {Array}
   */
  _getFilteredAndSorted() {
    let result = [...this.items];

    // 筛选
    switch (this.filter) {
      case 'active':
        result = result.filter((i) => !i.completed);
        break;
      case 'completed':
        result = result.filter((i) => i.completed);
        break;
      // 'all' 不做过滤
    }

    // 排序
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    switch (this.sortBy) {
      case 'created-desc':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'created-asc':
        result.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'priority':
        result.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        // 同优先级按创建时间降序
        result.sort((a, b) => {
          const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (pDiff !== 0) return pDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
        break;
    }

    return result;
  }

  /* ===========================================
     渲染
     =========================================== */

  /** 全量渲染（视图 + 统计 + 空状态） */
  _render() {
    const filtered = this._getFilteredAndSorted();
    this.view.render(filtered);
    this._updateStats();
  }

  /** 仅更新统计 */
  _updateStats() {
    const total = this.items.length;
    const active = this.items.filter((i) => !i.completed).length;
    const completed = total - active;
    this.view.updateStats(total, active, completed);
  }

  /** 根据数据调整空状态 */
  _updateEmptyState() {
    if (this.items.length === 0) {
      this.view.showEmpty();
    } else if (this.listEl && this.listEl.children.length === 0) {
      this.view.showEmpty();
    }
  }
}

/* ===========================================
   入口
   =========================================== */
document.addEventListener('DOMContentLoaded', function () {
  try {
    new TodoApp();
    console.log('[App] ToDo List initialized successfully');
  } catch (e) {
    console.error('[App] Initialization failed:', e.message);
  }
});
