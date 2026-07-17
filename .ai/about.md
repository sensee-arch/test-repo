# .ai/about.md — AI Agent Project Constitution

## Project Overview

- This is an **experimental/playground project** designed to validate AI Agent collaborative coding workflows
- Repository: `sensee-arch/test-repo` → a sandbox for multi-agent teamwork (Spec → Plan → Task → Code → Review)
- Current state: infrastructure scaffolded (Python venv, dependencies, docs); no application code written yet
- Not a production service — this is a research/process-validation space

## Core Objectives

- ✅ Validate end-to-end AI Agent collaboration pipeline (requirements → implementation → review → merge)
- ✅ Establish standardized workflow templates reusable across projects
- ✅ Explore optimal Agent role division and handoff protocols
- ✅ Document and iterate on collaboration best practices
- ❌ Not aiming for production readiness, user-facing features, or long-term maintenance

## Technical Architecture

- **Architecture style**: To be determined per feature — flexible monolith or modular API
- **Recommended stack**: Python 3.10+ / FastAPI / uvicorn / Pydantic (already installed in `.venv`)
- **Testing**: pytest + pytest-cov + httpx
- **Linting**: Ruff
- **Storage**: SQLite (dev) / configurable
- **No frontend bound yet** — future tasks will decide SPA vs API-only
- **Communication**: RESTful API (planned), no event bus or message queue at this stage

## Base Contract

- All source code lives under `src/`, organized by layer: `core/`, `api/`, `models/`, `services/`, `utils/`
- Tests in `tests/` mirror `src/` structure: `tests/unit/`, `tests/integration/`
- Configuration via environment variables with `.env.example` as the template
- JSON logging for structured Agent-readable output
- **No secrets in code** — credentials via env or `.env` (gitignored)
- Python code must have type annotations; linted with Ruff before commit

### Commit Convention

```
<type>: <short description>

<body (optional)>
```

| Type       | Usage                |
|------------|----------------------|
| `feat`     | New feature          |
| `fix`      | Bug fix              |
| `docs`     | Documentation        |
| `refactor` | Code restructuring   |
| `test`     | Test additions       |
| `chore`    | Build/tooling/config |
| `style`    | Formatting only      |

## Agent Division

| Role       | Responsibility                                      | Input              | Output              |
|------------|-----------------------------------------------------|--------------------|---------------------|
| Boot       | Environment setup, git operations, status broadcast | Repo info          | Ready workspace     |
| Manager    | Requirements analysis, spec writing, task breakdown | User request       | Spec + Plan + Tasks |
| Developer  | Implementation, unit tests, git commits             | Task description   | Committed code      |
| Reviewer   | Code review, AC verification, PR feedback           | PR / code diff     | Review report       |

## Running & Dependencies

- **Python**: 3.10+ (`.venv` created at project root)
- **Dependencies**:
  - `requirements.txt` — `fastapi`, `uvicorn[standard]`, `pydantic`
  - `requirements-dev.txt` — `pytest`, `pytest-cov`, `ruff`, `httpx`
- **Activation**: `source ~/.openclaw/workspace/test-repo/.venv/bin/activate`
- **Dev server**: `uvicorn src.api.main:app --reload`
- **Testing**: `pytest --cov=src tests/`
- **Linting**: `ruff check src/`
- **No Docker / Node.js / database server required for development**

## Collaboration Rules

1. **Contract-first**: Every feature must have Spec → Plan → Contract before coding
2. **Branch-per-feature**: Branch name format `flyinghub-YYYYMMDDHHmmss` from `main`
3. **Review gate**: All non-trivial PRs require at least one Agent Review
4. **Solo-repo isolation**: Each Hub session operates on its own branch; no cross-Hub state sharing
5. **Audit trail**: All Agent actions logged via `action_trace` (Base64-encoded Markdown)

## Evolution Principles

- **Iterate over design**: Quick validate → learn → rewrite over over-engineering upfront
- **Template-first**: Reusable specs, plans, and task templates are first-class artifacts
- **Backward compatibility** not required — experimental nature permits breaking changes
- **ADR tracking**: Architectural decisions logged in `docs/adr/` with ADR format
- **This document evolves**: Constitution should be updated when project direction changes
