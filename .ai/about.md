# About — Project Constitution

> Generative AI Agent Collaboration for test_repo

## 1. Project Overview

- **Project**: test_repo
- **Repository**: `https://github.com/sensee-arch/test-repo`
- **Hub**: 测试Hub (automation test hub)
- **Description**: A collaborative Web-based Todo List application built through multi-agent AI collaboration. Serves as a testing and demonstration ground for AI Agent cooperative development workflows.
- **Source location**: `src/web/todo/` — contains `index.html`, `style.css`, `app.js`
- **ADR location**: `docs/adr/`

## 2. Core Objectives

1. Build a fully functional Todo List Web SPA (Single Page Application)
2. Validate and refine AI Agent collaborative coding workflows
3. Establish standardized AI project collaboration process: requirements → planning → contracts → development → review
4. Document and template reusable patterns for AI-assisted development

## 3. Technical Architecture

### 4-Layer Architecture (Unidirectional Data Flow)

```
Storage → State → Render → Event
```

| Layer | Responsibility |
|-------|---------------|
| Storage | Browser localStorage read/write, JSON serialization, error handling |
| State | In-memory todos[] and filter, CRUD methods, onChange callback |
| Render | DOM generation from state, counters, filter highlights, empty state |
| Event | Event listeners (keyboard + click), delegation, calls State methods |

### Data Flow

1. User input → DOM event → Event handler
2. Event handler calls State method (add/delete/update/toggle/setFilter)
3. State updates in-memory data → calls Storage.saveTodos() for persistence
4. State calls onChange callback → Render re-renders affected DOM
5. Result: user sees updated UI consistent with stored data

### Tech Stack

- **Language**: HTML5, CSS3, Vanilla JavaScript ES6+
- **Storage**: Browser localStorage (key: `todo_items`)
- **External Dependencies**: None. Zero external dependencies. Works from `file://` protocol.
- **Frameworks/Build Tools**: None

## 4. Base Contract

### Branch Naming Convention

- Feature branches: `flyinghub-YYYYMMDDHHmmss`
- Worker branches (legacy): `feat/worker-{id}-{description}`
- Main branch: `main`

### Commit Message Format

- `[Prefix] Description` — e.g., `[Spec] add requirements specification`, `[Coding] implement storage layer`

### Documentation Structure

- `.ai/about.md` — Project constitution (this file)
- `ARCH.md` — Architecture documentation
- `docs/adr/` — Architecture Decision Records

### Output Format

All agent responses must be valid JSON with:
- `content` (string): User-facing message with phase tag prefix
- `status` (string): `ok|done|failed`
- `action_trace` (string, base64-encoded): Agent reasoning record

## 5. Agent Division

| Role | Responsibility | Mode |
|------|--------------|------|
| **Host** | Welcome, opening announcements, status broadcasts | Free Chat |
| **Admin** | Requirements, spec generation, planning, contracts | `/spec` |
| **Developer** | Coding implementation following contracts | `/coding` |
| **Reviewer** | Code review, acceptance testing, verification | `/coding` (review phase) |

### Collaboration Modes

1. **Free Chat** — Discuss ideas, ask questions, plan freely
2. **`/spec`** — Create requirements specification and contract
3. **`/coding`** — Full pipeline: plan → contract → setup → assign → code → review → summary

## 6. Running & Dependencies

### How to Run

1. Open `src/web/todo/index.html` in any modern browser
2. No server required — works directly from `file://` protocol
3. No build steps, no package installation

### Dependencies

- None. The app is a pure frontend SPA without external dependencies.
- Browser requirements: Chrome, Firefox, Edge (modern versions)

### Development Tools

- Standard git workflow
- GitHub for remote collaboration
- AI Agents for code generation and review

## 7. Collaboration Rules

1. **Contract-first**: Complete specification → planning → contracts before coding begins
2. **Minimal dependencies**: Task decomposition minimizes interdependencies; parallel execution where possible
3. **Task dependency graph**: TASK-1∥TASK-3 → TASK-2∥TASK-4 → TASK-5 → TASK-6 → TASK-7 → TASK-8
4. **No empty commits**: Do NOT create empty commits; meaningful changes only
5. **Self-healing**: Attempt auto-fix before reporting failure
6. **Safety first**: Follow privacy, security, content safety, transparency, and security isolation principles
7. **Incremental delivery**: Each task must produce a functional increment when possible

## 8. Evolution Principles

1. The project constitution (this file) is a living document — update as the project evolves
2. Architecture decisions should be recorded in `docs/adr/` for traceability
3. New requirements first go through `/spec` mode before implementation
4. Technical debt should be documented and addressed in subsequent iterations
5. Templates and patterns proven effective should be extracted for reuse in future projects
