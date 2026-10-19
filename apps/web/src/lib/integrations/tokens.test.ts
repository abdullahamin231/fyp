import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

process.env.INTEGRATION_ENCRYPTION_KEY = "test-key";
let fake: FakeSupabase;
vi.mock("@/lib/supabase/admin", () => ({ admin: () => fake.client }));

const { encryptSecret, decryptSecret } = await import("./server");
const { getProviderToken, fetchProviderIdentity, ReconnectRequired } = await import("./tokens");

const NOW = Date.parse("2026-10-19T12:00:00Z");
const WS = "ws-1";

function setup(provider: "jira" | "figma", connection: Record<string, unknown>) {
  fake = fakeSupabase({
    tables: {
      integration_apps: [
        { workspace_id: WS, provider, client_id: "cid", client_secret_ciphertext: encryptSecret("csecret"), webhook_secret_ciphertext: encryptSecret("w") },
      ],
      integration_connections: [
        { workspace_id: WS, provider, access_token_ciphertext: encryptSecret("old-access"), external_account_id: "cloud-1", external_account_name: "Acme", scopes: ["read:jira-work"], ...connection },
      ],
    },
  });
}

function fakeFetch(reply: { status?: number; body: unknown }) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(reply.body), { status: reply.status ?? 200 });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const stored = () => fake.tables.integration_connections![0] as Record<string, string>;

describe("getProviderToken", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns the stored token without calling the provider while it is still valid", async () => {
    setup("jira", { token_expires_at: new Date(NOW + 3_600_000).toISOString() });
    const { impl, calls } = fakeFetch({ body: {} });
    const token = await getProviderToken(WS, "jira", { fetch: impl, now: () => NOW });
    expect(token).toEqual({ accessToken: "old-access", account: { id: "cloud-1", name: "Acme" } });
    expect(calls).toEqual([]);
  });

  it("refreshes a Jira token near expiry as JSON and stores the rotated refresh token", async () => {
    setup("jira", { token_expires_at: new Date(NOW + 30_000).toISOString(), refresh_token_ciphertext: encryptSecret("rt-1") });
    const { impl, calls } = fakeFetch({ body: { access_token: "new-access", refresh_token: "rt-2", expires_in: 3600 } });
    const token = await getProviderToken(WS, "jira", { fetch: impl, now: () => NOW });
    expect(token.accessToken).toBe("new-access");
    expect(calls[0]!.url).toBe("https://auth.atlassian.com/oauth/token");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ grant_type: "refresh_token", client_id: "cid", client_secret: "csecret", refresh_token: "rt-1" });
    expect(decryptSecret(stored().access_token_ciphertext)).toBe("new-access");
    expect(decryptSecret(stored().refresh_token_ciphertext)).toBe("rt-2");
    expect(stored().token_expires_at).toBe(new Date(NOW + 3_600_000).toISOString());
  });

  it("refreshes Figma with Basic auth and keeps the refresh token Figma does not rotate", async () => {
    setup("figma", { token_expires_at: new Date(NOW - 1).toISOString(), refresh_token_ciphertext: encryptSecret("rt-f") });
    const { impl, calls } = fakeFetch({ body: { access_token: "f-new", expires_in: 7776000 } });
    await getProviderToken(WS, "figma", { fetch: impl, now: () => NOW });
    expect(calls[0]!.url).toBe("https://api.figma.com/v1/oauth/refresh");
    expect((calls[0]!.init.headers as Record<string, string>).authorization).toBe(`Basic ${Buffer.from("cid:csecret").toString("base64")}`);
    expect(String(calls[0]!.init.body)).toBe("refresh_token=rt-f");
    expect(decryptSecret(stored().refresh_token_ciphertext)).toBe("rt-f");
  });

  it("never hands out the placeholder token of a webhook-only row", async () => {
    setup("jira", { scopes: [], token_expires_at: null });
    const { impl, calls } = fakeFetch({ body: {} });
    await expect(getProviderToken(WS, "jira", { fetch: impl, now: () => NOW })).rejects.toThrow("only a webhook secret is stored");
    expect(calls).toEqual([]);
  });

  it("asks for a reconnect when the token expired with no refresh token, or the refresh is refused", async () => {
    setup("jira", { token_expires_at: new Date(NOW - 1).toISOString() });
    await expect(getProviderToken(WS, "jira", { now: () => NOW })).rejects.toBeInstanceOf(ReconnectRequired);
    setup("jira", { token_expires_at: new Date(NOW - 1).toISOString(), refresh_token_ciphertext: encryptSecret("rt") });
    const { impl } = fakeFetch({ status: 403, body: { error: "unauthorized_client" } });
    await expect(getProviderToken(WS, "jira", { fetch: impl, now: () => NOW })).rejects.toThrow("jira needs to be reconnected: refresh failed (unauthorized_client)");
  });
});

describe("fetchProviderIdentity", () => {
  it("reads the Jira site's cloudId and name from accessible-resources", async () => {
    const { impl, calls } = fakeFetch({ body: [{ id: "c-9", name: "acme", url: "https://acme.atlassian.net", scopes: [] }] });
    expect(await fetchProviderIdentity("jira", "t", impl)).toEqual({ id: "c-9", name: "acme (acme.atlassian.net)" });
    expect(calls[0]!.url).toBe("https://api.atlassian.com/oauth/token/accessible-resources");
  });
});
