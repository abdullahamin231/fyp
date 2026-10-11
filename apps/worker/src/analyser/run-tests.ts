/**
 * Optionally run a repository's tests at the head commit.
 *
 * This is the only part of the analyser that executes repository code, so it
 * only happens when the user passes a command explicitly. It runs in a
 * throwaway git worktree checked out at head (never in the user's own working
 * copy), with a time limit, and the worktree is removed afterwards.
 *
 * The command is whatever that repository needs, including installing its
 * dependencies, e.g.
 *   "pnpm install --frozen-lockfile && pnpm vitest run --coverage --coverage.reporter=lcov"
 *   "pip install -e . && coverage run -m pytest && coverage lcov"
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface TestRun {
  command: string;
  passed: boolean;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
  /** Last part of stdout + stderr, enough to see which tests failed. */
  logTail: string;
}

export interface TestRunWithCoverage extends TestRun {
  /** LCOV text, when a coverage file was asked for and written. */
  lcov: string | null;
  /** The checkout root the LCOV paths are relative to (for path matching). */
  root: string;
}

const LOG_TAIL = 4000;

export function runTestsAtHead(
  repoDir: string,
  head: string,
  command: string,
  options: { timeoutMs?: number; coverageFile?: string } = {},
): TestRunWithCoverage {
  const root = mkdtempSync(join(tmpdir(), "unify-tests-"));
  rmSync(root, { recursive: true, force: true }); // git worktree wants to create it
  execFileSync("git", ["-C", repoDir, "worktree", "add", "--detach", root, head], { stdio: "ignore" });
  try {
    // Run as if from a fresh shell inside that repository. When the analyser
    // is itself started through npm/npx, npm adds `npm_*` and `INIT_CWD`
    // variables describing OUR project; the repository's own package manager
    // (pnpm, yarn, npm) reads those and then installs or resolves against the
    // wrong place. So the child does not inherit them.
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !/^npm_/i.test(key) && key !== "INIT_CWD"),
    );
    const started = Date.now();
    const result = spawnSync(command, {
      cwd: root,
      env,
      shell: true,
      encoding: "utf8",
      timeout: options.timeoutMs ?? 10 * 60 * 1000,
      maxBuffer: 256 * 1024 * 1024,
    });
    const log = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    const timedOut = result.error !== undefined && (result.error as NodeJS.ErrnoException).code === "ETIMEDOUT";
    const coveragePath = options.coverageFile ? join(root, options.coverageFile) : null;
    return {
      command,
      passed: result.status === 0,
      exitCode: result.status,
      timedOut,
      durationMs: Date.now() - started,
      logTail: log.length > LOG_TAIL ? `…${log.slice(-LOG_TAIL)}` : log,
      lcov: coveragePath && existsSync(coveragePath) ? readFileSync(coveragePath, "utf8") : null,
      root,
    };
  } finally {
    execFileSync("git", ["-C", repoDir, "worktree", "remove", "--force", root], { stdio: "ignore" });
  }
}
