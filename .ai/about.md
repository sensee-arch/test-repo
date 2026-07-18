# .ai/about.md — AI Agent Project Constitution

> Last updated: 2026-07-18
> Repository: [sensee-arch/test-repo](https://github.com/sensee-arch/test-repo)

---

## 1. Project Overview

- **Name**: test-repo
- **Purpose**: An experimental/test repository for AI Agent collaborative programming workflows. This project serves as a sandbox to validate multi-agent development patterns, standardize collaboration protocols, and produce reusable templates.
- **Scope**: Backend API prototyping, workflow validation, and template/knowledge-base accumulation. The project does not target production deployment; it is a development and experimentation ground.
- **Status**: Scaffold phase — basic project skeleton established, awaiting feature tasks.

## 2. Core Objectives

- ✅ Establish a standardized AI Agent collaboration workflow (demand → spec → plan → task → develop → review)
- ✅ Provide a flexible tech sandbox for rapid prototyping with Python/FastAPI
- ✅ Accumulate reusable templates, conventions, and best-practice documents
- ✅ Validate end-to-end agent workflow across branch management, coding, and review phases
- ❌ Not aiming for production-grade availability, monitoring, or multi-region deployment
- ❌ Not targeting end-user products or public-facing services

## 3. Technical Architecture

- **Architecture Style**: Modular RESTful API (serves as the primary backend prototype)
- **Tech Stack**:
  - Language: Python 3.10+
  - Web Framework: FastAPI (async-first)
  - Data Validation: Pydantic v2
  - Database: SQLite (dev) / PostgreSQL (production-ready via SQLAlchemy)
  - Testing: pytest + httpx (async test client)
  - Code Quality: Ruff (linter + formatter), mypy (type checking)
- **Projected Module Layout**:
  - `src/core/` — Core business logic
  - `src/api/` — API route definitions
  - `src/models/` — Pydantic/schema models
  - `src/services/` — Business service layer
  - `src/utils/` — Utility functions
  - `tests/` — Unit + integration tests
- **Communication**: REST over HTTP/1.1, JSON request/response bodies
- **Current State**: No application code yet — only requirements, license, and documentation

### Dependency Summary (requirements.txt)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.104.0 | Web framework |
| uvicorn[standard] | >=0.24.0 | ASGI server |
| pydantic | >=2.5.0 | Data validation |

### Dev Dependencies (requirements-dev.txt)

| Package | Version | Purpose |
|---------|---------|---------|
| pytest | >=7.4.0 | Test runner |
| pytest-cov | >=4.1.0 | Coverage reporting |
| ruff | >=0.1.0 | Linter + formatter |
| httpx | >=0.25.0 | HTTP test client |

## 4. Base Contract

### Data Conventions
- **API Format**: All request/response bodies use JSON (Content-Type: `application/json`)
- **Error Response**: HTTP error responses follow RFC 7807 Problem Details (or a simplified uniform schema: `{ "detail": "<error message>", "code": "<error_code>" }`)
- **ID Format**: UUID v4 strings for resource identifiers
- **Timestamps**: ISO 8601 strings in UTC (e.g., `"2026-07-18T07:48:00Z"`)

### Code Conventions
- **Style**: PEP 8 enforced via Ruff
- **Naming**:
  - Classes: `PascalCase`
  - Functions/methods: `snake_case`
  - Variables: `snake_case`
  - Constants: `UPPER_SNAKE_CASE`
  - Private members: `_prefix`
- **Typing**: All function parameters and return values MUST have type annotations
- **Imports**: Grouped as stdlib → third-party → local; sorted via Ruff

### Prohibited Behaviors
- ❌ No `eval()`, `exec()`, or `__import__()` dynamic code execution
- ❌ No hardcoded secrets or tokens in source code
- ❌ No direct `os.system()` or `subprocess(shell=True)` without sanitization
- ❌ No modification of files outside the project working directory

## 5. Agent Division

| Role | Responsibility | Input | Output |
|------|---------------|-------|--------|
| **Host** | Channel host; sends welcome/status broadcasts | User messages | Group chat messages |
| **Manager** | Requirements analysis, solution design, contract drafting | User requirements + Spec | Plan + Contract documents |
| **Developer** | Feature implementation, code commits | Task descriptions (Plan) | Code changes + git commits |
| **Reviewer** | Code review, AC verification, quality gate | Code files + source manifest | Review report |

## 6. Running & Dependencies

### Prerequisites
- Python 3.10+
- Git 2.x

### Setup

```bash
# Clone
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo

# Virtual environment
python3 -m venv venv
source venv/bin/activate

# Install
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Run Development Server
```bash
uvicorn src.api.main:app --reload --port 8000
```

### Run Tests
```bash
pytest tests/ -v --cov=src
```

### Run Linter
```bash
ruff check src/ tests/
ruff format src/ tests/ --check
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./dev.db` | Database connection string |

## 7. Collaboration Rules

### Workflow Order
```
需求描述 → [Manager] /spec → [Manager] /plan → [Developer] code → [Reviewer] review → merge
```
No implementation may begin before Spec, Plan, and Contract are documented.

### Branch Strategy
- `main` — Stable branch, always deployable or ready for next feature
- `flyinghub-YYYYMMDDHHmmss` — Feature/development branches for each FlyingHub session
- Feature branches are short-lived; merge to `main` after review

### Commit Convention
```
<type>: <short description>

[optional body]
```
Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

### Logging
- All agent operations are recorded via `action_trace` (Base64-encoded Markdown with sections: Reasoning → Decision → Action → Observation → Reflection)
- Status is reported via `content` and `status` fields in structured outputs

### Context Isolation
- Each FlyingHub session maintains its own branch and documentation independently
- No cross-Hub state sharing or assumption of historical memory

## 8. Evolution Principles

- **Contract-first**: New features MUST complete Spec → Plan → Contract documentation before any code is written
- **Module boundaries**: New capabilities preferred via new modules/directories rather than modifying existing module boundaries
- **ADR location**: `docs/adr/` — Architecture Decision Records stored as numbered markdown files
- **Simplicity first**: No over-engineering; "good enough" for validation beats "perfect" that ships late
- **Testing mandatory**: Core logic must be testable; new features must include corresponding tests
- **Self-documenting**: Code changes should be accompanied by documentation updates in `.ai/` or `docs/`
- **Retrospective**: After each feature cycle, update this constitution if patterns or conventions have evolved
