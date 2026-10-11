/**
 * The analyser's only window onto a repository: plain `git` commands run
 * against two commits (base and head).
 *
 * Everything is read from git's object store (`git diff base head`,
 * `git show head:path`, `git grep ... head`), never from a checked-out working
 * tree, so the result depends only on the two commit ids. That is what makes
 * the analysis repeatable: the same base/head always gives the same output.
 */
import { execFileSync } from "node:child_process";

export type FileStatus = "added" | "modified" | "deleted" | "renamed";

export interface ChangedFile {
  path: string;
  /** Previous path when the file was renamed or deleted; otherwise same as `path`. */
  oldPath: string;
  status: FileStatus;
}

/**
 * One diff hunk with line ranges on both sides.
 * `newLines === 0` means lines were only removed; `newStart` is then the line
 * *after which* they used to be. `oldLines === 0` means lines were only added.
 */
export interface Hunk {
  id: string; // "hunk-1", "hunk-2", ... in diff order
  file: string;
  oldPath: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  /** The hunk's `-` and `+` lines, verbatim, as in the unified diff. */
  text: string;
}

export class Git {
  constructor(readonly dir: string) {}

  private run(args: string[], allowExitOne = false): string {
    try {
      return execFileSync("git", ["-C", this.dir, ...args], {
        encoding: "utf8",
        maxBuffer: 512 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      // `git grep` exits 1 when nothing matches: that is an empty result, not a failure.
      if (allowExitOne && (error as { status?: number }).status === 1) return "";
      throw error;
    }
  }

  /** Full 40-character id of a commit-ish (branch, tag, short sha). */
  resolve(rev: string): string {
    return this.run(["rev-parse", "--verify", `${rev}^{commit}`]).trim();
  }

  /** Subject + body of one commit. */
  message(rev: string): string {
    return this.run(["log", "-1", "--format=%B", rev]).trim();
  }

  changedFiles(base: string, head: string): ChangedFile[] {
    const out = this.run(["diff", "--name-status", "-M", "--no-color", base, head]);
    const files: ChangedFile[] = [];
    for (const line of out.split("\n")) {
      if (!line.trim()) continue;
      const [code, a, b] = line.split("\t") as [string, string, string | undefined];
      const letter = code[0];
      if (letter === "R") files.push({ path: b!, oldPath: a, status: "renamed" });
      else if (letter === "A") files.push({ path: a, oldPath: a, status: "added" });
      else if (letter === "D") files.push({ path: a, oldPath: a, status: "deleted" });
      else files.push({ path: a, oldPath: a, status: "modified" });
    }
    return files;
  }

  /**
   * Diff hunks with zero lines of context (`-U0`), so each hunk's range is
   * exactly the changed lines and nothing around them.
   */
  hunks(base: string, head: string): Hunk[] {
    const out = this.run(["diff", "-U0", "-M", "--no-color", "--no-ext-diff", base, head]);
    const hunks: Hunk[] = [];
    let file = "";
    let oldPath = "";
    let current: Hunk | null = null;
    const header = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

    for (const line of out.split("\n")) {
      if (line.startsWith("diff --git ")) {
        current = null;
        continue;
      }
      if (line.startsWith("--- ")) {
        oldPath = line === "--- /dev/null" ? "" : line.slice(6); // strip "--- a/"
        continue;
      }
      if (line.startsWith("+++ ")) {
        // A deleted file has "+++ /dev/null": keep its old path as the file.
        file = line === "+++ /dev/null" ? oldPath : line.slice(6); // strip "+++ b/"
        if (!oldPath) oldPath = file;
        continue;
      }
      const m = header.exec(line);
      if (m) {
        current = {
          id: `hunk-${hunks.length + 1}`,
          file,
          oldPath,
          oldStart: Number(m[1]),
          oldLines: m[2] === undefined ? 1 : Number(m[2]),
          newStart: Number(m[3]),
          newLines: m[4] === undefined ? 1 : Number(m[4]),
          text: "",
        };
        hunks.push(current);
        continue;
      }
      if (current && (line.startsWith("+") || line.startsWith("-"))) {
        current.text += (current.text ? "\n" : "") + line;
      }
    }
    return hunks;
  }

  /** A file's content at a commit, or null if it does not exist there. */
  show(rev: string, path: string): string | null {
    try {
      return this.run(["show", `${rev}:${path}`]);
    } catch {
      return null;
    }
  }

  /** Files at `rev` that contain `word` as a whole word, limited to the given globs. */
  filesMentioning(rev: string, word: string, globs: readonly string[]): string[] {
    const out = this.run(["grep", "-l", "-w", "-F", "-e", word, rev, "--", ...globs], true);
    return out
      .split("\n")
      .filter(Boolean)
      .map((line) => line.slice(rev.length + 1)); // "rev:path" -> "path"
  }
}
