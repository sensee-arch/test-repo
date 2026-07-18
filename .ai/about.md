# .ai/about.md — AI Agent Project Constitution

## Project Overview

- **Repository**: [sensee-arch/test-repo](https://github.com/sensee-arch/test-repo)
- **Type**: Experimental / testing project serving as a collaborative AI Agent programming playground
- **Purpose**: Validate and exercise AI Agent collaborative workflows, establish standardized processes (requirement → plan → develop → review), explore reusable collaboration templates, and document AI-assisted development practices
- **Languages**: Python 3.11+ (primary), with optional Go / TypeScript
- **License**: MIT

## Core Objectives

- ✅ Establish and refine end-to-end AI Agent collaboration workflows
- ✅ Create reusable specification, technical plan, and task decomposition templates
- ✅ Validate technology stack combinations through rapid prototyping
- ✅ Maintain clean git history with structured branching and commit conventions
- ❌ Not intended for production deployment
- ❌ No real user authentication, billing, or multi-tenant support

## Technical Architecture

- **Architecture Style**: Modular monolith with clear service layering
- **Recommended Stack**:
  - Web framework: FastAPI (Python)
  - Database: SQLite (dev) / PostgreSQL (prod)
  - API style: RESTful
  - Testing: pytest + pytest-cov
  - Linting: Ruff
  - CI/CD: GitHub Actions
- **Project Structure**:
  ```
  test-repo/
  ├── .agent/              # AI Agent workspace (plans, tasks)
  ├── src/
  │   ├── core/            # Business logic
  │   ├── api/             # API layer
  │   ├── models/          # Data models
  │   ├── services/        # Service layer
  │   └── utils/           # Utilities
  ├── tests/
  │   ├── unit/            # Unit tests
  │   └── integration/     # Integration tests
  ├── docs/                # Documentation
  ├── .ai/                 # AI Agent metadata & constitution
  ├── requirements.txt     # Production dependencies
  ├── requirements-dev.txt # Dev dependencies
  └── ARCH.md              # Architecture document
  ```
- **Communication**: RESTful HTTP between services, function calls internally

## Base Contract

- **Data Format**: JSON for all API request/response payloads
- **Error Handling**: Standard HTTP status codes (2xx success, 4xx client error, 5xx server error); consistent error response schema (`{"detail": "message"}`)
- **Type Annotations**: All Python functions must include type hints on parameters and return values
- **Commit Format**: `<type>: <description>` where type ∈ {feat, fix, docs, refactor, test, chore, style}
- **Forbidden**: `eval()`, `exec()` on untrusted input; committing secrets or tokens; force-pushing to `main`
- **Testing Threshold**: Core business logic must have ≥80% test coverage

## Agent Division

| Agent Role | Responsibility | Input Source | Output Destination |
|------------|---------------|--------------|-------------------|
| Host | Group chat moderation, status broadcasts | User | Group chat |
| Manager | Requirements analysis, technical design, contract definition | User requirements + Spec | Plan + Contract |
| Developer | Implementation, code commits | Task descriptions | Code commits |
| Reviewer | Code review, acceptance criteria verification | Code files | Review reports |

## Running & Dependencies

- **Runtime**: Python 3.11+
- **Package Manager**: pip + requirements.txt
- **Setup**:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- **Start Dev Server**: `uvicorn src.api.main:app --reload` (when implemented)
- **Run Tests**: `pytest --cov=src`
- **Lint**: `ruff check src/`
- **No Docker / Docker Compose** currently configured
- **No Node.js, Go, or Rust toolchain** currently required

## Collaboration Rules

- **Logging**: Record operation steps and errors via `action_log` (Base64-encoded JSON)
- **Contract-First**: Spec → Plan → Contract must be completed before any coding
- **Context Isolation**: Each FlyingHub maintains its own branches and documents; no cross-Hub state sharing
- **No Assumptions**: Do not assume global state or historical context without verification
- **Branch Strategy**: Feature branches from `main` using format `flyinghub-YYYYMMDDHHmmss`; merge via PR after review
- **Review Gate**: All PRs require at least one Agent review before merging

## Evolution Principles

- **Contract over Implementation**: Any new feature must complete Spec and Contract before coding
- **Modular Evolution**: New capabilities are added via new modules, not by breaking existing module boundaries
- **Simplicity First**: No over-engineering; build only what is needed
- **Replaceability**: Components are decoupled via interfaces for easy swapping
- **Test-Driven**: Core logic must be testable
- **ADR Location**: `docs/adr/` (to be established)
