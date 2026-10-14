# Workspaces: creation, invitations, multi-membership

## Decisions (confirmed with user)

- **Rename `/onboarding`** → focused workspace creation at `/workspaces/new`
  (name + slug via the existing `create_workspace` RPC, then an invite-members
  step). The 5-step integration/policy wizard stays as-is at the legacy
  `/onboarding` route (OAuth callbacks still land there); it loses its nav entry.
- **Invitations are in-app, by email.** New `workspace_invitations` table
  (migration `00018`). Inviter must be owner/admin; invitee is matched by email
  at read time, so inviting an address with no account yet is allowed — the
  invite appears once they sign up. No real emails sent.
- **Invitees see invitations in the top-bar bell**, now a dropdown panel with
  Accept / Decline. No separate notifications page.
- **Multi-workspace UX**: a workspace switcher in the top bar picks the active
  workspace, persisted in the `unify-workspace` cookie. Data pages keep reading
  via RLS (union across memberships) — per-page scoping comes later.

## Shape

- `workspace_invitations(id, workspace_id, invited_email, invited_by, role,
  status, created_at, responded_at)`; status enum `invitation_status`
  (`pending|accepted|declined`), DB-internal like `workspace_role`.
- RPCs (SECURITY DEFINER, same rationale as `create_workspace` in 00008):
  `invite_to_workspace`, `accept_workspace_invitation`, `decline_workspace_invitation`.
  Helper `current_user_email()` for policies. Revoking an invite is a plain
  DELETE by an owner/admin.
- RLS: invitee reads invites addressed to them; owners/admins read/insert/delete
  invites for their workspace. A new permissive policy `workspaces_select_invited`
  lets an invitee read the invited workspace's row (name/slug) so the bell can
  render it.
- One pending invite per `(workspace_id, invited_email)` (partial unique index).

## Routes

- `/workspaces` — my workspaces (role badge, member count) + create CTA.
- `/workspaces/new` — create form → invite step → done.
- `/onboarding` — unchanged legacy wizard, unlinked from nav.
