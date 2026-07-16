# About test-repo

## 1. Project Overview
- **Name**: test-repo
- **Repository**: https://github.com/sensee-arch/test-repo
- **Description**: Automated testing Hub project. A web-based Todo List Single Page Application built with pure HTML/CSS/JS (vanilla frontend), with plans to extend to a FastAPI backend.
- **Language**: JavaScript (ES6+), HTML5, CSS3
- **Project Status**: Active development

## 2. Core Objectives
- ✅ **Todo List SPA**: Fully functional single-page application with CRUD operations, localStorage persistence, filter views, and inline editing
- ⏳ **FastAPI Backend**: Planned migration to client-server architecture with Python/FastAPI backend
- Build a clean, maintainable codebase with clear separation of concerns (Store/Renderer/EventHandler pattern)

## 3. Technical Architecture
### Current (Frontend SPA)
```
index.html (single file application)
├── Store Layer     → State management + localStorage persistence
├── Renderer Layer  → DOM construction + view updates
└── EventHandler    → Event binding + orchestration
```
### Planned (Full Stack)
```
src/web/todo/ (frontend) + src/api/ (FastAPI backend)
```

## 4. Base Contract
- All AI Agents must read `.ai/about.md` before making changes
- Follow the existing code style and architecture patterns
- Use feature branches for all changes (format: `flyinghub-YYYYMMDDHHmmss`)
- Each task must be committed individually with clear commit messages

## 5. Agent Division
| Agent | Responsibility |
|-------|---------------|
| Javis (Host) | Project coordination, code review, architecture decisions |
| Dev Agents | Feature implementation per task breakdown |

## 6. Running & Dependencies
- **Runtime**: No build tools needed. Open `src/web/todo/index.html` directly in browser.
- **Dependencies** (current): None (pure HTML/CSS/JS)
- **Dev dependencies**: Git for version control
- **Planned deps**: FastAPI, Uvicorn, Pydantic (for backend)

## 7. Collaboration Rules
- All changes on feature branches, not `main`
- Feature branch naming: `flyinghub-YYYYMMDDHHmmss`
- Push frequently to avoid large unreviewed diffs
- Keep commit messages descriptive

## 8. Evolution Principles
- Start minimal, extend incrementally
- Prioritize clean architecture over speed
- Document architectural decisions as they evolve
