/* ================================================================
   Todo List App — app.js
   ================================================================
   Module: Storage Layer (TASK-3)
   - localStorage wrapper with error handling
   ================================================================ */

/* ---- Storage Module ---- */
var Storage = (function () {
  var STORAGE_KEY = 'todo_items';

  function getTodos() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data === null) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Storage.getTodos: failed to read todos', e);
      return [];
    }
  }

  function saveTodos(todos) {
    try {
      var json = JSON.stringify(todos);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.warn('Storage.saveTodos: failed to save todos', e);
    }
  }

  return {
    getTodos: getTodos,
    saveTodos: saveTodos
  };
})();

/* ---- State Module ---- */
var State = (function () {
  var todos = [];
  var filter = 'all';
  var editingId = null;
  var renderCallback = null;

  function init() {
    todos = Storage.getTodos();
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTodo(title) {
    var item = {
      id: generateId(),
      title: title,
      completed: false
    };
    todos.push(item);
    saveAndRender();
    return item;
  }

  function deleteTodo(id) {
    todos = todos.filter(function (t) {
      return t.id !== id;
    });
    if (editingId === id) {
      editingId = null;
    }
    saveAndRender();
  }

  function toggleTodo(id) {
    todos.forEach(function (t) {
      if (t.id === id) {
        t.completed = !t.completed;
      }
    });
    saveAndRender();
  }

  function updateTodo(id, title) {
    todos.forEach(function (t) {
      if (t.id === id) {
        t.title = title;
      }
    });
    editingId = null;
    saveAndRender();
  }

  function clearCompleted() {
    todos = todos.filter(function (t) {
      return !t.completed;
    });
    saveAndRender();
  }

  function getTodos() {
    return todos;
  }

  function getFilteredTodos() {
    if (filter === 'active') {
      return todos.filter(function (t) { return !t.completed; });
    }
    if (filter === 'completed') {
      return todos.filter(function (t) { return t.completed; });
    }
    return todos;
  }

  function getActiveCount() {
    var count = 0;
    todos.forEach(function (t) {
      if (!t.completed) {
        count += 1;
      }
    });
    return count;
  }

  function getCompletedCount() {
    var count = 0;
    todos.forEach(function (t) {
      if (t.completed) {
        count += 1;
      }
    });
    return count;
  }

  function setFilter(f) {
    filter = f;
    if (renderCallback) {
      renderCallback();
    }
  }

  function getFilter() {
    return filter;
  }

  function setEditing(id) {
    editingId = id;
    if (renderCallback) {
      renderCallback();
    }
  }

  function getEditing() {
    return editingId;
  }

  function saveAndRender() {
    Storage.saveTodos(todos);
    if (renderCallback) {
      renderCallback();
    }
  }

  var exports = {
    init: init,
    addTodo: addTodo,
    deleteTodo: deleteTodo,
    toggleTodo: toggleTodo,
    updateTodo: updateTodo,
    clearCompleted: clearCompleted,
    getTodos: getTodos,
    getFilteredTodos: getFilteredTodos,
    getActiveCount: getActiveCount,
    getCompletedCount: getCompletedCount,
    setFilter: setFilter,
    getFilter: getFilter,
    setEditing: setEditing,
    getEditing: getEditing
  };

  Object.defineProperty(exports, 'onRender', {
    get: function () {
      return renderCallback;
    },
    set: function (fn) {
      renderCallback = fn;
    },
    configurable: true
  });

  return exports;
})();
