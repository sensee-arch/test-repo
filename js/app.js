/**
 * App — Entry point
 * Initializes the TodoList application.
 */

import { TodoController } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
  const controller = new TodoController();
  controller.init();
});
