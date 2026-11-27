# Unattended poll loop — run of 2026-11-27

`npm run poll` in `apps/web`, default 60 s interval, four consecutive passes
against the live database, workspace `testing`. Run on a Windows development
machine, **not** under the `unify-poll` systemd unit. Code: commit `84c8e0a`
plus the change that makes Jira reconciliation write checkpoints,
uncommitted at the time and since committed as `273e98a`.

A wrapper started the command, took a read-only database snapshot before it and
after each pass, and killed it after the fourth. Nothing was triggered by hand
between passes.

Files: `poll-output.txt` (the loop's output), `before.json` and
`after-pass-N.json` (snapshots). Times are UTC. The Figma file key and the
workspace id are masked as `<figma-file-key>` and `<workspace-id>`; nothing else
was edited.

| Snapshot | `figma_watched_files.last_polled_at` | Jira reconcile (log) | Jira checkpoint `SCRUM.last_success_at` |
| --- | --- | --- | --- |
| before | 2026-11-13 13:30:05 | — | 2026-11-16 17:56:48 |
| pass 1 | 2026-11-27 07:34:42 | ran, seen 0 | unchanged |
| pass 2 | 2026-11-27 07:35:48 | ran, seen 0 | unchanged |
| pass 3 | 2026-11-27 07:36:53 | ran, seen 0 | unchanged |
| pass 4 | 2026-11-27 07:37:59 | ran, seen 0 | unchanged |

## Shown

- The loop ran four passes on its own; each one reconciled Jira and polled
  Figma.
- `last_polled_at` advanced on every pass. `last_poll_error` stayed null.

## Not shown

- **A Jira checkpoint row moving.** Jira reported no issue updated in the last
  24 hours, so there was nothing to replay and no row to write. No `reconcile:`
  delivery exists in the database.
- New Figma versions: the file was `up_to_date`, so its checkpoint did not move.
- GitHub reconciliation: the workspace has no GitHub connection.
- The systemd unit running on a server.
