# Test Repo - Project Constitution

## 1. Project Overview
A Todo List Web App with FastAPI backend and vanilla JS frontend. Supports CRUD, filtering, inline editing, and localStorage persistence.

## 2. Core Objectives
- Full CRUD: create, read, update, delete todo items
- Filtering: all / active / completed views
- Inline editing: double-click to edit, Enter to save
- Persistence: localStorage with 5MB capacity
- Security: XSS protection via textContent, try-catch for storage

## 3. Technical Architecture
MVC 3-layer pattern: Store -> Renderer -> EventHandler
Frontend: HTML5 + CSS3 + Vanilla JS (ES6+)
Backend: FastAPI + Uvicorn + Pydantic
Persistence: localStorage (5MB), JSON serialization

## 4. Base Contract
3 Workers, 9 tasks (TASK-1~TASK-9), 5 phases, 5 checkpoints

## 5. Agent Division
Worker-A (UI Engineer): TASK-1 HTML structure, TASK-2 CSS styles
Worker-B (JS Core): TASK-3 Store, TASK-4 Renderer, TASK-5 EventHandler, TASK-6 Edit, TASK-7 Filter/Clear, TASK-8 Edge cases
Worker-C (Integration): TASK-9 End-to-end acceptance testing

## 6. Running & Dependencies
Deps: FastAPI, Uvicorn, Pydantic, pytest, ruff, httpx
Frontend: single index.html, no build tools required

## 7. Collaboration Rules
Branch strategy: main -> dev -> feat/task-xx
PR workflow: feature branch -> PR -> review -> merge
Daily sync, 2h blocker response, interface change notification

## 8. Evolution Principles
textContent only for user data (no innerHTML)
try-catch for localStorage read/write failures
Browser support: Chrome / Firefox / Safari / Edge
Single HTML file delivery, no build step