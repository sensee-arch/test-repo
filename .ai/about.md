# .ai/about.md — AI Agent Project Constitution

> Repository: sensee-arch/test-repo
> Updated: 2026-07-18

---

## 1. Project Overview

- **Name**: test-repo
- **Type**: Python/FastAPI multi-Agent collaboration experiment platform
- **Purpose**: Flexible experimental field for AI Agent collaborative programming — multiple AI Agents (Developers, Reviewers, Managers, Hosts) coordinate via git workflow to design, implement, and review features within a unified architectural framework
- **Scope**: This project does **not** serve real users in production; it exists to validate AI Agent collaboration workflows, standardize processes, and accumulate best practices
- **Key Documents**:
  - `ARCH.md` — Architecture document (design decisions, tech stack rationale)
  - `.ai/about.md` — This file; single source of truth for AI Agents
  - `docs/adr/` — Architecture Decision Records

## 2. Core Objectives

- ✅ Validate and exercise AI Agent collaborative programming workflows
- ✅ Establish a standardized AI project collaboration pipeline: Requirements → Spec → Plan → Task → Develop → Review → Merge
- ✅ Explore reusable AI Agent collaboration templates and conventions
- ✅ Document and accumulate practical experience from AI-assisted development
- ✅ Provide a FastAPI scaffold ready for quick prototyping and verification
- ❌ Not targeting production deployment or real user traffic
- ❌ Not pursuing multi-device sync, PWA, or push notifications unless explicitly scoped

## 3. Technical Architecture

- **Architecture Style**: Modular monolith with clear separation of concerns
- **Language**: Python 3.10+
- **Web Framework**: FastAPI (>=0.104.0)
- **ASGI Server**: Uvicorn[standard] (>=0.24.0)
- **Data Validation**: Pydantic (>=2.5.0)
- **RESTful API** with future option for WebSocket support
- **Optional Frontend**: Vanilla HTML/CSS/JS SPA (separate page per feature, e.g. Todo List)
- **Data Layer**: In-memory, localStorage, or file-based (backend not yet selected; SQLite/PostgreSQL reserved for later)
- **Testing**: pytest + pytest-cov + httpx (for async test client)
- **Linting**: ruff (>=0.1.0)
- **CI**: GitHub Actions (configured per feature branch)

### Directory Convention

```
test-repo/
├── src/                  # Source code (Python packages)
│   ├── core/            # Core business logic
│   ├── api/             # FastAPI route handlers
│   ├── models/          # Pydantic data models
│   ├── services/        # Business service layer
│   └── utils/           # Utility functions
├── tests/               # Test suite
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── docs/                # Documentation
│   └── adr/            # Architecture Decision Records
├── scripts/             # Helper scripts
├── .ai/                 # AI Agent workspace
├── requirements.txt     # Production dependencies
├── requirements-dev.txt # Development dependencies
├── ARCH.md              # Architecture document
├── README.md            # Project readme
└── LICENSE              # License
```

## 4. Base Contract

- **Data Format**: All JSON-serializable objects with Pydantic validation
- **API Semantics**: RESTful (GET/POST/PUT/PATCH/DELETE) with consistent error responses
- **Error Handling**: FastAPI exception handlers, no crash-on-bad-input; 400/404/422/500 consistent schema
- **Forbidden**: `eval()`, `exec()`, `pickle.load()` on untrusted data; `innerHTML` for user content in frontend
- **Type Annotations**: Required on all function signatures (parameters + return types)
- **Commit Convention**: `<type>: <short description>` where type ∈ {feat, fix, docs, refactor, test, chore, style}
- **Branch Naming**:
  - Feature/task branches: `feat/<name>` or `flyinghub-YYYYMMDDHHmmss`
  - Always branch from `main`, merge via PR
- **Test Requirement**: Core logic must have pytest coverage; CI must pass before merge

## 5. Agent Division

| Role | Responsibility | Input | Output |
|------|---------------|-------|--------|
| 🎙️ Host | Group chat host, broadcasts status and summaries | User messages | Group chat messages |
| 🧠 Manager | Requirement analysis, spec/plan/contract design | User needs + Spec | Plan + Contract documents |
| 💻 Developer | Code implementation, git commits | Task description | Code commits, PRs |
| 👀 Reviewer | Code review, acceptance criteria verification | Code files, PR | Review report (pass/fail + comments) |
| 🚀 (Boot) | Environment setup, branch creation, project analysis | Repo URL | Working branch & `.ai/about.md` |

Each Agent role is stateless between sessions — all context is carried via git-managed documents and branch state.

## 6. Running & Dependencies

### Runtime
- Python 3.10+
- pip-based dependency management

### Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Start Server
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Run Tests
```bash
pytest
```

### Lint
```bash
ruff check .
```

### Dev Dependencies
- `pytest>=7.4.0` / `pytest-cov>=4.1.0` — test framework + coverage
- `ruff>=0.1.0` — fast Python linter
- `httpx>=0.25.0` — async HTTP client (for FastAPI TestClient)

## 7. Collaboration Rules

- **Contract-First**: Any new feature must complete Spec → Plan → Contract before coding
- **Context Isolation**: Each Hub maintains independent branches and documents; no cross-Hub state sharing
- **No Assumptions**: Never assume global state or historical memory — always read current files
- **Logging**: Agent actions logged via `action_log` (base64-encoded JSON) with steps, errors, results
- **Boot Procedure**: Every new session starts with `git pull` + branch creation + `.ai/about.md` check
- **Commit Responsibility**: Developer commits must be testable; Reviewer must verify before approving merge
- **ADR Maintenance**: Significant architectural decisions recorded in `docs/adr/` for traceability

## 8. Evolution Principles

- **Contract over Implementation**: New features require a documented contract before any code
- **Add, Don't Break**: New capabilities prefer new modules over modifying existing module boundaries
- **Testable, Not Fragile**: Core logic must be unit-testable; avoid tight coupling to frameworks
- **Simple First**: No over-engineering; choose the simplest solution that satisfies the current need
- **Replaceable Components**: Decouple via interfaces so individual components can be swapped out
- **Document Reasoning**: `.ai/about.md` and `ARCH.md` capture the "why" behind decisions, not just the "what"
- **ADR Location**: `docs/adr/` — each decision is a numbered file with date, context, decision, consequences
