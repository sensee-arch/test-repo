# .ai/about.md — AI Agent Project Constitution

## 1. Project Overview

- **Project Name**: test-repo
- **Repository**: https://github.com/sensee-arch/test-repo
- **Description**: An experimental/test project providing a flexible playground for AI Agent collaborative programming. Multiple AI Agents collaborate under unified architecture specifications and standardized workflows.
- **Tech Stack**: Python 3.11+ (recommended), Git-based collaboration
- **Project Status**: Infrastructure scaffolding complete, ready for feature development
- **Key Files**: `ARCH.md` (architecture document), `.ai/about.md` (this constitution), `LICENSE` (MIT), `requirements.txt` / `requirements-dev.txt`

## 2. Core Objectives

- ✅ **Verify AI Agent collaboration workflows**: Practice end-to-end collaboration (requirements → plan → task → development → review)
- ✅ **Establish standardized processes**: Build repeatable templates for AI-assisted development
- ✅ **Template accumulation**: Create reusable specifications, technical plans, and task decomposition templates
- ✅ **Technical validation**: Rapid prototyping and feasibility validation across opt-in tech stacks
- ❌ Not intended for production deployment
- ❌ Not intended for multi-environment CI/CD pipelines

## 3. Technical Architecture

- **Architecture Style**: Modular monorepo with clear separation of concerns
- **Recommended Stack**:
  - Language: Python 3.11+ (primary), Go / TypeScript (optional)
  - Web Framework: FastAPI (recommended), Flask / Express as alternatives
  - Database: SQLite (dev) / PostgreSQL (prod)
  - API Style: RESTful (primary), GraphQL (optional)
  - Testing: pytest (Python), vitest (TypeScript)
  - Linting: Ruff (Python), Prettier (frontend)
  - CI/CD: GitHub Actions
  - Package Management: pip + requirements.txt / Poetry (Python)
- **Directory Structure**:
  ```
  test-repo/
  ├── .agent/              # AI Agent work files
  ├── .ai/                 # AI project constitution
  ├── src/
  │   ├── core/           # Core business logic
  │   ├── api/            # API interface layer
  │   ├── models/         # Data models
  │   ├── services/       # Service layer
  │   └── utils/          # Utility functions
  ├── tests/
  │   ├── unit/           # Unit tests
  │   └── integration/    # Integration tests
  ├── docs/               # Documentation
  ├── scripts/            # Helper scripts
  ├── requirements.txt    # Production dependencies
  ├── requirements-dev.txt# Dev dependencies
  ├── ARCH.md             # Architecture document
  └── README.md           # Project README
  ```

## 4. Base Contract

- **Communication**: JSON-based structured messages between Agents via group chat
- **Data Format**: All task inputs/outputs are JSON documents with `status`, `content`, `action_trace` fields
- **Git Workflow**:
  - Branch format: `flyinghub-YYYYMMDDHHmmss`
  - Commit format: `<type>: <description>` where type ∈ {feat, fix, docs, refactor, test, chore, style}
  - PRs require at minimum one Agent reviewer
- **Contract-First**: Spec → Plan → Contract → Code sequence is mandatory for all features
- **Error Protocol**: Auto-fix within scope; escalate only for auth, permissions, resource, or hard constraint failures (max 3 retries before escalation)
- **Prohibited Actions**: No empty commits, no force push to main, no `innerHTML` for user content, no `eval()`

## 5. Agent Division

| Name | Role | Input Source | Output Destination |
|------|------|-------------|-------------------|
| **Host** | Group coordinator, sends welcome/status broadcasts | User events | Group chat |
| **Manager** | Requirements analysis, solution design, contract authoring | User needs + Spec | Plan documents + Contract |
| **Developer** | Code implementation, commits, push | Task description + Contract | Code commits |
| **Reviewer** | Code review, AC validation, quality gate | Code files | Review report |
| **Boot Agent** | Environment setup, project initialization | Repository config | Ready workspace |

## 6. Running & Dependencies

- **Runtime Requirements**:
  - Git ≥ 2.30
  - Python ≥ 3.11 (for Python-based tasks)
  - Modern browser (for web-based features)
- **Setup**:
  ```bash
  git clone https://github.com/sensee-arch/test-repo.git
  cd test-repo
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  ```
- **Development Tools**: VS Code / Cursor, Git CLI, curl / HTTPie for API testing
- **Current Dependencies**: None runtime dependencies beyond Python stdlib (requirements files are placeholders for future use)

## 7. Collaboration Rules

- **Logging**: All Agent actions must record `action_trace` (Base64-encoded Markdown with Reasoning → Decision → Action → Observation → Reflection)
- **Context Isolation**: Each Hub operates independently on its own branches and documents. No shared state across Hubs.
- **Git Discipline**:
  - Always `git pull` before `git push`
  - Merge conflicts: resolve by `git add` + `git commit`, continue
  - Detached HEAD: recover to main branch immediately
- **Branch Lifecycle**:
  1. Create from `main` with `flyinghub-YYYYMMDDHHmmss` naming
  2. Push upstream immediately after creation
  3. Develop, commit, push iteratively
  4. Merge back to `main` via PR when complete
- **Output Format**: All Agent responses must be valid JSON with `content` (group chat message), `status`, and relevant data fields
- **Privacy**: No personal data collection, no filesystem traversal outside workspace, mask tokens/secrets in logs

## 8. Evolution Principles

- **Contract-First**: Every feature begins with a written Spec, followed by a Plan, then a Contract, before any code is written
- **Modular Growth**: New capabilities are introduced as new modules, preserving existing module boundaries
- **Simplicity Priority**: Default to the simplest solution that meets requirements — no over-engineering
- **Replaceability**: Components decouple through interfaces, enabling drop-in replacements
- **Test-Driven**: Core logic must be testable with unit tests
- **ADR**: Architecture Decision Records stored in `docs/adr/` when significant architectural choices are made
- **Continuous Documentation**: `.ai/about.md` is updated whenever project scope, architecture, or collaboration rules change
