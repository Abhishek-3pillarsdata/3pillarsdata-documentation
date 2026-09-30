# Architecture

The factory is a **blackboard**, not a message bus. Agents never call each
other. Each one reads a single shared state file, does its job, and writes back.
Everything about a run — requirements, plan, code, gate results, budget — lives
in `ProjectState`, persisted as `.sdlc/state.json` inside the run's directory.

Two consequences follow from that choice, and both are load-bearing. A run can
be stopped and resumed in a different process, because the state on disk is the
whole truth. And the orchestrator is incremental: each stage is skipped when its
part of the state is already filled in, so resuming costs nothing and approval
can sit in the middle of a run.

```text
  spec / issue / question
           │
           ▼
   ┌───────────────┐
   │   Repo Map    │  index the code (symbols + content search)
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ Spec          │  may stop and ask blocking questions
   │ Validation    │
   └───────┬───────┘
           ▼
   ┌───────────────┐   ┌───────────────┐
   │   Analyst     │──▶│   Architect   │  stack + file plan (a diff, in a repo)
   └───────────────┘   └───────┬───────┘
                               ▼
                    ╔══════════════════════╗
                    ║   HUMAN APPROVAL     ║  nothing written yet
                    ║  (plan may be edited)║
                    ╚══════════┬═══════════╝
                               ▼
              ┌────────────────────────────────┐
              │  Coder                         │
              │   read → write → run tests →   │  loop, inside the approved plan
              │   read failure → fix           │
              └────────────────┬───────────────┘
                               ▼
                       ┌───────────────┐
                       │    Tester     │──┐ tests fail
                       └───────┬───────┘  │
                               │◀─────────┘ back to the Coder
                               ▼
        ┌──────────┐   ┌──────────────┐   ┌────────────┐
        │ Reviewer │──▶│Code Security │──▶│ Compliance │
        └──────────┘   └──────────────┘   └────────────┘
                               │ all gates pass
                               ▼
                       ┌───────────────┐
                       │    DevOps     │──▶ container, or a pull request
                       └───────────────┘
```

## Key components

| Component | Responsibility |
| --- | --- |
| `orchestrator.py` | Drives the stages. Incremental — skips any stage whose state is already populated. |
| `state.py` | `ProjectState`, the blackboard. Also `plan_fingerprint()`, which binds an approval to a plan. |
| `agents/` | Eleven agents, one file each. All extend `BaseAgent`, which owns the model call and JSON extraction. |
| `tools/agent_tools.py` | The tools an agent may call, the loop that answers them, and every bound on both. |
| `tools/repo_map.py` | Symbol index and content search across several languages. Keeps prompts bounded. |
| `tools/edit.py` | Anchored search/replace edits, and the guard against a write that would gut a file. |
| `integrator.py` | Merges milestone output, runs the tests, and retries only the component that failed. |
| `security/` | `scanner.py` (secrets and unsafe patterns) and `compliance.py` (ten checks, scoped by data tier). |
| `semantic/` | A YAML model that generates types, interfaces, tiers and invariant tests. |
| `feedback/` | Clusters user reports, triages them, applies a risk gate, routes uncertainty to a person. |
| `dashboard.py`, `plan_review.py`, `intake.py`, `run_detail.py` | The browser interface: run list, plan review and approval, submission forms, run detail. |
| `runner.py` | Launches a build as a detached process so an HTTP request never blocks on it. |
| `budget.py` | Soft cap compacts context; hard cap checkpoints and stops. |
| `registry.py` | `.factory.yml` per product repository — how the factory learns a repo's conventions. |

## Storage

No database. Everything is files.

- `workspace/<project-slug>/.sdlc/state.json` — the blackboard for one run
- `workspace/<project-slug>/` — the generated or cloned code
- `.sdlc/logs/<action>-<stamp>.log` — output of each detached launch
- `.sdlc/launch.json` — the process record for a run in flight
- `products/*.yml` and each repo's `.factory.yml` — the product registry

## External services

- **Anthropic Claude API** — every agent call. Also its server-side web search
  tool, which the Coder may use up to three times per call; the factory never
  fetches a URL itself.
- **GitHub REST API** — listing repositories, reading issues, opening pull
  requests. Personal access token or GitHub App installation token.
- **Docker** — building and running the generated container.
- **Chrome (headless)** — printing reports to PDF.

## Design decisions

1. **A blackboard, not messages.** Agents share one state file and never
   address each other. Resume works because the file is the whole truth, and a
   stage can be re-run without coordinating with anything.

2. **Approval is bound to a hash of the plan.** `plan_fingerprint()` covers the
   file plan and the milestone partition. A build refuses to start when the hash
   no longer matches, so editing a plan invalidates its approval and a stale
   browser tab cannot authorise work nobody read.

3. **Model output is validated, never trusted.** A Coder revision that
   re-emits fewer files upserts rather than replacing, because a revision once
   silently shrank tracked state from fifteen files to three and every gate
   downstream then passed. The same rule applies to the Planner's partition and
   the Reviewer's verdict.

4. **Two tiers of agent tooling.** Reading is available to any agent that opts
   in and can change nothing. Writing and running tests belong to the Coder
   alone, wired by hand. Writing is confined to the paths the approved plan
   named — otherwise approval would say nothing about what actually gets
   written.

5. **`run_tests` takes no command.** The Coder can run the project's own suite
   and nothing else, so "run the tests" cannot become "run anything". The cost
   is that no linter or build runs; that trade is recorded deliberately.

6. **Builds are detached processes.** A build runs for minutes to hours, so it
   cannot block an HTTP request. Each launch records its command, pid and log
   file, so any run can be reproduced by hand from `launch.json`.

7. **The factory holds no cloud credentials.** Deployment triggers an existing
   pipeline rather than deploying directly, which keeps the blast radius of a
   mistake inside the repository.
