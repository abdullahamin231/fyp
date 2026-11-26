import { describe, expect, it } from "vitest";
import { evidenceItemSchema, NODE_TYPE_META } from "@unify/contracts";
import { fakeSupabase } from "@/test/fake-supabase";
import { figmaRefsIn, projectFigmaFile } from "./figma-design";
import { routeFinding } from "@/lib/data/route-finding";
import { linkFigmaRefs, syncFigmaDesign, watchReferencedFiles } from "./figma-sync";

/** `GET /v1/files/:key?depth=3`, trimmed to the fields the projection reads. */
const FILE = {
  name: "Checkout",
  lastModified: "2026-10-18T10:00:00Z",
  version: "4242",
  document: {
    id: "0:0",
    type: "DOCUMENT",
    children: [
      {
        id: "0:1",
        name: "Cart",
        type: "CANVAS",
        children: [
          {
            id: "12:34",
            name: "Discount code",
            type: "FRAME",
            absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812.4 },
            layoutMode: "VERTICAL",
            itemSpacing: 16,
            paddingTop: 24,
            paddingRight: 16,
            paddingBottom: 24,
            paddingLeft: 16,
            children: [
              { id: "12:35", name: "Label", type: "TEXT", characters: "Discount code" },
              { id: "12:36", name: "Total", type: "TEXT", characters: "Total after  discount" },
              { id: "12:37", name: "Divider", type: "RECTANGLE" },
            ],
          },
          { id: "12:40", name: "sticky note", type: "STICKY" },
          { id: "13:1", name: "Button", type: "COMPONENT", absoluteBoundingBox: { width: 120, height: 40 } },
        ],
      },
    ],
  },
};

describe("figma links", () => {
  it("are found in any Figma URL form, with node ids in API form", () => {
    expect(
      figmaRefsIn(
        "Design: https://www.figma.com/design/AbCdEf1234567890/Checkout?node-id=12-34&t=x and (https://figma.com/file/AbCdEf1234567890/Checkout) again https://www.figma.com/design/AbCdEf1234567890/Checkout?node-id=12-34",
      ),
    ).toEqual([
      { fileKey: "AbCdEf1234567890", nodeId: "12:34" },
      { fileKey: "AbCdEf1234567890", nodeId: null },
    ]);
  });
});

describe("projectFigmaFile", () => {
  const nodes = projectFigmaFile("AbCdEf1234567890", FILE, "v-9");

  it("makes one artifact and one constraint per top-level frame or component", () => {
    expect(nodes.map((n) => [n.type, n.externalId])).toEqual([
      ["DesignArtifact", "figma:AbCdEf1234567890"],
      ["DesignConstraint", "figma:AbCdEf1234567890:12:34"],
      ["DesignConstraint", "figma:AbCdEf1234567890:13:1"],
    ]);
  });

  it("states the frame's measurable facts and its own text as evidence the worker can cite", () => {
    const frame = nodes[1]!.payload as { text: string; slotItems: { id: string; kind: string; content: string; contentSha256: string; cite: unknown }[] };
    expect(frame.text).toBe(
      [
        'FRAME "Discount code" on page "Cart"',
        "size: 375x812",
        "auto-layout: vertical",
        "gap: 16",
        "padding: 24 16 24 16",
        'text "Label": Discount code',
        'text "Total": Total after discount',
      ].join("\n"),
    );
    // The worker keeps only items that pass this schema, and routes DesignConstraint to this slot.
    expect(frame.slotItems.every((item) => evidenceItemSchema.safeParse(item).success)).toBe(true);
    expect(NODE_TYPE_META.DesignConstraint?.slot).toBe("DESIGN_CONSTRAINTS");
    expect(frame.slotItems).toEqual([
      { id: "spec", kind: "design_constraint", content: frame.text, contentSha256: expect.stringMatching(/^[0-9a-f]{64}$/), cite: { file: "figma:AbCdEf1234567890", symbol: "Discount code" } },
    ]);
  });
});

describe("design sync", () => {
  const WS = "ws-1";
  const KEY = "AbCdEf1234567890";

  it("writes the nodes, retires vanished frames, and links tickets that point at a frame", async () => {
    const fake = fakeSupabase({
      tables: {
        nodes: [
          { id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null, payload: { figmaRefs: [{ fileKey: KEY, nodeId: "12:34" }] } },
          { id: "old", workspace_id: WS, type: "DesignConstraint", external_id: `figma:${KEY}:9:9`, valid_to: null, payload: {} },
        ],
      },
    });
    const result = await syncFigmaDesign(fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, "v-9"), null);
    expect(result).toEqual({ upserted: 3, retired: 1, linked: 1 });
    expect(fake.tables.nodes!.find((n) => n.id === "old")).toMatchObject({ status: "retired" });
    const edges = fake.tables.edges!;
    expect(edges.filter((e) => e.type === "PART_OF")).toHaveLength(2);
    const frameId = fake.tables.nodes!.find((n) => n.external_id === `figma:${KEY}:12:34`)!.id;
    expect(edges.find((e) => e.type === "CONSTRAINS")).toMatchObject({ from_id: frameId, to_id: "t1", source_class: "derived" });
  });

  it("links nothing until the design exists, so a ticket can arrive first", async () => {
    const fake = fakeSupabase({
      tables: { nodes: [{ id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null, payload: { figmaRefs: [{ fileKey: KEY, nodeId: null }] } }] },
    });
    expect(await linkFigmaRefs(fake.client as never, WS)).toBe(0);
    expect(fake.tables.edges ?? []).toEqual([]);
  });

  it("starts watching a file a ticket names, owned by the Figma connection's creator", async () => {
    const fake = fakeSupabase({
      tables: {
        integration_connections: [{ workspace_id: WS, provider: "figma", created_by: "u-owner" }],
        figma_watched_files: [{ workspace_id: WS, file_key: "Watched000001" }],
      },
    });
    const added = await watchReferencedFiles(fake.client as never, WS, [
      { fileKey: "Watched000001", nodeId: null },
      { fileKey: KEY, nodeId: "12:34" },
    ]);
    expect(added).toEqual([KEY]);
    expect(fake.tables.figma_watched_files).toContainEqual({ workspace_id: WS, file_key: KEY, created_by: "u-owner", id: expect.any(String) });
  });
});

describe("design sync: the version author is who a design finding routes to (FR-14)", () => {
  const WS = "ws-1";
  const KEY = "AbCdEf1234567890";
  const AUTHOR = [{ tool: "figma" as const, accountId: "fig-77", handle: "dana", displayName: null, email: null, relation: "author" as const }];
  const world = () =>
    fakeSupabase({
      tables: {
        integration_connections: [{ workspace_id: WS, provider: "figma", external_account_id: "fig-1", connected_account_id: "fig-1", created_by: "u-connector" }],
      },
    });
  const artifact = (fake: ReturnType<typeof world>) => fake.tables.nodes!.find((n) => n.type === "DesignArtifact")!;

  it("attaches an OWNS edge labelled as the version author to the DesignArtifact", async () => {
    const fake = world();
    await syncFigmaDesign(fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, "v-9"), null, AUTHOR);
    const person = fake.tables.nodes!.find((n) => n.external_id === "figma:fig-77")!;
    expect(person).toMatchObject({ type: "Person", payload: { role: "developer" } });
    expect(fake.tables.edges).toContainEqual(
      expect.objectContaining({ from_id: person.id, to_id: artifact(fake).id, type: "OWNS", resolver: "figma:version-author", source_class: "observed" }),
    );
  });

  it("creates no edge when Figma recorded no author, and never falls back to the connecting user", async () => {
    const fake = world();
    await syncFigmaDesign(fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, "v-9"), null, []);
    expect(fake.tables.edges!.filter((e) => e.type === "OWNS")).toEqual([]);
    expect(fake.tables.nodes!.some((n) => n.type === "Person")).toBe(false);
  });

  it("is idempotent across polls of the same version", async () => {
    const fake = world();
    for (let i = 0; i < 2; i++) await syncFigmaDesign(fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, "v-9"), null, AUTHOR);
    expect(fake.tables.edges!.filter((e) => e.type === "OWNS")).toHaveLength(1);
  });

  const publish = (fake: ReturnType<typeof world>, author: string, version: number) =>
    syncFigmaDesign(
      fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, `v-${version}`), null,
      [{ ...AUTHOR[0]!, accountId: author }],
      { version: `v-${version}`, at: `2026-11-${String(version).padStart(2, "0")}T00:00:00Z` },
    );
  /** The fake applies no column defaults, so give new edges the ones the table would. */
  const settle = (fake: ReturnType<typeof world>) => {
    for (const edge of fake.tables.edges!) edge.valid_to ??= null;
  };
  const authorsOf = (fake: ReturnType<typeof world>) =>
    fake.tables.edges!.filter((e) => e.type === "OWNS" && e.link_state === "active")
      .map((e) => fake.tables.nodes!.find((n) => n.id === e.from_id)!.external_id).sort();

  it("records the source version on the edge and moves it forward when the same author publishes again", async () => {
    const fake = world();
    await publish(fake, "a", 4);
    settle(fake);
    await publish(fake, "a", 5);
    const owns = fake.tables.edges!.filter((e) => e.type === "OWNS");
    expect(owns).toHaveLength(1);
    expect(owns[0]!.metadata).toMatchObject({ sourceVersion: "v-5", sourceVersionAt: "2026-11-05T00:00:00Z" });
  });

  it("keeps earlier authors, up to the three most recent, and retires the rest without deleting them", async () => {
    const fake = world();
    for (const [author, version] of [["a", 1], ["b", 2], ["c", 3], ["a", 4], ["d", 5]] as const) {
      await publish(fake, author, version);
      settle(fake);
    }
    expect(authorsOf(fake)).toEqual(["figma:a", "figma:c", "figma:d"]);
    const retired = fake.tables.edges!.filter((e) => e.link_state === "revoked");
    expect(retired).toEqual([expect.objectContaining({ valid_to: expect.any(String), metadata: expect.objectContaining({ sourceVersion: "v-2", revokedReason: "author_aged_out" }) })]);
  });

  it("brings an aged-out author back when they publish again", async () => {
    const fake = world();
    for (const [author, version] of [["a", 1], ["b", 2], ["c", 3], ["d", 4], ["a", 5]] as const) {
      await publish(fake, author, version);
      settle(fake);
    }
    expect(authorsOf(fake)).toEqual(["figma:a", "figma:c", "figma:d"]);
  });

  it("routes a finding on a DesignConstraint to the author through the PART_OF hop", async () => {
    const fake = world();
    await syncFigmaDesign(fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, "v-9"), null, [{ ...AUTHOR[0]!, accountId: "fig-1" }]);
    const constraint = fake.tables.nodes!.find((n) => n.type === "DesignConstraint")!;
    fake.tables.findings = [{ id: "f1", subject_node_id: constraint.id }];
    for (const edge of fake.tables.edges!) Object.assign(edge, { link_state: "active", valid_to: null });
    const result = await routeFinding(fake.client as never, "f1", { roles: ["developer"], channels: ["in_app"], hops: 1 });
    const person = fake.tables.nodes!.find((n) => n.external_id === "user:u-connector")!;
    expect(result).toMatchObject({ outcome: "routed", recipients: [{ userId: person.id, via: "OWNS", distance: 1 }] });
  });

  it("records no_role_edge for a design finding whose version had no author", async () => {
    const fake = world();
    await syncFigmaDesign(fake.client as never, WS, KEY, projectFigmaFile(KEY, FILE, "v-9"), null, []);
    const constraint = fake.tables.nodes!.find((n) => n.type === "DesignConstraint")!;
    fake.tables.findings = [{ id: "f1", subject_node_id: constraint.id }];
    for (const edge of fake.tables.edges!) Object.assign(edge, { link_state: "active", valid_to: null });
    expect(await routeFinding(fake.client as never, "f1", { roles: ["developer"], channels: ["in_app"], hops: 1 })).toMatchObject({
      outcome: "unroutable",
      reason: "no_role_edge",
    });
    expect(fake.tables.routing_outcomes).toEqual([expect.objectContaining({ reason: "no_role_edge" })]);
  });
});
