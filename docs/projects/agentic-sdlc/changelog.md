# Changelog

<!-- Newest first. One "## YYYY-MM-DD" heading per day. -->

## 2026-09-30 — The agentic phase

- Added read-only tools the Coder can call — read a file, list a directory,
  search the code — plus Anthropic's server-side web search, bounded at six
  lookups and three rounds per run.
- Added a write–test–fix loop: the Coder writes files, runs the project's own
  test suite, reads the failure and corrects it inside one stage.
- Added `write_file`, `edit_file` and `run_tests`, with writing confined to the
  paths the approved plan named and `run_tests` taking no command at all.
- Added a guard refusing a whole-file write that would delete most of an
  existing file, and path containment checks on every tool call.
- Extended tool access to the Analyst, Architect, Reviewer, Spec Validation,
  Tester, Subagent and Triage agents through a single `can_look` flag.
- Fixed the Architect being instructed to include a Dockerfile and README on
  every run: inside an existing repository the file plan is now a diff, not an
  inventory.
- Fixed a correct no-op failing a run — "nothing needs changing", backed by a
  green test suite, is now an accepted result.
- Added a check that refuses a plan naming a file which does not exist,
  re-asking once with the offending paths before refusing the run (SDLC-4).
- Added plan editing in the browser: drop files, add files, and the edit clears
  the approval (SDLC-5).
- Fixed a circular import that had always prevented `sdlc.agents.triage` from
  being imported on its own.
- Fixed `to_pdf` reporting success when it had written nothing — a stale PDF on
  disk satisfied its only check, so an unrendered document could be published
  as the new one (SDLC-ISSUE-1).
- Updated both the status and roadmap papers to describe what exists, including
  where the delivered work is deliberately narrower than what was approved.
- Added a handover document for the agentic work.

## 2026-09-29 — Interface and papers

- Added the 3 Pillars mark and a palette derived from it across the interface.
- Rewrote the status and roadmap papers after a week of real use.
- Added a status paper explaining how the factory works, with diagrams.

## 2026-09-28 — A day against a real repository

- Added a Reviewer that checks every requirement one at a time and returns a
  coverage table, so a missing requirement blocks approval automatically.
- Added the ability to clear a Reviewer objection, as with a security finding.
- Added an Architect that finds files by meaning rather than by spelling.
- Added the ability to change a repository without touching GitHub.
- Fixed the Coder inventing a build system it was never asked for.
- Fixed the plan guard so it applies to any clone, not only to edited files.
- Fixed a second retry loop that had the same defect as the first, and locating
  an application that lives in a subfolder.
- Fixed a run that was changing code still offering to revise its old document.
- Fixed the run header so it reports whether the process is actually alive.
- Fixed a deleted run showing an error page instead of saying it was deleted.
- Fixed a disconnecting browser being treated as an exception.
- Removed the unused SQLite store.

## 2026-09-26

- Added the generated document to the review page, with a way for a person to
  send it back for revision.
- Fixed the report guessing its own search terms instead of asking.
- Fixed an em dash in a message killing the HTTP response.

## 2026-09-25 — Reading other languages

- Added Kotlin, Swift and Java to the Repo Map, plus content search.
- Added the ability to answer a question about a repository with a document.
- Added the ability to ask a repository what it would suggest, without filing
  anything.
- Generated a client proposal document as the first real use of that path.
- Fixed cloning a deep repository failing on Windows path limits.
- Fixed a run stopped on spec questions reporting that nothing was waiting.
- Fixed the milestones flag being gated on the caller rather than the command.
- Updated the assistant to answer like a chat rather than a briefing, and fixed
  the dock's alignment.

## 2026-09-24 — The assistant

- Added an assistant that answers from the factory's actual state.
- Updated it to a corner panel rather than a page, with project selection and
  shorter answers.
- Fixed the ask panel being wiped by the page refreshing itself.
- Fixed `slugify` not being idempotent, which let one run build a second
  directory.
- Fixed installed dependencies shipping inside a pull request.
- Fixed a revision re-emitting a repository's files instead of editing them.
- Fixed the run using the filesystem rather than git to decide which files
  predate it.

## 2026-09-23 — First run against a real repository

- Fixed six separate bugs found by running the factory against a real
  repository.
- Added the ability for the Coder to change a file instead of replacing it.
- Fixed a test suite that never ran being able to report a pass.
- Updated run naming to use what was asked for rather than the slug.

## 2026-09-22

- Added a status report covering what the factory does today.
- Updated the papers to frame three builds as test results rather than
  products, and corrected a Repo Map language claim in both.

## 2026-09-20

- Added one light, explained interface across every page.
- Added a 70-second explainer video, built locally.
- Updated the roadmap to record the interface work.

## 2026-09-19

- Added a roadmap setting out what to build next.

## 2026-09-18 — The front door

- Added the front door: submit a spec, read the plan, approve it, and it builds.
- Added work on an existing repository — issue in, reviewed plan, pull request
  out.
- Added two example specifications used to exercise the factory live.
- Added the dashboard to the products the factory tracks.

## 2026-09-17

- Added a browser UI to every generated web API.
- Added a run detail page and a way to actually clear a security finding.
- Fixed a Coder revision dropping files from tracked state.
- Fixed the Coder silently returning nothing when it ran out of output budget.

## 2026-09-16 — Live API work merged

- Merged the factory branch (13 commits, squashed).
- Fixed a removed `temperature` parameter that prevented live API calls from
  working at all.

## 2026-06-23 — Project started (earlier history summarised)

- Created the project structure and initial settings. Development in earnest
  begins with the branch merged on 2026-09-16.
