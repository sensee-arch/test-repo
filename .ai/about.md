# About test-repo

## Project Overview
test-repo is a test repository created for automated testing purposes. It serves as a sandbox environment for validating AI Agent collaboration workflows, GitHub operations, and development lifecycle management. The repository includes a Todo List Web Application built with pure HTML/CSS/JS.

## Core Objectives
- Validate agent-driven development workflows from specification to deployment
- Demonstrate complete CI/CD pipeline integration with GitHub
- Provide a reproducible test environment for collaboration patterns
- Implement a functional Todo List SPA with localStorage persistence

## Technical Architecture
- **Frontend**: Pure HTML5/CSS3/Vanilla JavaScript (ES6+), no framework dependencies
- **Persistence**: Browser localStorage for client-side data storage
- **Pattern**: MVC-inspired 3-layer architecture (Store → Renderer → EventHandler)
- **Structure**: Single-Page Application in `src/web/todo/index.html`
- **Backend**: N/A — fully client-side application

## Base Contract
- All agents must read `.ai/about.md` before making changes
- Commits follow conventional format: `type(scope): description`
- Branch naming: `flyinghub-YYYYMMDDHHmmss`
- No external secrets committed to the repository
- Code must be XSS-safe (no innerHTML, use textContent)

## Agent Division
| Role | Responsibility |
|------|---------------|
| Boot Agent | Environment setup, branch creation, documentation |
| Spec Agent | Requirements analysis, specification generation |
| Plan Agent | Technical design, task decomposition |
| Coding Agent | Implementation following task breakdown |
| Review Agent | Code quality checks, acceptance testing |

## Running & Dependencies
- **Runtime**: Any modern web browser (Chrome 60+, Firefox 55+, Safari 11+, Edge 15+)
- **Dependencies**: None — pure vanilla JS, no npm/module requirements
- **Start**: Open `src/web/todo/index.html` directly in a browser
- **Dev tools**: pytest, ruff, httpx (for backend testing if needed)

## Collaboration Rules
- Pull before push: Always `git pull` before `git push`
- Clean working tree: Commit or stash changes before switching branches
- No force push to shared branches unless explicitly coordinated
- Review before merge: All PRs require at least one review approval
- Independent requests: Treat each request as fresh; do not carry context

## Evolution Principles
- Documentation-first: Update `.ai/about.md` when architecture changes
- Minimal dependencies: Prefer vanilla solutions over third-party libraries
- Progressive enhancement: Add features only when required by specification
- Security by design: XSS prevention, input sanitization from day one
- Testability: Each module has clear interfaces suitable for unit testing
