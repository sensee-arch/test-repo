/**
 * view.js — ToDo List 视图层（渲染引擎）
 *
 * 职责：
 *   - DOM 构建与更新
 *   - 空状态展示 / 隐藏
 *   - 统计信息更新
 *   - 动画效果
 */

/* ===========================================
   TodoListView 视图类
   =========================================== */
class TodoListView {
  constructor() {
    // DOM 缓存
    this.listEl = document.getElementById('todo-list');
    this.emptyStateEl = document.getElementById('empty-state');
    this.statsTotal = document.getElementById('stats-total');
    this.statsActive = document.getElementById('stats-active');
    this.statsCompleted = document.getElementById('stats-completed');

    if (!this.listEl || !this.emptyStateEl) {
      throw new Error('[View] Required DOM elements missing');
    }
  }

  /* ---- 批量渲染 ---- */

  /**
   * 渲染待办列表
   * @param {Array} todos - 待办事项数组
   */
  render(todos) {
    // 清空列表
    this.listEl.innerHTML = '';

    if (!todos || todos.length === 0) {
      this.showEmpty();
      return;
    }

    this.hideEmpty();

    // 逐个创建并插入 DOM（批量）
    const fragment = document.createDocumentFragment();
    todos.forEach((todo, index) => {
      const li = this.createTodoElement(todo, index);
      fragment.appendChild(li);
    });
    this.listEl.appendChild(fragment);
  }

  /* ---- 单个元素创建 ---- */

  /**
   * 创建单个待办项 DOM 元素
   * @param {Object} todo - 待办项数据
   * @param {number} index - 在列表中的位置（动画延迟）
   * @returns {HTMLLIElement}
   */
  createTodoElement(todo, index = 0) {
    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    li.dataset.id = todo.id;

    const priorityLabels = { high: '高', medium: '中', low: '低' };
    const created = new Date(todo.createdAt);

    // 智能时间显示
    const now = new Date();
    const isToday =
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate();

    let timeStr;
    if (isToday) {
      timeStr = created.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      timeStr = created.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    li.innerHTML =
      '<input type="checkbox" class="todo-checkbox" ' +
      (todo.completed ? 'checked' : '') +
      ' aria-label="标记完成">' +
      '<span class="todo-title">' +
      this.escapeHtml(todo.title) +
      '</span>' +
      '<span class="todo-priority ' +
      todo.priority +
      '">' +
      (priorityLabels[todo.priority] || '中') +
      '</span>' +
      '<span class="todo-time">' +
      timeStr +
      '</span>' +
      '<button class="todo-delete" aria-label="删除待办事项">&times;</button>';

    // 入场动画（交错延迟）
    const delay = Math.min(index * 40, 300);
    li.style.animation = `slideIn 0.25s ease-out ${delay}ms both`;
    li.dataset.animating = 'true';
    setTimeout(() => {
      li.style.animation = '';
      delete li.dataset.animating;
    }, delay + 280);

    return li;
  }

  /* ---- 空状态切换 ---- */

  showEmpty() {
    this.listEl.style.display = 'none';
    this.emptyStateEl.classList.remove('hidden');
  }

  hideEmpty() {
    this.listEl.style.display = '';
    this.emptyStateEl.classList.add('hidden');
  }

  /* ---- 统计更新 ---- */

  /**
   * 更新统计栏
   * @param {number} total - 总数
   * @param {number} active - 待办数
   * @param {number} completed - 已完成数
   */
  updateStats(total, active, completed) {
    if (this.statsTotal) this.statsTotal.textContent = '总计: ' + total;
    if (this.statsActive) this.statsActive.textContent = '待办: ' + active;
    if (this.statsCompleted)
      this.statsCompleted.textContent = '已完成: ' + completed;
  }

  /* ---- 单项删除动画 ---- */

  /**
   * 播放删除动画后移除元素
   * @param {string} id - 待办项 ID
   * @param {Function} [onComplete] - 动画完成回调
   */
  removeItem(id, onComplete) {
    const el = this.listEl.querySelector('[data-id="' + CSS.escape(id) + '"]');
    if (!el) return;

    el.classList.add('removing');
    const handler = function () {
      el.removeEventListener('transitionend', handler);
      if (typeof onComplete === 'function') onComplete();
    };
    el.addEventListener('transitionend', handler);
    // 回退：250ms 后强制移除
    setTimeout(() => {
      el.removeEventListener('transitionend', handler);
      if (el.parentNode) el.parentNode.removeChild(el);
      if (typeof onComplete === 'function') onComplete();
    }, 300);
  }

  /* ---- 辅助方法 ---- */

  /**
   * HTML 转义（防 XSS）
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, function (ch) {
      return map[ch];
    });
  }
}
