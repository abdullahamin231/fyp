/**
 * Static parsing of one TypeScript / JavaScript file with the TypeScript
 * compiler's own parser (syntax only: no type checking, no project setup).
 *
 * From one file it extracts:
 *   - symbols: every named function-like thing and class, at any depth, with
 *     its line range, signature, doc comment and leading comments. Nested ones
 *     matter: in react-hook-form, `clearErrors` is an arrow function declared
 *     inside `createFormControl`, and that inner function is what a fix changes.
 *   - imports: module specifiers and the names imported from each.
 *   - test blocks: `it(...)` / `test(...)` calls, with their names and ranges.
 *   - dynamic sites: code whose target cannot be known statically (dynamic
 *     `import()`, `require(variable)`, `obj[expr](...)`). These are reported
 *     as unresolved, never turned into guessed edges (TODO §3.2).
 */
import ts from "typescript";

export type SymbolKind = "function" | "class" | "method";

export interface ParsedSymbol {
  /** Own name, e.g. `clearErrors`. */
  name: string;
  /** Enclosing names joined with dots, e.g. `createFormControl.clearErrors`. */
  fqName: string;
  kind: SymbolKind;
  startLine: number; // 1-based, inclusive
  endLine: number;
  /** Declaration header up to the body, whitespace collapsed. */
  signature: string;
  /** Text of a leading `/** ... *\/` block, if any. */
  docComment: string | null;
  /** Other leading `//` or `/* *\/` comments, verbatim. */
  leadingComments: string[];
  exported: boolean;
  /** The symbol's source text, verbatim (what a symbol card quotes). */
  text: string;
}

export interface ParsedImport {
  specifier: string;
  names: string[];
}

export interface TestBlock {
  /** `describe > it` path, e.g. `formState > produces a new errors reference`. */
  name: string;
  startLine: number;
  endLine: number;
  text: string;
}

export interface DynamicSite {
  kind: "dynamic-import" | "dynamic-require" | "computed-call";
  line: number;
  text: string;
}

export interface ParsedFile {
  symbols: ParsedSymbol[];
  imports: ParsedImport[];
  testBlocks: TestBlock[];
  dynamicSites: DynamicSite[];
}

const TEST_CALLS = new Set(["it", "test", "describe"]);
const MAX_SIGNATURE = 300;

function scriptKind(path: string): ts.ScriptKind {
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.[cm]?js$/.test(path)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/** Is this expression a function value, possibly wrapped (`memo(() => ...)`, `forwardRef(function ...)`)? */
function functionValue(expr: ts.Expression | undefined): ts.FunctionLikeDeclaration | null {
  if (!expr) return null;
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) return expr;
  if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr)) {
    return functionValue(expr.expression);
  }
  // React.memo(...), forwardRef(...), useCallback(...): look at the first argument.
  if (ts.isCallExpression(expr) && expr.arguments.length > 0) {
    return functionValue(expr.arguments[0]);
  }
  return null;
}

function hasExportModifier(node: ts.Node): boolean {
  const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return !!mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

export function parseSource(path: string, text: string): ParsedFile {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, scriptKind(path));
  const line = (pos: number) => sf.getLineAndCharacterOfPosition(pos).line + 1;

  const symbols: ParsedSymbol[] = [];
  const imports: ParsedImport[] = [];
  const testBlocks: TestBlock[] = [];
  const dynamicSites: DynamicSite[] = [];

  /** Comments directly above `node` (the statement that owns the declaration). */
  function comments(node: ts.Node): { doc: string | null; other: string[] } {
    const ranges = ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [];
    let doc: string | null = null;
    const other: string[] = [];
    for (const r of ranges) {
      const c = text.slice(r.pos, r.end);
      if (c.startsWith("/**")) doc = c;
      else other.push(c);
    }
    return { doc, other };
  }

  /** Header text from the start of `declNode` up to the function body. */
  function signature(declNode: ts.Node, fn: ts.FunctionLikeDeclaration | null): string {
    const start = declNode.getStart(sf);
    const end = fn?.body ? fn.body.getStart(sf) : declNode.getEnd();
    const raw = text.slice(start, end).replace(/\s+/g, " ").trim();
    return raw.length > MAX_SIGNATURE ? `${raw.slice(0, MAX_SIGNATURE)}…` : raw;
  }

  function addSymbol(
    name: string,
    kind: SymbolKind,
    rangeNode: ts.Node, // whose lines the symbol covers
    commentNode: ts.Node, // the statement carrying the comments
    fn: ts.FunctionLikeDeclaration | null,
    scope: string[],
    exported: boolean,
  ): void {
    const { doc, other } = comments(commentNode);
    symbols.push({
      name,
      fqName: [...scope, name].join("."),
      kind,
      startLine: line(rangeNode.getStart(sf)),
      endLine: line(rangeNode.getEnd()),
      signature: signature(rangeNode, fn),
      docComment: doc,
      leadingComments: other,
      exported,
      text: text.slice(rangeNode.getStart(sf), rangeNode.getEnd()),
    });
  }

  function testName(call: ts.CallExpression): string | null {
    const arg = call.arguments[0];
    if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) return arg.text;
    return null;
  }

  function visit(node: ts.Node, scope: string[], describe: string[]): void {
    let childScope = scope;
    let childDescribe = describe;

    // ---- declarations that become symbols -----------------------------------
    if (ts.isFunctionDeclaration(node) && node.name) {
      addSymbol(node.name.text, "function", node, node, node, scope, hasExportModifier(node));
      childScope = [...scope, node.name.text];
    } else if (ts.isClassDeclaration(node) && node.name) {
      addSymbol(node.name.text, "class", node, node, null, scope, hasExportModifier(node));
      childScope = [...scope, node.name.text];
    } else if (
      (ts.isMethodDeclaration(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node)) &&
      node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
    ) {
      addSymbol(node.name.text, "method", node, node, node, scope, false);
      childScope = [...scope, node.name.text];
    } else if (ts.isConstructorDeclaration(node)) {
      addSymbol("constructor", "method", node, node, node, scope, false);
      childScope = [...scope, "constructor"];
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const fn = functionValue(node.initializer);
      if (fn) {
        // Comments and `export` sit on the enclosing `const ...;` statement.
        const statement = node.parent?.parent;
        const owner = statement && ts.isVariableStatement(statement) ? statement : node;
        addSymbol(node.name.text, "function", owner === node ? node : owner, owner, fn, scope, hasExportModifier(owner));
        childScope = [...scope, node.name.text];
      }
    } else if (
      (ts.isPropertyAssignment(node) || ts.isPropertyDeclaration(node)) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
    ) {
      const fn = functionValue(node.initializer);
      if (fn) {
        addSymbol(node.name.text, "method", node, node, fn, scope, false);
        childScope = [...scope, node.name.text];
      }
    }

    // ---- imports ----------------------------------------------------------------
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const names: string[] = [];
      const clause = node.importClause;
      if (clause?.name) names.push(clause.name.text);
      const bindings = clause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) for (const el of bindings.elements) names.push(el.name.text);
      if (bindings && ts.isNamespaceImport(bindings)) names.push(`* as ${bindings.name.text}`);
      imports.push({ specifier: node.moduleSpecifier.text, names });
    }

    // ---- calls: test blocks and dynamic sites ------------------------------------
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      // it(...), test(...), describe(...), and it.each / test.only / describe.skip forms
      const base =
        ts.isIdentifier(callee) ? callee.text
        : ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) ? callee.expression.text
        : null;
      const name = testName(node);
      if (base && TEST_CALLS.has(base) && name) {
        if (base === "describe") {
          childDescribe = [...describe, name];
        } else {
          testBlocks.push({
            name: [...describe, name].join(" > "),
            startLine: line(node.getStart(sf)),
            endLine: line(node.getEnd()),
            text: text.slice(node.getStart(sf), node.getEnd()),
          });
        }
      }

      const arg = node.arguments[0];
      const literal = arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg));
      if (callee.kind === ts.SyntaxKind.ImportKeyword && !literal) {
        dynamicSites.push({ kind: "dynamic-import", line: line(node.getStart(sf)), text: node.getText(sf).slice(0, 120) });
      } else if (ts.isIdentifier(callee) && callee.text === "require" && arg && !literal) {
        dynamicSites.push({ kind: "dynamic-require", line: line(node.getStart(sf)), text: node.getText(sf).slice(0, 120) });
      } else if (
        ts.isElementAccessExpression(callee) &&
        !ts.isStringLiteral(callee.argumentExpression) &&
        !ts.isNumericLiteral(callee.argumentExpression)
      ) {
        dynamicSites.push({ kind: "computed-call", line: line(node.getStart(sf)), text: node.getText(sf).slice(0, 120) });
      }
    }

    ts.forEachChild(node, (child) => visit(child, childScope, childDescribe));
  }

  visit(sf, [], []);
  return { symbols, imports, testBlocks, dynamicSites };
}

/**
 * Lines where `name` is called in a file: `name(...)` or `something.name(...)`.
 * Used for the bounded caller neighbourhood of a changed symbol.
 */
export function callSites(path: string, text: string, name: string): number[] {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, scriptKind(path));
  const lines: number[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const callee = node.expression;
      const called =
        (ts.isIdentifier(callee) && callee.text === name) ||
        (ts.isPropertyAccessExpression(callee) && callee.name.text === name);
      if (called) lines.push(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1);
    }
    // JSX use of a component counts as a call: <Name ... />
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(sf) === name) {
      lines.push(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return lines;
}

/**
 * The most specific symbol containing `line`: among all symbols whose range
 * covers the line, the one with the smallest range (the innermost).
 */
export function innermostSymbol(symbols: readonly ParsedSymbol[], line: number): ParsedSymbol | null {
  let best: ParsedSymbol | null = null;
  for (const s of symbols) {
    if (s.startLine <= line && line <= s.endLine) {
      if (!best || s.endLine - s.startLine < best.endLine - best.startLine) best = s;
    }
  }
  return best;
}
