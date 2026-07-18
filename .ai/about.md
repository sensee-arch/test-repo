# .ai/about.md — AI Agent Project Constitution

## Project Overview

- **Project**: test-repo — an experimental AI Agent collaborative programming testbed
- **Repository**: https://github.com/sensee-arch/test-repo
- **Tech Stack**: Python 3.10+ / FastAPI / Pydantic / SQLite
- **License**: MIT
- **Purpose**: Validate and exercise multi-Agent collaborative development workflows (spec → plan → contract → coding → review), establish standardized AI project collaboration processes, and explore reusable templates and conventions.

## Core Objectives

- ✅ Establish end-to-end Agent collaboration workflow: requirements analysis → spec → plan → task assignment → coding → code review → merge
- ✅ Standardize Agent communication protocols, document templates, and output formats
- ✅ Provide a flexible playground for rapid prototyping and technical validation
- ✅ Build reusable Spec, Plan, Contract, and Review templates
- ✅ Record and consolidate practical experience in AI-assisted development
- ❌ Not a production service — no deployment, no user-facing SLA
- ❌ Not a monolithic application — modular, extensible, composable

## Technical Architecture

- **Architecture Style**: Modular monolith evolving toward service-oriented; RESTful API backend + file-based documentation layer
- **Core Components**:
  - `src/api/` — FastAPI route handlers (REST endpoints)
  - `src/models/` — Pydantic data models (request/response schemas, DB models)
  - `src/core/` — Business logic (service layer)
  - `src/services/` — External integration services (GitHub, etc.)
  - `src/utils/` — Utility functions (logging, encoding, validation)
  - `tests/` — pytest test suite (unit + integration)
  - `docs/adr/` — Architecture Decision Records
  - `.ai/` — AI Agent workspace (about.md, specs, plans, contracts)
- **Communication**: REST over HTTP (JSON request/response); agent-to-agent via file-based handoff (`.ai/` directory)
- **Data Flow**: User Input → Agent Manager (Spec/Plan) → Agent Developer (Code) → Agent Reviewer (Review) → Git Commit
- **Persistence**: SQLite for development; PostgreSQL-ready for production

## Base Contract

### Data Contracts
- All API request/response bodies use Pydantic v2 models for validation
- Error responses follow a consistent JSON envelope: `{"detail": "<message>", "code": "<error_code>"}`
- Paginated responses include `items`, `total`, `page`, `page_size`
- Timestamps are ISO-8601 strings in UTC

### Git Conventions
- Branch format: `flyinghub-YYYYMMDDHHmmss` for feature work from FlyingHub triggers
- Commit message format: `<type>: <description>` where type ∈ `feat|fix|docs|refactor|test|chore|style`
- `main` branch is always deployable; feature branches merge via PR

### File Conventions
- Source code root: `src/`
- Test mirror: `tests/` mirrors `src/` structure — `tests/api/`, `tests/core/`, etc.
- Agent work products: `.ai/`
- Architecture decisions: `docs/adr/`
- ReasonML/design decisions captured in `docs/adr/ADR-*.md`

### Quality Gates
- All new code must have corresponding unit tests
- `ruff` linting must pass before merge
- Coverage ≥ 80% for core modules
- No `print()` in production code — use `logging`

## Agent Division

| Agent | Responsibility | Input Source | Output Destination |
|-------|---------------|--------------|-------------------|
| Boot | Project initialization, git operations, environment setup | User command / FlyingHub trigger | Chat status + workspace files |
| Manager | Requirements analysis, spec writing, plan decomposition, contract definition | User needs + Spec template | `.ai/spec.md`, `.ai/plan.md`, `.ai/contract.md` |
| Developer | Implementation per task, code submission within feature branch | `.ai/task-NNN.md` | Code files + git commits |
| Reviewer | Code review, AC validation, test coverage check | Code diff + `.ai/contract.md` | Review report in `.ai/review.md` |
| Host | Chat coordination, status broadcast, gateway to human | Event triggers | Chat messages |

## Running & Dependencies

### Runtime Environment
- Python 3.10+ (venv at `.venv/`)
- Dependencies defined in `requirements.txt` and `requirements-dev.txt`

### Quick Start
```bash
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
# Start dev server
uvicorn src.main:app --reload --port 8000
```

### Testing
```bash
pytest --cov=src --cov-report=term-missing
```

### Linting
```bash
ruff check src/
```

### Key Dependencies
- **fastapi>=0.104.0** — HTTP framework
- **uvicorn[standard]>=0.24.0** — ASGI server
- **pydantic>=2.5.0** — Data validation
- **pytest>=7.4.0** — Testing framework
- **ruff>=0.1.0** — Python linter
- **httpx>=0.25.0** — HTTP client (testing)

## Collaboration Rules

### Workflow
```
User request → [Boot: setup] → [Manager: spec → plan → contract]
→ [Developer: code → commit → push] → [Reviewer: review] → Merge → [Boot: report]
```

### Logging & Tracing
- All Agent actions must produce an `action_trace` (base64-encoded Markdown with Reasoning/Decision/Action/Observation/Reflection)
- Key decisions recorded as ADRs in `docs/adr/`
- Agent output files stored in `.ai/` per session

### Handoff Protocol
- Each Agent writes its output to a well-known path before notifying the next Agent
- Outputs include: `status` (done/failed), `content` (human-readable brief), `action_trace` (machine-readable trace)
- Agents do NOT rely on session memory — all state passes through files

### Prohibited Behaviors
- No hardcoded tokens, secrets, or credentials in code
- No `eval()`, `exec()`, or dynamic code generation
- No modifications outside the designated workspace (`../` path traversal)
- No silent fallbacks without logging

## Evolution Principles

1. **Contract-first**: Every feature starts with Spec → Plan → Contract documentation before any code
2. **Modularity over monolith**: New capabilities are added as new modules first, not by expanding existing ones
3. **Documentation as code**: `.ai/about.md` (this file), `ARCH.md`, and ADRs live alongside source code and must be kept in sync
4. **Incremental improvement**: Prefer small, testable, mergable increments over large rewrites
5. **Retrospective capture**: After each milestone, update `.ai/about.md` and relevant ADRs with lessons learned
6. **No assumption of history**: Each session starts fresh — all context must be in files, not in model memory
