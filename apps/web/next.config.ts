import type { NextConfig } from "next";

/**
 * No module-resolution config needed anymore: `@unify/contracts` is a proper
 * workspace package (root `package.json` → `workspaces`), so npm symlinks it
 * into the hoisted root `node_modules` — the native layout Turbopack resolves
 * against a detected workspace root. The old sync script + `turbopack.root`
 * workaround died with the workspaces migration.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
