/**
 * Static parsing of one Python file, producing the same `ParsedFile` shape as
 * the TypeScript parser so the rest of the analyser does not care which
 * language a file is in.
 *
 * Python's block structure is its indentation, so this parser works line by
 * line rather than through a full grammar:
 *   - a symbol starts at a `def`, `async def` or `class` line (decorators
 *     directly above it are included);
 *   - it ends at the last non-blank line before the next line that is indented
 *     at or left of the `def`/`class` itself;
 *   - nesting comes from indentation too, giving dotted names such as
 *     `Store.add` or `outer.inner`.
 * Lines inside triple-quoted strings and inside open brackets are skipped when
 * looking for where a block ends, so a docstring or a multi-line call that
 * happens to start at column 0 does not end the function early.
 *
 * This is a deliberate trade-off: no dependency and easy to explain, but it is
 * not a full Python parser. Code that defines functions with `exec` or builds
 * classes with `type(...)` is not seen.
 */
import type { DynamicSite, ParsedFile, ParsedImport, ParsedSymbol, TestBlock } from "./parse.js";

interface Line {
  n: number; // 1-based
  text: string;
  indent: number;
  /** True when this line starts inside a triple-quoted string or an open bracket. */
  continuation: boolean;
  blank: boolean;
}

/** Split into lines and mark which ones start inside a string or bracket. */
function scan(text: string): Line[] {
  const raw = text.split("\n");
  const lines: Line[] = [];
  let depth = 0; // open (, [, {
  let triple: string | null = null; // inside ''' or """
  for (let i = 0; i < raw.length; i += 1) {
    const t = raw[i]!.replace(/\r$/, "");
    const continuation = depth > 0 || triple !== null;
    const stripped = t.trim();
    lines.push({
      n: i + 1,
      text: t,
      indent: t.length - t.trimStart().length,
      continuation,
      blank: stripped === "" || (!continuation && stripped.startsWith("#")),
    });
    // Track strings, comments and brackets to the end of this line.
    for (let j = 0; j < t.length; j += 1) {
      const rest = t.slice(j);
      if (triple) {
        if (rest.startsWith(triple)) {
          j += 2;
          triple = null;
        }
        continue;
      }
      if (rest.startsWith('"""') || rest.startsWith("'''")) {
        triple = rest.slice(0, 3);
        j += 2;
        continue;
      }
      const c = t[j]!;
      if (c === "#") break;
      if (c === '"' || c === "'") {
        // single-line string: skip to its closing quote
        let k = j + 1;
        while (k < t.length && t[k] !== c) k += t[k] === "\\" ? 2 : 1;
        j = k;
        continue;
      }
      if (c === "(" || c === "[" || c === "{") depth += 1;
      if (c === ")" || c === "]" || c === "}") depth = Math.max(0, depth - 1);
    }
  }
  return lines;
}

const DEF = /^(\s*)(async\s+def|def|class)\s+([A-Za-z_]\w*)/;

export function parsePython(text: string): ParsedFile {
  const lines = scan(text);
  const symbols: ParsedSymbol[] = [];
  const imports: ParsedImport[] = [];
  const dynamicSites: DynamicSite[] = [];
  /** Open blocks: [indent, fqName] — used to name nested symbols. */
  const stack: { indent: number; name: string }[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    if (line.continuation || line.blank) continue;
    while (stack.length && stack[stack.length - 1]!.indent >= line.indent) stack.pop();

    const m = DEF.exec(line.text);
    if (m) {
      const kindWord = m[2]!;
      const name = m[3]!;
      const indent = line.indent;
      // Decorators directly above belong to the symbol.
      let start = i;
      while (start > 0 && /^\s*@/.test(lines[start - 1]!.text)) start -= 1;
      // The block ends before the next real line indented at or left of `def`/`class`.
      let end = i;
      for (let k = i + 1; k < lines.length; k += 1) {
        const l = lines[k]!;
        if (l.continuation || l.blank) {
          if (!l.blank) end = k;
          continue;
        }
        if (l.indent <= indent) break;
        end = k;
      }
      // Signature: the header up to the `:` that opens the body (may span lines).
      let header = "";
      for (let k = i; k <= end; k += 1) {
        header += ` ${lines[k]!.text.trim()}`;
        if (/:\s*(#.*)?$/.test(lines[k]!.text) && !lines[k + 1]?.continuation) break;
      }
      // Docstring: a string literal as the first statement of the body.
      const first = lines.slice(i + 1, end + 1).find((l) => !l.blank && !l.continuation);
      let doc: string | null = null;
      if (first && /^\s*[rRbBuU]?("""|'''|"|')/.test(first.text)) {
        const from = first.n - 1;
        let to = from;
        const quote = /("""|''')/.exec(first.text)?.[1];
        if (quote && first.text.split(quote).length < 3) {
          while (to + 1 <= end && !lines[to + 1]!.text.includes(quote)) to += 1;
          to += 1;
        }
        doc = lines.slice(from, to + 1).map((l) => l.text.trim()).join("\n");
      }
      // Comments directly above (and above any decorators).
      const comments: string[] = [];
      for (let k = start - 1; k >= 0 && /^\s*#/.test(lines[k]!.text); k -= 1) comments.unshift(lines[k]!.text.trim());

      const scope = stack.map((s) => s.name);
      const inClass = stack.length > 0 && symbols.find((s) => s.fqName === scope.join("."))?.kind === "class";
      symbols.push({
        name,
        fqName: [...scope, name].join("."),
        kind: kindWord === "class" ? "class" : inClass ? "method" : "function",
        startLine: lines[start]!.n,
        endLine: lines[end]!.n,
        signature: header.trim().replace(/\s+/g, " ").slice(0, 300),
        docComment: doc,
        leadingComments: comments,
        exported: indent === 0 && !name.startsWith("_"),
        text: lines.slice(start, end + 1).map((l) => l.text).join("\n"),
      });
      stack.push({ indent, name });
    }

    // Imports (top level or not).
    const imp = /^\s*import\s+(.+)$/.exec(line.text);
    const from = /^\s*from\s+(\S+)\s+import\s+(.+)$/.exec(line.text);
    if (from) {
      const names = from[2]!.replace(/[()]/g, "").split(",").map((s) => s.trim().split(/\s+as\s+/)[0]!).filter(Boolean);
      imports.push({ specifier: from[1]!, names });
    } else if (imp) {
      for (const part of imp[1]!.split(",")) {
        const mod = part.trim().split(/\s+as\s+/)[0]!;
        if (mod) imports.push({ specifier: mod, names: [] });
      }
    }

    // Dynamic sites.
    const dyn: [RegExp, DynamicSite["kind"]][] = [
      [/importlib\.import_module\(\s*[^'"\s)]/, "dynamic-import"],
      [/__import__\(\s*[^'"\s)]/, "dynamic-import"],
      [/getattr\([^)]*\)\s*\(/, "computed-call"],
    ];
    for (const [re, kind] of dyn) {
      if (re.test(line.text)) dynamicSites.push({ kind, line: line.n, text: line.text.trim().slice(0, 120) });
    }
  }

  // Test blocks: `def test_*` functions and methods (pytest / unittest naming).
  const testBlocks: TestBlock[] = symbols
    .filter((s) => s.kind !== "class" && s.name.startsWith("test"))
    .map((s) => ({ name: s.fqName.split(".").join(" > "), startLine: s.startLine, endLine: s.endLine, text: s.text }));

  return { symbols, imports, testBlocks, dynamicSites };
}

/** Lines where `name(` is called (definitions excluded). */
export function pythonCallSites(text: string, name: string): number[] {
  const call = new RegExp(`(^|[^\\w.])${name}\\s*\\(|\\.${name}\\s*\\(`);
  const def = new RegExp(`^\\s*(async\\s+def|def|class)\\s+${name}\\b`);
  const out: number[] = [];
  const lines = scan(text);
  for (const l of lines) {
    if (l.blank || def.test(l.text)) continue;
    const code = l.text.replace(/#.*$/, "");
    if (call.test(code)) out.push(l.n);
  }
  return out;
}

/**
 * Does a Python import in `importer` refer to `target`?
 *   relative:  `from .total import x` in pkg/cart.py → pkg/total.py
 *   absolute:  `from pkg.total import x` → pkg/total.py, also under src/
 * Packages resolve to `<dir>/__init__.py`.
 */
export function pythonImportResolvesTo(importer: string, specifier: string, target: string): boolean {
  const stem = target.replace(/\.py$/, "").replace(/\/__init__$/, "");
  let path: string;
  if (specifier.startsWith(".")) {
    const dots = /^\.+/.exec(specifier)![0].length;
    const parts = importer.split("/").slice(0, -1);
    const up = parts.slice(0, parts.length - (dots - 1));
    const rest = specifier.slice(dots);
    path = [...up, ...(rest ? rest.split(".") : [])].join("/");
  } else {
    path = specifier.split(".").join("/");
  }
  return stem === path || stem === `src/${path}` || stem.endsWith(`/${path}`) && stem.split("/").length - path.split("/").length <= 1;
}
