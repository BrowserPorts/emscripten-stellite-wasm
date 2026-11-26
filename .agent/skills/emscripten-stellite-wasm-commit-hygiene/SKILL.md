---
name: emscripten-stellite-wasm-commit-hygiene
description: Inspect and protect Git boundaries before branch, staging, commit, history rewrite, push, merge from upstream, or PR work in emscripten-stellite-wasm, Stellite's fork of the Emscripten compiler toolchain. Use for reviewing dirty trees, keeping fork work apart from upstream history, recording the change in azahar-stellite-core, or preparing any Git mutation. Commit completed changes frequently under standing authorization. Pushing, rewriting history and changing branches need separate authorization.
---

# Keep emscripten-stellite-wasm history clean

Load this skill before any Git mutation beyond read-only inspection.

## Inspect first

This repository has no standalone checkout. It is worked on in azahar-stellite-core's `externals/emscripten` submodule, whose Git directory lives in azahar's `.git/modules`. Run in `externals/emscripten`, not in azahar's root:

```sh
git status --short --branch
git remote -v
git diff --stat
git diff --cached --stat
git diff --cached
```

Classify pre-existing work and current-task changes. Never stage unrelated files, discard another session's work, reset another process's changes, or bypass hooks. Split mixed dirty trees: a JS library fix, a WasmFS change and a CMake toolchain change each go alone.

## Commit authorization and cadence

Commit your own completed fix slices frequently after their relevant checks pass, ideally an azahar Wasm build that uses them. This is standing authorization from the owner: do not ask before routine commits. Authorization to commit never authorizes pushing, creating or switching branches, amending, or rewriting history.

## Remotes and branches

| Remote | Address | Use |
| --- | --- | --- |
| `origin` | `https://browserports.dev/BrowserPorts/emscripten-stellite-wasm.git` | Forgejo, the fork. The only push target. |
| `upstream` | `https://github.com/emscripten-core/emscripten.git` | Emscripten itself. Fetch only; its fetch refspec takes only the release tag the fork is built on. |

- `main` is the fork's branch and carries the JSPI, pthread, WasmFS and emitter work on top of the release tag `5.0.7`. There is no local upstream branch.
- Bring upstream in by fetching the next release tag (`git fetch upstream tag 5.0.8`) and merging that tag into `main`, as its own commit with nothing else in it. Do not rebase `main`: azahar's gitlink pins its commits, and every Wasm build of azahar is compiled by it.
- Forgejo keeps no `BrowserPorts/emscripten-stellite-wasm-upstream` pull mirror, so upstream commits get no exemption from the attribution hook. Before merging, run the range scan below over `main..<tag>`; if it matches, stop and report.
- Keep fork edits to upstream files small so merges stay cheap.
- This repository is public. Forgejo pushes it to the read-only mirror at `github.com/BrowserPorts/emscripten-stellite-wasm`. Never push to GitHub directly, and never open a pull request or issue upstream from here.

## Recording the change in azahar

A change reaches azahar-stellite-core in two steps:

1. Commit here and push to Forgejo `origin`.
2. Then, in azahar's root, commit the new `externals/emscripten` gitlink on its own, as a commit with nothing else in it.

azahar must never point at a commit Forgejo does not hold. Before step 2, `git fetch origin` here and confirm `git branch -r --contains HEAD` lists `origin/main`. Never record a dirty checkout.

## Staging

Never stage generated output:

- the launcher scripts `bootstrap` writes (`emcc`, `em++`, `emar`, `emcmake` and the rest the ignore file lists)
- `/cache`, the system libraries `embuilder` builds, and `__pycache__/`
- `.emscripten`, `.emscripten_backup`, `.emsdk_version`, `/node_modules/`, `/out/`, coverage output

Stage exact paths, then rerun status and inspect the complete staged diff. Unstage a prohibited path with `git restore --staged -- <path>`; do not discard its working copy.

## Commit messages

Use Conventional Commits. Upstream writes its subjects without a type, so a typed subject also marks a commit as the fork's:

```text
<type>(<scope>): <imperative technical summary>
```

- Keep the subject at or below 72 characters, and describe behavior and technical rationale only.
- Use the configured human author and committer.
- No AI or model attribution of any kind: no `Co-Authored-By` naming Claude or Anthropic, no `noreply@anthropic.com`, no `Claude-Session` line, no generated-by line. Forgejo's pre-receive hook refuses a push that brings in such a commit.
- No sessions, prompts, task or rule numbers, agents, waves, worktrees, workflows, checkpoints, plans, transcripts, or process narration.

Scan the exact proposed message before committing:

```sh
rg -ni 'co-authored-by:.*(claude|anthropic|ai)|claude-session|assisted-by|generated(-by| with)|task ?#|rule ?#|#[0-9]|iter-|wave|refuter|worktree|workflow|goal-mode|checkpoint|transcript'
```

No matches are permitted.

## Pushing

- Push only to `origin` on Forgejo, and only when authorized. `git remote get-url --push origin` must print the Forgejo URL. Never push to Cursor's origin (`origin.cursor.com`), to `upstream`, or to GitHub.
- Push one branch with an explicit refspec: `git push origin main:main`. Never `--force`, `--all`, `--mirror`, `--tags`, or a bare `git push`.
- Scan the whole outgoing range first, including commits already ahead of the remote and those an upstream merge brings:

```sh
git log --format='%H%n%B' origin/main..HEAD | rg -ni 'co-authored-by:.*(claude|anthropic)|noreply@anthropic\.com|claude-session|generated(-by| with)'
```

- If Forgejo refuses a push, report why. Do not rewrite history or work around the hook.

## Safeguards

- Never use `--no-verify`.
- Never amend a pushed commit, force-push, or rewrite shared history without explicit approval.
- Use `codex/<topic>` only when a branch is requested.
- Reinspect `git show --stat --oneline --decorate HEAD` and status after every commit.
