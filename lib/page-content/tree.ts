/**
 * Pure helpers for the Pages CMS message tree (no server or React imports —
 * used by i18n/request.ts, the save action and the dashboard editor alike).
 *
 * A page's content is a subtree of the next-intl messages. Leaves are always
 * strings. A "collection" (COLLECTION_PATTERNS in ./registry) is an object
 * whose children are same-shaped items the admin may add, remove and reorder
 * — hero slides, FAQ entries, footer links. Everything else has a fixed
 * shape: only the leaf strings can change.
 */
import { COLLECTION_PATTERNS } from "@/lib/page-content/registry";

export type MessageTree = { [key: string]: MessageNode };
export type MessageNode = string | MessageTree;

/** Collection item ids become message keys — keep them plain. */
export const ITEM_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

export function isTree(value: unknown): value is MessageTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function joinPath(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

export function getAt(root: unknown, path: string): MessageNode | undefined {
  if (!path) return isTree(root) ? root : undefined;
  let cur: unknown = root;
  for (const segment of path.split(".")) {
    if (!isTree(cur) || !(segment in cur)) return undefined;
    cur = cur[segment];
  }
  return cur as MessageNode;
}

/** Immutable set — returns a new root with `value` at `path`, creating objects on the way. */
export function setAt(root: MessageTree, path: string, value: MessageNode): MessageTree {
  const [head, ...rest] = path.split(".");
  if (rest.length === 0) return { ...root, [head]: value };
  const child = isTree(root[head]) ? (root[head] as MessageTree) : {};
  return { ...root, [head]: setAt(child, rest.join("."), value) };
}

/** Segment-wise match where "*" matches any one segment. */
export function matchesPattern(path: string, pattern: string): boolean {
  const a = path.split(".");
  const b = pattern.split(".");
  return a.length === b.length && b.every((seg, i) => seg === "*" || seg === a[i]);
}

export function isCollectionPath(path: string): boolean {
  return COLLECTION_PATTERNS.some((c) => matchesPattern(path, c.pattern));
}

/** Same shape, every string emptied, nested collections emptied. Template for a new item. */
export function blankLike(node: MessageNode | undefined, path = ""): MessageNode | undefined {
  if (node === undefined) return undefined;
  if (typeof node === "string") return "";
  if (path && isCollectionPath(path)) return {};
  const out: MessageTree = {};
  for (const [key, child] of Object.entries(node)) {
    const blank = blankLike(child, joinPath(path, key));
    if (blank !== undefined) out[key] = blank;
  }
  return out;
}

/** The shape a new item of the collection at `path` should start from. */
export function collectionTemplate(base: MessageNode | undefined, path: string): MessageNode | undefined {
  if (!isTree(base)) return undefined;
  const first = Object.keys(base)[0];
  if (first === undefined) return undefined;
  return blankLike(base[first], joinPath(path, first));
}

/**
 * Lay an admin override over the default tree. The base decides the shape:
 * unknown keys in the override are dropped and a leaf only accepts a string,
 * so a stale or hand-edited row can never inject structure a component does
 * not expect. Collections are the exception — the override's items (and
 * their order) replace the default list wholesale, each item filled out from
 * its default counterpart (or a blank template) so newly shipped keys never
 * go missing.
 */
export function mergeNode(base: MessageNode | undefined, override: unknown, path = ""): MessageNode | undefined {
  if (override === undefined) return base;

  if (path && isCollectionPath(path)) {
    const items = collectionEntries(override);
    if (!items) return base;
    const template = collectionTemplate(base, path);
    const out: MessageTree = {};
    for (const [id, item] of items) {
      if (!ITEM_ID_PATTERN.test(id)) continue;
      const itemBase = isTree(base) && id in base ? base[id] : template;
      const merged = mergeNode(itemBase, item, joinPath(path, id));
      if (merged !== undefined) out[id] = merged;
    }
    return out;
  }

  if (isTree(base)) {
    if (!isTree(override)) return base;
    const out: MessageTree = { ...base };
    for (const key of Object.keys(override)) {
      if (!(key in base)) continue;
      const merged = mergeNode(base[key], override[key], joinPath(path, key));
      if (merged !== undefined) out[key] = merged;
    }
    return out;
  }

  if (typeof base === "string") return typeof override === "string" ? override : base;
  return base;
}

/**
 * Postgres `jsonb` does not keep object key order, and a collection's key
 * order IS its display order. So collections are stored as ordered
 * `[id, item]` pairs (toStorage) and read back from either shape.
 */
type StoredCollection = [string, unknown][];

function collectionEntries(value: unknown): [string, unknown][] | null {
  if (Array.isArray(value)) {
    return value.filter(
      (pair): pair is [string, unknown] => Array.isArray(pair) && pair.length === 2 && typeof pair[0] === "string"
    );
  }
  return isTree(value) ? Object.entries(value) : null;
}

/** Convert a diff tree for writing to `jsonb`: every collection becomes ordered `[id, item]` pairs. */
export function toStorage(node: unknown, path = ""): unknown {
  if (!isTree(node)) return node;
  if (path && isCollectionPath(path)) {
    return Object.entries(node).map(([id, item]) => [id, toStorage(item, joinPath(path, id))]) as StoredCollection;
  }
  return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, toStorage(child, joinPath(path, key))]));
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!isTree(a) || !isTree(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  // Key order matters: it is the display order of collection items.
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && deepEqual(a[k], b[k]));
}

/**
 * What to store: only the leaves that differ from the default, plus any
 * collection whose items or order changed (stored whole). `undefined` means
 * "identical to the default" — nothing to save.
 */
export function diffNode(base: MessageNode | undefined, edited: unknown, path = ""): MessageNode | undefined {
  if (path && isCollectionPath(path)) {
    return deepEqual(base, edited) || !isTree(edited) ? undefined : (edited as MessageTree);
  }
  if (isTree(base)) {
    if (!isTree(edited)) return undefined;
    const out: MessageTree = {};
    let changed = false;
    for (const key of Object.keys(base)) {
      if (!(key in edited)) continue;
      const d = diffNode(base[key], edited[key], joinPath(path, key));
      if (d !== undefined) {
        out[key] = d;
        changed = true;
      }
    }
    return changed ? out : undefined;
  }
  if (typeof base === "string") {
    return typeof edited === "string" && edited !== base ? edited : undefined;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Field kinds — how the editor renders, and the save action validates, */
/* a leaf. Decided by the leaf's key so an empty value keeps its kind.  */
/* ------------------------------------------------------------------ */

export type FieldKind = "image" | "href" | "icon" | "boolean" | "number" | "longText" | "text";

/** Footer social profiles — links like any other, but empty is allowed (it hides the link). */
export const OPTIONAL_LINK_KEYS = new Set(["facebook", "instagram", "linkedin"]);

export function fieldKind(key: string, defaultValue: string): FieldKind {
  if (/^(image|logo|photo|avatar)$|(Image|Logo|Photo|Avatar)$/.test(key)) return "image";
  if (key === "href" || key.endsWith("Href") || OPTIONAL_LINK_KEYS.has(key)) return "href";
  if (key === "icon") return "icon";
  if (key === "featured") return "boolean";
  if (key === "number" || key === "width") return "number";
  if (defaultValue.length > 90 || defaultValue.includes("\n")) return "longText";
  return "text";
}

/** Accessibility-only strings (screen-reader labels) — not shown in the editor. */
export function isHiddenKey(key: string): boolean {
  return /(^aria|Aria|Landmark$)/.test(key);
}
