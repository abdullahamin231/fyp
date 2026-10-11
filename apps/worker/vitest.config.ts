import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // The packet builder and the loop are pure; only the optional database
    // integration suite talks to a live project (see test/integration).
    testTimeout: 20000,
  },
});
