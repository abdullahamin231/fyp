import { describe, expect, it } from "vitest";
import { canChangeRole, canInvite, canRemove, type MemberView } from "./members";

const member = (userId: string, role: MemberView["role"]): MemberView => ({ userId, name: userId, email: null, role, joinedAt: "" });
const owner = member("o", "owner");
const admin = member("a", "admin");
const plain = member("m", "member");
const team = [owner, admin, plain];

describe("member permissions", () => {
  it("let only owners change roles, and owners or admins invite", () => {
    expect([canChangeRole("owner"), canChangeRole("admin"), canChangeRole("member")]).toEqual([true, false, false]);
    expect([canInvite("owner"), canInvite("admin"), canInvite("member")]).toEqual([true, true, false]);
  });

  it("let an admin remove members but not owners", () => {
    expect(canRemove({ userId: "a", role: "admin" }, plain, team)).toBe(true);
    expect(canRemove({ userId: "a", role: "admin" }, owner, [...team, member("o2", "owner")])).toBe(false);
  });

  it("let anyone leave, except the last owner", () => {
    expect(canRemove({ userId: "m", role: "member" }, plain, team)).toBe(true);
    expect(canRemove({ userId: "m", role: "member" }, admin, team)).toBe(false);
    expect(canRemove({ userId: "o", role: "owner" }, owner, team)).toBe(false);
    expect(canRemove({ userId: "o", role: "owner" }, owner, [...team, member("o2", "owner")])).toBe(true);
  });
});
