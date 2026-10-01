# Technical Documentation

Python 3.10 or newer. No database and no services to stand up — the factory
stores everything on disk.

## Local development

```bash
# Install
pip install -r requirements.txt

# Configure — copy the example and set your own values
cp .env.example .env

# Build something new from a specification
python -m sdlc run examples/todo-api.md

# Or open the browser interface and work from there
python -m sdlc dashboard --port 8787
```

`make` wraps the common ones: `install`, `run`, `run-todo`, `test`, `test-all`,
`check`, `semantic`, `dashboard`, `smoke`, `clean`.

Output for a run appears under `workspace/<project-slug>/`, with the run's own
state in `workspace/<project-slug>/.sdlc/`.

## Configuration

Set in `.env`. Values are never committed — `.env` is git-ignored, and only the
names belong in documentation.

| Variable | Description |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API key. Required; nothing runs without it. |
| `SDLC_MODEL` | Model id to use for agent calls. |
| `SDLC_MAX_REVISIONS` | How many times the Tester's feedback may go back to the Coder. |
| `SDLC_WORKSPACE` | Where runs are written. Defaults to `workspace/`. |
| `SDLC_SKIP_DEPLOY` | Skip the DevOps stage — useful when Docker is unavailable. |
| `SDLC_GITHUB_TOKEN` | GitHub token for listing repos, reading issues and opening pull requests. |
| `SDLC_GITHUB_REPO` | Default repository for issue-driven work. |
| `SDLC_GITHUB_LABEL` | The issue label the factory treats as work for it. |
| `SDLC_POLL_INTERVAL` | Seconds between polls when watching for labelled issues. |
| `SDLC_MILESTONES` | Set to `1` to split a large specification across milestones. |
| `SDLC_AGENTIC_CODER` | Set to `0` to make the Coder emit whole files in one reply instead of using tools. |

## CLI

```bash
python -m sdlc <command>
```

| Command | What it does |
| --- | --- |
| `run <spec>` | Build from a specification. `--plan-only` stops after planning. |
| `plan-again <project>` | Re-plan an existing run. |
| `build <project>` | Build an approved plan. `--force` bypasses the approval check. |
| `resume <project>` | Continue a run from wherever it stopped. |
| `pause` / `kill` / `release` | Control a run at stage boundaries. |
| `repo-build` | Change an existing repository and open a pull request. |
| `dashboard` | Serve the browser interface. |
| `portfolio` | Portfolio view across products. |
| `map` | Print the Repo Map for a directory. |
| `products` / `init-product` | List products, or write a `.factory.yml` into a repo. |
| `webhook` / `worker` / `queue` | Webhook receiver, job worker, queue status. |
| `report` / `deploy` / `confirm` / `stats` | Feedback-loop commands. |
| `semantic gen` / `check` / `show` | Generate and verify the semantic layer. |
| `parse` | Dry-run the Analyst against a specification. |

## HTTP interface

Served by `python -m sdlc dashboard`. Bound to `127.0.0.1` and **unauthenticated
by design** — see the open issue before running it anywhere shared.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Run list and portfolio summary |
| GET | `/new` | Submit a spec, an issue, or a question about a repo |
| GET | `/run/<name>` | Run detail: gates, findings, logs |
| GET | `/plan/<name>` | Plan review — questions, architecture, approve or edit |
| GET | `/api/plan/<name>` | The same plan as JSON |
| GET | `/log/<name>` | Tail of the newest launch log |
| POST | `/intake/spec` | Create a project and start planning |
| POST | `/intake/issue` | Start issue-driven work on a repository |
| POST | `/intake/analyse` | Clone a repository and report on it |
| POST | `/plan/answers` | Answer blocking spec questions |
| POST | `/plan/edit` | Change the scope of a plan; clears its approval |
| POST | `/plan/decide` | Approve (and start the build) or reject |
| POST | `/plan/refine` | Send a report back for revision |
| POST | `/ask` | Ask the assistant about the factory's own state |

## Integrations

### Anthropic Claude API

Every agent call. The Coder may also use Anthropic's server-side web search,
capped at three uses per call — the factory never fetches a URL itself and never
places fetched content into a prompt.

### GitHub REST API

Listing repositories, reading issues, and opening pull requests. Authenticates
with a personal access token (`SDLC_GITHUB_TOKEN`) or a GitHub App installation
token. A fine-grained token only sees repositories explicitly granted to it.

### Docker

`docker build` and `docker run` for the DevOps stage, with a health check
against port 8080 inside the container. Set `SDLC_SKIP_DEPLOY` where Docker is
not available.

### Chrome (headless)

Used to print generated reports to PDF. A missing browser is not an error — the
HTML is the document and the PDF is a convenience on top of it.

## Testing

```bash
python -m pytest tests/ semantic/generated/test_invariants.py -q
```

**630 tests pass** across 36 test files. The suite needs no
API key and no network: agent behaviour is exercised through a `FakeClient`, and
the only real subprocess it starts is `sys.executable -c "pass"`.

Behaviour that a fake cannot reach — whether the model actually uses a tool,
whether a guard fires against a real model — is verified by hand against the
live API and recorded in commit messages and `docs/agentic-handover.md` in the
code repository.

## Deployment

No CI workflows are configured in this repository. The factory is run locally,
and its DevOps stage triggers an existing pipeline rather than deploying
directly — it deliberately holds no cloud credentials.
