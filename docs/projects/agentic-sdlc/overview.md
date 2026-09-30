# Agentic SDLC Factory — Overview

A pipeline that takes a written specification, a GitHub issue, or a question
about a repository, and produces tested reviewed code — or a document answering
the question. Eleven Claude agents do the work. They never talk to each other;
each reads one shared state file, does its job, and writes back. A person
approves the plan before anything is written, and any gate can stop the result
from shipping.

It is built for a small team that wants the first draft of a change done, tested
and explained before anyone opens an editor — without giving up the review step
that makes the change safe to merge.

## Background

The project exists because the expensive part of small development work is not
typing the code, it is the loop around it: reading the repository to find where
a change belongs, writing it, running the tests, reading the failure, and
correcting it. A chat assistant can do that but leaves no record and no gate. A
CI pipeline has gates but cannot write anything.

This is the middle: agents that do the loop, inside a plan a person approved,
behind gates that block, opening pull requests that nobody merges automatically.

## Scope

**In scope**

- Building a new project from a specification
- Changing a repository that already exists, from an issue or a written request
- Answering a question about a repository with a written report
- Review, security and compliance gates that can block a release
- A browser interface for submitting work, reading plans and approving them

**Out of scope**

- Merging its own pull requests. Nothing merges without a person.
- Holding cloud credentials. Deployment triggers an existing pipeline rather
  than deploying directly.
- Verifying mobile builds. Android tests need a device and iOS needs macOS;
  neither is available to the factory today.

## Current features

### Three ways in

- **Build something new** — submit a specification, get a plan, approve it, and
  the factory writes the project.
- **Change an existing repository** — point it at a repo and an issue or a
  written request; it clones, plans a change, writes it and opens a pull
  request.
- **Ask about a repository** — it reads the code and produces a written report
  as HTML and PDF, without changing anything.

### The pipeline

- **Spec Validation** — reads the specification and stops to ask blocking
  questions rather than building the wrong thing. Questions can be answered in
  the browser.
- **Analyst** — turns free-form requirements into a structured specification.
- **Architect** — picks the stack and enumerates every file the change touches.
  Inside an existing repository the file plan is a diff, not an inventory.
- **Planner and Subagents** — for a large specification, splits the work into
  milestones with one component each, so no single pass has to hold everything.
- **Coder** — writes the code. It can open any file in the project, search it,
  run the project's own test suite, read the failure and fix it before handing
  over.
- **Tester** — detects and runs the project's test suite, and diagnoses
  failures for the Coder.
- **Reviewer** — checks every requirement one at a time and returns a coverage
  table. A requirement reported as missing blocks approval automatically.
- **Code Security and Compliance** — a linter-style scanner for secrets and
  unsafe patterns, plus ten compliance checks scoped by data tier.
- **DevOps** — builds and runs the container, and confirms it is healthy.

### Agent tooling

Seven agents can open the project before they answer: read a file, list a
directory, or search the code for a word. The Coder can additionally write
files, run the test suite and correct what failed. Writing is confined to the
paths the approved plan named, and every path is checked to stay inside the
project.

### Control and review

- **Plan approval** — planning stops and waits. Approval is bound to a hash of
  the plan, so any later edit invalidates it.
- **Plan editing in the browser** — drop files from a plan or add them. Editing
  clears the approval and sends the plan back to be read again.
- **Budget guard** — a soft cap that compacts context and a hard cap that
  checkpoints and stops.
- **Control plane** — pause, kill and resume a run at stage boundaries.
- **Dashboard** — a run list, a detail page per run, a portfolio view across
  products, and a log tail. Bound to localhost.

### Supporting pieces

- **Repo Map** — indexes symbols across Python, Kotlin, Swift, Java, JavaScript
  and markup, and searches file contents. Keeps prompts bounded on large
  repositories.
- **Anchored edits** — changes a span of a file rather than replacing it, with
  a guard that refuses a write which would delete most of an existing file.
- **Skills** — convention files loaded only when they match the work.
- **Semantic layer** — a YAML model that generates types, interfaces, data
  tiers and invariant tests.
- **Closed feedback loop** — clusters user reports, triages them, applies a risk
  gate, and routes anything uncertain to a person.
- **Report generation** — HTML and PDF documents produced from the factory's own
  state.

## Current status

**Working.** The full pipeline runs against the live Claude API and has been
driven against real repositories, including an Android application. 630 automated
tests pass. The agent tooling and the write–test–fix loop were verified against
the live model, not only against fakes.

**Recently completed.** The agentic phase: read-only tools for seven agents, a
write–test–fix loop for the Coder, plan editing in the browser, and a check that
refuses a plan naming a file which does not exist.

**Known gaps.**

- The Coder runs the project's test suite and nothing else — no linter, no
  build, no compile check. A compile error in a language the tests do not cover
  still reaches a person.
- Milestone builds, which split a large specification across several passes,
  have never been run against the live API. They are covered by tests with fake
  responses only.
- Mobile work cannot be verified: Android tests need a device or emulator, and
  iOS needs macOS.
- The dashboard has no authentication and is bound to localhost for that reason.

## Stakeholders

| Role | Person |
| --- | --- |
| Developer / owner | Abhishek Hiremath |
