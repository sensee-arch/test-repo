# .ai/about.md — Project Constitution

## Project Overview

- **Name:** test-repo
- **Type:** Experimental Python project — AI Agent collaborative programming testbed
- **Repository:** https://github.com/sensee-arch/test-repo
- **Description:** A scaffolding/template project for exercising multi-Agent collaborative workflows on GitHub. Serves as a sandbox for requirements → planning → task assignment → development → review pipelines.
- **Status:** Initial scaffolding phase — no application source code on `main` yet. Configuration, tooling, and documentation established.

## Core Objectives

- ✅ Establish a standardized multi-Agent collaboration workflow (Spec → Plan → Contract → Dev → Review)
- ✅ Provide a reproducible project scaffold with Python/FastAPI toolchain
- ✅ Archive reusable templates, ADRs, and process artifacts
- ✅ Verify GitHub-based Agent coordination including branch operations, PR workflows, and CI triggers
- ❌ Not a production application — no deployment, no real users
- ❌ Not a framework or library — will not be published to PyPI/npm

## Technical Architecture

- **Language:** Python 3.10+ (virtual env at `.venv/`)
- **Web framework:** FastAPI (via `fastapi>=0.104.0`, `uvicorn[standard]`)
- **Data validation:** Pydantic v2
- **Testing:** pytest + pytest-cov + httpx (for async test client)
- **Linting:** Ruff
- **API style:** RESTful (planned)
- **Database:** SQLite (dev) / PostgreSQL (production) — not yet configured
- **No frontend code on `main`** — UI work lives in feature branches

### Key files on `main`

| File | Purpose |
|------|---------|
| `requirements.txt` | Production deps: FastAPI, uvicorn, pydantic |
| `requirements-dev.txt` | Dev deps: pytest, ruff, httpx |
| `ARCH.md` | Architecture document (expanded) |
| `.ai/about.md` | This file — AI project constitution |
| `.ai/workspace.md` | Session workspace metadata |

## Base Contract

- Branch format: `flyinghub-YYYYMMDDHHmmss` for boot branches; `feat/<name>` for feature branches
- Commit format: `<type>: <description>` — types: feat, fix, docs, refactor, test, chore, style
- `main` is the stable trunk — always deployable, no WIP code
- All PRs must pass review before merge to main
- `action_trace` field (base64 Markdown with Reasoning/Decision/Action/Observation/Reflection) required for non-trivial operations
- **Forbidden:** `innerHTML` with user content; `eval()` / `new Function()`; `../` path traversal; plaintext credentials in output

### Error Handling

- localStorage operations: silent degrade with `console.warn`
- API errors: structured JSON error response (planned)
- Auto-fix: retry 2-3 times before escalation

## Agent Division

| Agent | Responsibility | Input | Output |
|-------|---------------|-------|--------|
| **Manager** | Requirements analysis, spec writing, plan decomposition, contract authoring | User request / group message | `spec.md`, `plan.md`, `contract.md` |
| **Developer** | Coding, testing, committing | Task description | Code commits, test results |
| **Reviewer** | Code review, AC verification, PR approval | Changed files, test output | Review report (pass/fail/changes requested) |
| **Host** | Chat coordination, status broadcast, environment bootstrap | User commands | Status messages in group chat |

## Running & Dependencies

- **Runtime:** Python 3.10+ (`.venv/` already set up)
- **Start command:** `uvicorn main:app --reload` (after implementing `main.py`)
- **Tests:** `pytest` (with coverage: `pytest --cov`)
- **Lint:** `ruff check .`
- **Branch operation:** `git checkout -b flyinghub-<timestamp>` from `main`
- No Docker, no build tools, no external services required for development

## Collaboration Rules

1. **Contract-first:** Spec → Plan → Contract must precede any code changes
2. **Isolation:** Each Hub maintains its own branch and documents — no cross-Hub state sharing
3. **Traceability:** All operations logged via `action_trace` base64 field
4. **Self-healing:** Errors auto-resolved (retry 2-3×) before escalation
5. **Review required:** Every PR needs at least one Agent review before merge

## Evolution Principles

- Contract before implementation — no coding without prior Spec and Contract
- New capabilities add new modules; never break existing module boundaries
- ADRs (Architecture Decision Records) stored in `docs/adr/` as new decisions are made
- This document evolves alongside the project — update when architecture, conventions, or agent roles change
