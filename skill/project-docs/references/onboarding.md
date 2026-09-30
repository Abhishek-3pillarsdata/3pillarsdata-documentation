# Onboarding a repo (baseline documentation)

Goal: after onboarding, someone who has never seen the code can open the portal and understand what the project is,
what already works, how it is built and run, and how it got here. All of it must come from the real code and history,
because this becomes the record the team relies on.

## 1. Explore the repo

Read enough to describe it accurately. For a large repo, delegate the sweep to an Explore subagent and ask for
features, entry points, integrations and setup rather than file dumps.

- `README*`, `docs/`, `CONTRIBUTING*`, and anything describing purpose or setup
- Manifests: `package.json`, `pyproject.toml` / `requirements*.txt`, `go.mod`, `Cargo.toml`, `pom.xml` /
  `build.gradle`, `composer.json`, `Gemfile`, `*.csproj`, `Dockerfile`, `docker-compose*`. These give the tech stack
  and the run, build and test commands.
- Entry points and user-visible surface: routes and pages, CLI commands, API endpoints, jobs and schedulers, UI
  screens. These give the **features**.
- Integrations: external APIs, databases, queues, auth providers, and SDK clients
- Config: `.env.example`, config files, CI workflows. Record variable **names** and purposes only, never values.
- Tests: what is covered
- History: `git log --reverse --format='%h %ad %an: %s' --date=short` (page through it for long histories)

## 2. Check what actually works

Run the project's own checks when there is an obvious, local, non-destructive command for them (for example
`npm test`, `npm run build`, `pytest`, `go test ./...`, `cargo test`). Don't run anything that deploys, migrates a
shared database, sends messages, or needs credentials you don't have. If you're unsure whether a command is safe,
ask.

- Count a feature as **working** only if tests pass or the code is clearly complete and wired in.
- If tests or the build fail, record that honestly as an open issue, not as a working feature.
- If there are no tests, say "no automated tests" in the technical doc rather than claiming things are verified.

## 3. Ask the user, once, only what code can't tell you

Send a single short message with your suggestions filled in, so the user can reply "looks good":

- Project display name (suggest from README or manifest) and a short **key** for task ids (for example `WEB`, `API`).
  It must not clash with keys in `portal.projects`.
- **Status**: `planning`, `active`, `on-hold` or `completed` (suggest `active` if there are recent commits)
- **Progress %** and target date: optional. Leave progress at 0 and omit `targetDate` if they don't say.
- **Objectives**: suggest 2–4 from the README and ask them to confirm or edit
- Milestones: only if they give them

The project id is the kebab-case name, used as the folder name.

## 4. Write the portal files

Use the templates in `<portal>/docs/_templates/` and the formats in `<portal>/CLAUDE.md`.

**`data/projects.json`**: new entry. Set `owner` to the developer, `techStack` from the manifests, `startDate` to
`repo.firstCommitDate` (or today if there are no commits), `lastUpdated` to today, and `repository` to
`remoteForProjectsJson`. The `repository` field matters: it is how teammates' machines automatically link this repo
to the project.

**`docs/projects/<id>/overview.md`**: what it is and who it is for, then:

- `## Current features`: grouped list of what works today, each with one line on what it does for the user
- `## Current status`: what is done, in progress, and broken or missing (failing tests, obvious gaps)
- `## Scope` only if the README states it

**`architecture.md`**: the real components and how data flows between them, a small text diagram, the storage and
external services, and notable design decisions that are evident in the code.

**`technical.md`**: how to install, run, build and test (the real commands); configuration (env var names and
purpose); APIs and endpoints, grouped by area; integrations; deployment, if CI or config shows it; and the test
status from step 2.

**`changelog.md`**: from git history, grouped by date, newest first, with verb-first bullets rewritten from commit
subjects (merge commits and noise such as "wip" or "fix typo" can be dropped or folded together). For long histories,
give full detail for roughly the last 30 active days, then one section dated at the first commit that summarises the
earlier work (for example `## 2025-03-02 — Project started (earlier history summarised)`).

**`meetings/.gitkeep`**: an empty file, so the folder exists.

**`data/tasks.json`**: one `completed` task per major existing feature (5–15 is typical; group small ones), with
ids `<KEY>-1…n` and `createdDate` = `updatedDate` = today. Add `todo` tasks only for work the user names or that
the README lists as planned. Don't mine every TODO comment.

**`data/issues.json`**: one open issue per real problem found in step 2 (failing tests, broken build).

**`data/updates.json`**: one session entry for today: `summary` "Baseline documentation of the existing codebase",
`changes` listing what was documented, `filesAffected: []` (no code changed), plus the problems and next steps you
found.

## 5. Finish

Validate, commit (`docs(<key>): onboard <name> baseline`) and push as described in SKILL.md Step 3. Then run
`commands.register` with the project id, and report in two or three lines: how many features were recorded, the test
status, and the commit.
