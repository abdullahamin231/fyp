import { createHash } from "node:crypto";
import { asRecord, text } from "./common";

/**
 * Figma design intent as evidence-graph nodes.
 *
 *   DesignArtifact    one per watched file, `figma:<fileKey>`, pinned to a version
 *   DesignConstraint  one per top-level frame/component, `figma:<fileKey>:<nodeId>`,
 *                     with a `slotItems` entry the worker reads into the
 *                     DESIGN_CONSTRAINTS packet slot
 *
 * Constraints state facts a reviewer can check code against (size, auto-layout,
 * spacing, padding, the frame's own text); nothing is paraphrased.
 */

export interface FigmaRef {
  fileKey: string;
  /** API form (`12:34`); URLs carry it as `12-34`. */
  nodeId: string | null;
}

const FIGMA_URL = /https?:\/\/(?:www\.)?figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]{10,})(?:\/[^\s?#)\]]*)?(?:\?([^\s#)\]]*))?/g;

/** Every Figma file/frame link in a piece of text, deduplicated, in order. */
export function figmaRefsIn(value: string): FigmaRef[] {
  const seen = new Set<string>();
  const out: FigmaRef[] = [];
  for (const match of value.matchAll(FIGMA_URL)) {
    const rawNode = new URLSearchParams(match[2] ?? "").get("node-id");
    const ref = { fileKey: match[1]!, nodeId: rawNode ? rawNode.replace(/-/g, ":") : null };
    const key = `${ref.fileKey}|${ref.nodeId}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(ref);
    }
  }
  return out;
}

export const designArtifactId = (fileKey: string) => `figma:${fileKey}`;
export const designConstraintId = (fileKey: string, nodeId: string) => `figma:${fileKey}:${nodeId}`;

/** Top-level design containers a ticket would point at. */
const DESIGN_TYPES = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "SECTION"]);
export const MAX_CONSTRAINTS_PER_FILE = 60;
const MAX_TEXTS_PER_FRAME = 12;

export interface DesignNodeSpec {
  externalId: string;
  type: "DesignArtifact" | "DesignConstraint";
  version: string;
  payload: Record<string, unknown>;
}

function px(value: unknown): string | null {
  return typeof value === "number" ? `${Math.round(value)}` : null;
}

/** One line per fact, in a fixed order, so equal designs give equal content (and hashes). */
function describe(node: Record<string, unknown>, page: string): string {
  const lines = [`${text(node.type) ?? "NODE"} "${text(node.name) ?? "(unnamed)"}" on page "${page}"`];
  const box = asRecord(node.absoluteBoundingBox);
  if (px(box.width) && px(box.height)) lines.push(`size: ${px(box.width)}x${px(box.height)}`);
  const layout = text(node.layoutMode);
  if (layout && layout !== "NONE") {
    lines.push(`auto-layout: ${layout.toLowerCase()}`);
    if (px(node.itemSpacing)) lines.push(`gap: ${px(node.itemSpacing)}`);
    const pad = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map(px);
    if (pad.some(Boolean)) lines.push(`padding: ${pad.map((p) => p ?? "0").join(" ")}`);
  }
  const texts = (Array.isArray(node.children) ? node.children : [])
    .map(asRecord)
    .filter((child) => child.type === "TEXT" && text(child.characters))
    .slice(0, MAX_TEXTS_PER_FRAME)
    .map((child) => `text "${text(child.name) ?? ""}": ${String(child.characters).replace(/\s+/g, " ").trim()}`);
  lines.push(...texts);
  return lines.join("\n");
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/**
 * Nodes for one file as `GET /v1/files/:key?depth=3` returns it (pages, their
 * top-level frames, and those frames' direct children).
 * https://developers.figma.com/docs/rest-api/file-endpoints/
 */
export function projectFigmaFile(fileKey: string, file: Record<string, unknown>, versionId: string): DesignNodeSpec[] {
  const fileName = text(file.name) ?? fileKey;
  const url = `https://www.figma.com/design/${fileKey}`;
  const constraints: DesignNodeSpec[] = [];
  const pages = (Array.isArray(asRecord(file.document).children) ? (asRecord(file.document).children as unknown[]) : []).map(asRecord);
  for (const page of pages) {
    const pageName = text(page.name) ?? "Page";
    for (const node of (Array.isArray(page.children) ? page.children : []).map(asRecord)) {
      const nodeId = text(node.id);
      if (!nodeId || !DESIGN_TYPES.has(String(node.type))) continue;
      if (constraints.length >= MAX_CONSTRAINTS_PER_FILE) break;
      const content = describe(node, pageName);
      const name = text(node.name) ?? nodeId;
      constraints.push({
        externalId: designConstraintId(fileKey, nodeId),
        type: "DesignConstraint",
        version: versionId,
        payload: {
          fileKey,
          nodeId,
          name,
          page: pageName,
          text: content,
          url: `${url}?node-id=${nodeId.replace(/:/g, "-")}`,
          slotItems: [
            {
              id: "spec",
              kind: "design_constraint",
              content,
              contentSha256: sha256(content),
              cite: { file: `figma:${fileKey}`, symbol: name },
            },
          ],
        },
      });
    }
  }
  return [
    {
      externalId: designArtifactId(fileKey),
      type: "DesignArtifact",
      version: versionId,
      payload: { fileKey, fileName, versionId, url, frames: constraints.length },
    },
    ...constraints,
  ];
}
