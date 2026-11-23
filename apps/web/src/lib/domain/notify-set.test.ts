import { describe, expect, it } from "vitest";
import { resolveNotifySet, type NotifyInput } from "./notify-set";

const base: NotifyInput = {
  nodeId: "pr-1",
  roles: ["developer", "designer"],
  channels: ["slack", "in_app"],
  hops: 1,
  roleEdges: [],
  nodeEdges: [],
  users: [
    { id: "ada", role: "developer", channels: ["slack", "in_app"] },
    { id: "grace", role: "designer", channels: ["in_app"] },
    { id: "pat", role: "pm", channels: ["slack", "in_app"] },
  ],
};

describe("FR-14 notify-set resolution", () => {
  it("routes a finding on a node with an ASSIGNED_TO edge to that assignee", () => {
    const result = resolveNotifySet({ ...base, roleEdges: [{ type: "ASSIGNED_TO", userId: "ada", nodeId: "pr-1" }] });
    expect(result).toEqual({
      outcome: "routed",
      nodeId: "pr-1",
      recipients: [{ userId: "ada", channels: ["slack", "in_app"], distance: 0, via: "ASSIGNED_TO" }],
    });
  });

  it("records an unroutable outcome, not silence, when the node has no role edge", () => {
    expect(resolveNotifySet(base)).toEqual({ outcome: "unroutable", nodeId: "pr-1", reason: "no_role_edge" });
  });

  it("is unroutable when role edges exist but no user passes the filters", () => {
    const result = resolveNotifySet({ ...base, roleEdges: [{ type: "OWNS", userId: "pat", nodeId: "pr-1" }] });
    expect(result).toEqual({ outcome: "unroutable", nodeId: "pr-1", reason: "no_matching_user" });
  });

  it("stops at the rule's hop bound", () => {
    const input: NotifyInput = {
      ...base,
      nodeEdges: [
        { from: "pr-1", to: "issue-1" },
        { from: "issue-1", to: "frame-1" },
      ],
      roleEdges: [{ type: "OWNS", userId: "grace", nodeId: "frame-1" }],
    };
    expect(resolveNotifySet({ ...input, hops: 1 })).toMatchObject({ outcome: "unroutable", reason: "no_role_edge" });
    expect(resolveNotifySet({ ...input, hops: 2 })).toMatchObject({
      outcome: "routed",
      recipients: [{ userId: "grace", distance: 2, via: "OWNS" }],
    });
  });

  it("clamps hops above the committed maximum of two", () => {
    const result = resolveNotifySet({
      ...base,
      hops: 5,
      nodeEdges: [
        { from: "pr-1", to: "a" },
        { from: "a", to: "b" },
        { from: "b", to: "c" },
      ],
      roleEdges: [{ type: "OWNS", userId: "ada", nodeId: "c" }],
    });
    expect(result).toMatchObject({ outcome: "unroutable", reason: "no_role_edge" });
  });

  it("terminates on cyclic graphs", () => {
    const result = resolveNotifySet({
      ...base,
      hops: 2,
      nodeEdges: [
        { from: "pr-1", to: "a" },
        { from: "a", to: "pr-1" },
      ],
      roleEdges: [{ type: "OWNS", userId: "ada", nodeId: "a" }],
    });
    expect(result).toMatchObject({ outcome: "routed", recipients: [{ userId: "ada", distance: 1 }] });
  });

  it("filters per user by role and by muted channels", () => {
    const result = resolveNotifySet({
      ...base,
      roleEdges: [
        { type: "OWNS", userId: "grace", nodeId: "pr-1" },
        { type: "WATCHES", userId: "pat", nodeId: "pr-1" },
      ],
    });
    expect(result).toEqual({
      outcome: "routed",
      nodeId: "pr-1",
      recipients: [{ userId: "grace", channels: ["in_app"], distance: 0, via: "OWNS" }],
    });
  });

  it("lists a user once, keeping the nearest and strongest edge", () => {
    const result = resolveNotifySet({
      ...base,
      nodeEdges: [{ from: "pr-1", to: "a" }],
      roleEdges: [
        { type: "OWNS", userId: "ada", nodeId: "a" },
        { type: "WATCHES", userId: "ada", nodeId: "pr-1" },
        { type: "ASSIGNED_TO", userId: "ada", nodeId: "pr-1" },
      ],
    });
    expect(result).toMatchObject({ recipients: [{ userId: "ada", distance: 0, via: "ASSIGNED_TO" }] });
  });
});
