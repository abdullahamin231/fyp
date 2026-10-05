-- UNIFY Event Store Schema
-- PostgreSQL DDL
-- Run against a fresh database before starting the receiver.
--
-- Dependencies: PostgreSQL 14+, pgcrypto extension for token encryption.

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- for gen_random_uuid() and pgp_sym_encrypt

-- ── Events ───────────────────────────────────────────────────────────────────
-- Central table for all normalised event envelopes.
-- The PRIMARY KEY on event_id enforces idempotency at the DB level —
-- a duplicate delivery simply fails the INSERT with a PK conflict and is discarded.

CREATE TABLE IF NOT EXISTS events (
  event_id      UUID          PRIMARY KEY,  -- UUIDv5(source_tool + entity + version + action)
  source_tool   TEXT          NOT NULL CHECK (source_tool IN ('github', 'jira', 'figma')),
  entity_type   TEXT          NOT NULL,     -- 'pull_request' | 'issue' | 'file_version' | ...
  entity_id     TEXT          NOT NULL,     -- vendor-native ID (e.g. 'owner/repo:42')
  version       TEXT,                       -- commit SHA / issue update ts / figma version_id
  action        TEXT          NOT NULL,     -- 'opened' | 'closed' | 'status_changed' | ...
  state_before  JSONB,                      -- relevant prior state snapshot
  state_after   JSONB,                      -- relevant new state snapshot
  actor         JSONB,                      -- {id, login, type}
  occurred_at   TIMESTAMPTZ   NOT NULL,     -- when the event happened in the source tool
  received_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),  -- when Unify received it
  references    JSONB         NOT NULL DEFAULT '{
    "jira_keys":  [],
    "figma_urls": [],
    "github_urls":[],
    "pr_numbers": []
  }'::jsonb,
  raw_hash      TEXT          NOT NULL,     -- SHA-256 of the original raw payload bytes
  raw_payload   JSONB         NOT NULL      -- full raw vendor JSON (normalised row sits next to it)
);

-- Indices for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_source_tool   ON events (source_tool);
CREATE INDEX IF NOT EXISTS idx_events_entity_id     ON events (entity_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at   ON events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_action        ON events (action);

-- GIN indices for JSONB reference lookups (cross-tool linking queries)
CREATE INDEX IF NOT EXISTS idx_events_jira_keys    ON events USING GIN ((references -> 'jira_keys'));
CREATE INDEX IF NOT EXISTS idx_events_figma_urls   ON events USING GIN ((references -> 'figma_urls'));
CREATE INDEX IF NOT EXISTS idx_events_github_urls  ON events USING GIN ((references -> 'github_urls'));


-- ── Integration Tokens ────────────────────────────────────────────────────────
-- OAuth tokens and webhook secrets stored encrypted at rest.
-- Use pgp_sym_encrypt(value::text, app_secret) on write,
-- pgp_sym_decrypt(token_value, app_secret) on read.
-- The app_secret is an environment variable, never stored in the DB.

CREATE TABLE IF NOT EXISTS integration_tokens (
  id            SERIAL        PRIMARY KEY,
  workspace_id  UUID          NOT NULL,
  source_tool   TEXT          NOT NULL CHECK (source_tool IN ('github', 'jira', 'figma')),
  token_type    TEXT          NOT NULL,     -- 'access_token' | 'refresh_token' | 'webhook_secret'
  token_value   BYTEA         NOT NULL,     -- pgp_sym_encrypt(plaintext_token, app_secret)
  scopes        TEXT[],                     -- granted OAuth scopes
  expires_at    TIMESTAMPTZ,               -- NULL = non-expiring (PATs, webhook secrets)
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (workspace_id, source_tool, token_type)
);

CREATE INDEX IF NOT EXISTS idx_tokens_workspace ON integration_tokens (workspace_id, source_tool);


-- ── Webhook Registrations ─────────────────────────────────────────────────────
-- Track which webhooks have been registered, with their vendor hook IDs.
-- Used to detect missing/stale registrations and for audit.

CREATE TABLE IF NOT EXISTS webhook_registrations (
  id              SERIAL        PRIMARY KEY,
  workspace_id    UUID          NOT NULL,
  source_tool     TEXT          NOT NULL CHECK (source_tool IN ('github', 'jira', 'figma')),
  vendor_hook_id  TEXT,                     -- the ID returned by the vendor when registering
  endpoint_url    TEXT          NOT NULL,   -- the public URL we registered (e.g. ngrok URL)
  events          TEXT[]        NOT NULL,   -- list of event types registered
  active          BOOLEAN       NOT NULL DEFAULT TRUE,
  registered_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_pinged_at  TIMESTAMPTZ,
  notes           TEXT                      -- e.g. "Figma Professional plan — FILE_VERSION_UPDATE"
);


-- ── Raw Payload Log ───────────────────────────────────────────────────────────
-- Append-only log of every raw payload received, before processing.
-- Kept separate from events so that failed/unhandled payloads are preserved.

CREATE TABLE IF NOT EXISTS raw_payloads (
  id            BIGSERIAL     PRIMARY KEY,
  source_tool   TEXT          NOT NULL,
  delivery_id   TEXT,                       -- vendor delivery ID (e.g. X-GitHub-Delivery)
  event_type    TEXT,                       -- raw event type from headers
  raw_hash      TEXT          NOT NULL,
  payload       JSONB         NOT NULL,
  received_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  processed     BOOLEAN       NOT NULL DEFAULT FALSE,
  error         TEXT                        -- set if mapping failed
);

CREATE INDEX IF NOT EXISTS idx_raw_source_tool  ON raw_payloads (source_tool, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_unprocessed  ON raw_payloads (processed) WHERE NOT processed;


-- ── Helper views ──────────────────────────────────────────────────────────────

-- Cross-tool reference counts per event
CREATE OR REPLACE VIEW v_events_with_refs AS
SELECT
  event_id,
  source_tool,
  entity_type,
  entity_id,
  action,
  occurred_at,
  received_at,
  jsonb_array_length(references -> 'jira_keys')   AS jira_key_count,
  jsonb_array_length(references -> 'figma_urls')  AS figma_url_count,
  jsonb_array_length(references -> 'pr_numbers')  AS pr_ref_count,
  references -> 'jira_keys'                        AS jira_keys,
  references -> 'figma_urls'                       AS figma_urls
FROM events
ORDER BY occurred_at DESC;

-- End-to-end demo query: show the three normalised rows with references
-- SELECT source_tool, entity_type, action, jira_keys, figma_urls, occurred_at
-- FROM v_events_with_refs
-- LIMIT 10;
