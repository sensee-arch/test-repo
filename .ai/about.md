# .ai/about.md — AI Agent Project Constitution

> **Repository**: sensee-arch/test-repo
> **Last updated**: 2026-07-18
> **Maintainer**: AI Agent Javis 🎩

---

## 1. Project Overview

- **test-repo** is an experimental multi-Agent collaboration platform that simulates a complete software development lifecycle through AI-driven workflows.
- It serves as a sandbox to validate workflows including requirement analysis, specification writing, task decomposition, coding, code review, and status broadcasting — all coordinated between autonomous Agents across GitHub branches.
- The project integrates with FlyingHub (a task orchestration platform) as the entry point for Agent assignments.
- **License**: MIT
- **Current Tech Stack Focus**: Python 3.10+ / FastAPI / Uvicorn / Pydantic
- **Primary Interchange Format**: Base64-encoded Markdown documents in JSON payloads

---

## 2. Core Objectives

- ✅ **Validate AI Agent collaboration workflows**: end-to-end execution from task reception → analysis → coding → review → delivery
- ✅ **Standardize Agent deliverables**: unified output format (JSON with `content`, `action_trace`, `status`), enforced traceability via Base64 action logs
- ✅ **Explore reusable templates**: for specs, plans, contracts, and code review artifacts
- ✅ **Maintain branching discipline**: feature branches named `flyinghub-YYYYMMDDHHmmss`, always branching from `main`
- ❌ Not a production application — no deployment pipelines, no live services
- ❌ Not a monorepo — each Agent experiment lives in its own branch

---

## 3. Technical Architecture

### Architecture Style
**Skeleton-first, declarative-envelope**: the project is a minimal scaffold with dependency declarations and architecture docs but no runtime source code. All real work happens in isolated feature branches.

### Current Stack (declared)
| Layer | Technology |
|-------|-----------|
| **Language** | Python 3.10+ |
| **Web Framework** | FastAPI (≥0.104.0) |
| **ASGI Server** | Uvicorn (≥0.24.0) |
| **Data Validation** | Pydantic (≥2.5.0) |
| **Linter** | Ruff (≥0.1.0) |
| **Test Framework** | Pytest + pytest-cov (≥7.4.0) |
| **HTTP Client** | HTTPX (≥0.25.0) |

### Virtual Environment
- Located at `.venv/` (Python 3.10)
- Pre-installed with all dependencies from `requirements.txt` and `requirements-dev.txt`

### No Persistent Infrastructure
- No database configured
- No CI/CD pipelines
- No Docker setup
- No cloud deployment config

---

## 4. Base Contract

### Communication Contract
All Agent outputs MUST conform to the following JSON schema:

```json
{
  "content": "string (user-facing brief, 150-250 chars, includes phase tag)",
  "status": "'done' | 'failed'",
  "action_trace": "string (base64-encoded Markdown with ## Reasoning / ## Decision / ## Action / ## Observation / ## Reflection)",
  "about_doc": "string (base64-encoded .ai/about.md content, required when status=done for Boot phase)",
  "git_branch": "string (branch name, required when status=done for Boot phase)"
}
```

### Phase Tags
| Tag | Phase |
|-----|-------|
| 🚀 `[Boot]` | Environment setup, clone, branch creation |
| 📋 `[Plan]` | Requirement analysis & task decomposition |
| 📝 `[Contract]` | Spec & contract documentation |
| 💻 `[Coding]` | Implementation |
| 👀 `[Review]` | Code review & AC verification |

### Action Trace Format
Every `action_trace` MUST be a base64-encoded Markdown document containing exactly these five sections:
1. **## Reasoning** — Why this approach was chosen
2. **## Decision** — What was decided
3. **## Action** — What was executed (commands, steps)
4. **## Observation** — What was observed (stdout, errors)
5. **## Reflection** — Lessons learned or improvement notes

### Python Execution Rules
- NEVER use inline interpreter (`python3 -c "..."`)
- All Python code MUST be written to standalone `.py` files, then executed via `python3 task.py`

### Prohibited Behaviors
- `innerHTML` for rendering user input
- `eval()` / `new Function()`
- Data exfiltration via any channel
- Hardcoded credentials or tokens in committed files

---

## 5. Agent Division

| Agent | Role | Responsibility | Input Source | Output Destination |
|-------|------|---------------|--------------|-------------------|
| **Host** | Orchestrator | Watch for task events, dispatch to appropriate Agent, broadcast status to group chat | FlyingHub events | Group chat (via FlyingHub) |
| **Boot Agent** (current) | Environment setup | Clone repo, create branch, generate `.ai/about.md`, send Boot confirmation | FlyingHub Boot event | Group chat + git push |
| **Manager** | Analysis & Design | Requirements analysis, spec docs, task decomposition, contract creation | User requirements | Spec + Plan + Contract documents |
| **Developer** | Implementation | Code writing, testing, git commits with conventional commits | Task descriptions | Code commits |
| **Reviewer** | Quality assurance | Code review, AC verification, PR review reports | Code files | Review report |

### Agent Interaction Flow
```
FlyingHub Event → Host → Boot Agent (setup)
                         → Manager (spec/plan)
                         → Developer (code)
                         → Reviewer (review)
                         → Host (broadcast done)
```

---

## 6. Running & Dependencies

### Prerequisites
- Git (with SSH or HTTPS access to GitHub, collaborator access to `sensee-arch/test-repo`)
- Python 3.10+ (currently at 3.10)
- OpenClaw runtime (for Agent execution)

### Environment Setup
```bash
# Virtual environment (already exists at .venv/)
cd ~/.openclaw/workspace/test-repo
source .venv/bin/activate

# Dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Code quality (syntax + format check)
ruff check .
```

### Branch Convention
- Feature branches: `flyinghub-YYYYMMDDHHmmss` (24-hour local time)
- Source branch: always `main`
- Commit convention: `<type>: <description>` where type is `feat|fix|docs|refactor|test|chore|style`

### No-Run Mode
This project is **not meant to be run** as a standalone service. The FastAPI stack is declared for potential future use. Current execution is entirely Agent-based: tasks are received, processed, and results are delivered via chat messages, not HTTP endpoints.

---

## 7. Collaboration Rules

### Strict Isolation
- Each Hub (e.g., "测试Hub") maintains independent branches and documentation
- No cross-Hub state sharing
- No reliance on prior session memory — all context must be passed explicitly

### Contract-First
- Every coding task MUST be preceded by a Spec → Plan → Contract sequence
- Contracts define the data schema, API signatures, and AC criteria before any code is written

### Error Handling & Auto-Recovery
1. Retry network operations 2-3 times before escalation
2. Self-heal directory-not-found or command-not-found errors
3. Only escalate for: OS permissions (EACCES/EPERM), auth failures (GitHub 401/403), resource exhaustion

### Output Discipline
- `content` is human-readable: concise, no stack traces, no internal paths, no tokens
- `action_trace` is machine-readable: comprehensive, structured, base64-encoded
- Credentials MUST be masked (`***`) in all output logs

### Source of Truth Hierarchy
1. `.ai/about.md` — this file (project constitution, Agent binding)
2. `ARCH.md` — architecture decisions and tech stack rationale
3. `.ai/workspace.md` — per-session workspace state tracking
4. Feature branch docs — per-feature specifications and contracts

---

## 8. Evolution Principles

1. **Constitution over memory**: Future Agents read `.ai/about.md`, not session histories. Keep this file accurate.
2. **Contract before code**: No implementation without a written contract. Contracts are the single source of truth for what to build.
3. **Ship small, often**: One feature per branch. One task per commit. Keep branches short-lived.
4. **Leave docs behind**: Every feature branch should include or update relevant documentation.
5. **Self-heal, then escalate**: Exhaust automated recovery before requesting human intervention.
6. **Architecture Decisions live in ARCH.md**: Document significant architectural decisions as ADR entries in `docs/adr/`.
7. **Open Source, Open Process**: MIT license. All code and docs are public. Use GitHub issues/PRs for permanent records.
