# Poll loop recovers a missed Jira update — run of 2026-11-27

`npm run poll` in `apps/web` at commit `f54d816`, default 60 s interval, against
the live database, workspace `testing`. Run on a Windows development machine,
**not** under the `unify-poll` systemd unit.

Setup, done by hand: the UNIFY webhook was disabled in Jira before the run, and
the summary of `SCRUM-5` was edited in Jira while the loop was running. Nothing
was triggered in UNIFY.

A wrapper started the command, took a read-only database snapshot before it and
after each pass, and was stopped manually after the tenth pass.

Files: `poll-output.txt` (ten passes), `before.json` and `after-pass-1..9.json`
(the tenth pass has no snapshot because the stop interrupted it),
`database-check.txt` (a query made after the run). Times are UTC. The Figma file
key and the workspace id are masked as `<figma-file-key>` and `<workspace-id>`,
and the raw Jira payload (it names people) is removed from the delivery rows.

| Pass | Jira reconcile (log) | `SCRUM.last_state_at` | `SCRUM.last_success_at` | `last_polled_at` |
| --- | --- | --- | --- | --- |
| before | — | 2026-11-16 17:56:39 | 2026-11-16 17:56:48 | 07:37:59 |
| 1–4 | seen 0 | unchanged | unchanged | 07:52:21 to 07:55:37 |
| 5 | seen 1, replayed `SCRUM-5` | **2026-11-27 07:55:38** | **2026-11-27 07:56:47** | 07:56:48 |
| 6–9 | seen 1, nothing replayed | unchanged since pass 5 | unchanged since pass 5 | 07:57:54 to 08:01:10 |
| 10 | seen 1, nothing replayed | no snapshot | no snapshot | no snapshot |

## Shown

- The Jira checkpoint row moved during an unattended pass. Its `last_event_id`
  contains `:jira:reconcile:`.
- The only event received after the run started is
  `reconcile:SCRUM-5@2026-11-27T12:55:38.372+0500`, so no webhook delivery
  contributed.
- The `SCRUM-5` ticket node carries the edited summary and the new version.
- Later passes saw the same issue and did not replay it.
- Jira polling and Figma polling both ran on every pass.
- Edit to graph took about 69 s in this one observation (Jira `updated`
  07:55:38, event received 07:56:42). The edit landed just after a pass.

## Not shown

- Verification or findings: `SCRUM-5` has no acceptance criteria, and no new
  finding was recorded.
- New Figma versions: the file stayed `up_to_date`.
- GitHub reconciliation: the workspace has no GitHub connection.
- The systemd unit running on a server.

## Afterwards: webhook re-enabled

With the loop stopped and the webhook re-enabled, `SCRUM-5` was edited again.
The event arrived as webhook delivery `7752292380201540440` (Jira `updated`
08:05:21, received 08:05:24), the `SCRUM` checkpoint advanced to it, and no new
`reconcile:` delivery appeared. This was queried after the run; the files above
do not include it.
