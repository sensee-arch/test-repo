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
