import "server-only";

import { IntlMessageFormat } from "intl-messageformat";
import { PAGE_ICON_KEYS } from "@/lib/page-content/icons";
import { COLLECTION_PATTERNS } from "@/lib/page-content/registry";
import {
  ITEM_ID_PATTERN,
  OPTIONAL_LINK_KEYS,
  fieldKind,
  isTree,
  joinPath,
  matchesPattern,
  type MessageNode,
  type MessageTree,
} from "@/lib/page-content/tree";

const MAX_TEXT = 5000;
const MAX_ITEMS = 60;

/** Dotted message path → message. */
export type PageFieldErrors = Record<string, string>;

/**
 * ICU messages give `{`, `}` and `<tag>` meaning. Collect the placeholder and
 * tag names a message uses so an edit can be held to the same set as the
 * default — a missing `{count}` or a stray `{` would otherwise render a raw
 * key or throw on the live page.
 */
function icuTokens(message: string): { ok: true; tokens: Set<string> } | { ok: false } {
  try {
    const tokens = new Set<string>();
    // Element types from @formatjs/icu-messageformat-parser: 1 argument,
    // 2 number, 3 date, 4 time, 5 select, 6 plural, 8 tag.
    const walk = (elements: unknown[]) => {
      for (const el of elements as Array<{ type: number; value?: string; options?: Record<string, { value: unknown[] }>; children?: unknown[] }>) {
        if (el.type >= 1 && el.type <= 6 && el.value) tokens.add(`{${el.value}}`);
        if (el.type === 8 && el.value) tokens.add(`<${el.value}>`);
        if (el.options) for (const opt of Object.values(el.options)) walk(opt.value);
        if (el.children) walk(el.children);
      }
    };
    walk(new IntlMessageFormat(message, "en").getAst() as unknown[]);
    return { ok: true, tokens };
  } catch {
    return { ok: false };
  }
}

function sameTokens(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

function validateLeaf(key: string, value: unknown, example: string, path: string, errors: PageFieldErrors) {
  if (typeof value !== "string") {
    errors[path] = "Invalid value.";
    return;
  }
  if (value.length > MAX_TEXT) {
    errors[path] = `Keep this under ${MAX_TEXT} characters.`;
    return;
  }

  const required = example.trim() !== "" && !OPTIONAL_LINK_KEYS.has(key);
  const kind = fieldKind(key, example);

  switch (kind) {
    case "image":
      if (!value) {
        if (required) errors[path] = "Choose an image.";
      } else if (!/^\/(?!\/)/.test(value)) {
        // next/image only serves this site's own files (no remotePatterns), so
        // an external URL would break the page — uploads only.
        errors[path] = "Upload the image here — links to images on other websites are not supported.";
      }
      return;
    case "href":
      if (!value) {
        if (required) errors[path] = "Enter a link.";
      } else if (!/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(value)) {
        errors[path] = "Use a site path like /contact, a full https:// address, mailto: or tel:.";
      }
      return;
    case "number":
      if (!value) {
        if (required) errors[path] = "Enter a number.";
      } else if (!/^-?\d+(\.\d+)?$/.test(value)) {
        errors[path] = "Numbers only (e.g. 18 or 2.5).";
      }
      return;
    case "boolean":
      if (value !== "" && value !== "true" && value !== "false") errors[path] = "Invalid value.";
      return;
    case "icon":
      if (!PAGE_ICON_KEYS.includes(value)) errors[path] = "Choose an icon from the list.";
      return;
    default: {
      const expected = icuTokens(example);
      const actual = icuTokens(value);
      if (!actual.ok) {
        errors[path] = "Curly braces { } and angle brackets < > have a special meaning here — remove them.";
        return;
      }
      if (expected.ok && !sameTokens(expected.tokens, actual.tokens)) {
        const want = [...expected.tokens];
        errors[path] = want.length
          ? `Keep ${want.join(", ")} exactly as written — it is filled in automatically.`
          : "Curly braces { } and angle brackets < > have a special meaning here — remove them.";
      }
    }
  }
}

/**
 * Check an edited section against the default's shape. `example` is the
 * default node at the same position, or for a newly added collection item the
 * collection's first default item — it decides each leaf's kind and whether
 * it is required. Returns nothing; problems land in `errors` keyed by path.
 */
export function validateNode(
  edited: unknown,
  example: MessageNode | undefined,
  path: string,
  errors: PageFieldErrors,
  exclude: string[] = []
) {
  const collection = COLLECTION_PATTERNS.find((c) => matchesPattern(path, c.pattern));

  if (collection) {
    if (!isTree(edited)) {
      errors[path] = "Invalid list.";
      return;
    }
    const ids = Object.keys(edited);
    if (ids.length > MAX_ITEMS) errors[path] = `At most ${MAX_ITEMS} items.`;
    if (collection.minItems && ids.length < collection.minItems) {
      errors[path] = `Keep at least ${collection.minItems} ${collection.itemLabel.toLowerCase()}.`;
    }
    const first = isTree(example) ? Object.values(example)[0] : undefined;
    for (const id of ids) {
      if (!ITEM_ID_PATTERN.test(id)) {
        errors[joinPath(path, id)] = "Invalid item.";
        continue;
      }
      const itemExample = isTree(example) && id in example ? example[id] : first;
      validateNode(edited[id], itemExample, joinPath(path, id), errors);
    }
    return;
  }

  if (isTree(example)) {
    if (!isTree(edited)) {
      errors[path] = "Invalid section.";
      return;
    }
    for (const key of Object.keys(example)) {
      if (exclude.includes(key) || !(key in edited)) continue;
      validateNode(edited[key], example[key], joinPath(path, key), errors);
    }
    return;
  }

  if (typeof example === "string") {
    const key = path.slice(path.lastIndexOf(".") + 1);
    validateLeaf(key, edited, example, path, errors);
  }
}

/** Plain deep merge for assembling one page's per-section diffs into a single row. */
export function combine(a: MessageTree, b: MessageTree): MessageTree {
  const out: MessageTree = { ...a };
  for (const [key, value] of Object.entries(b)) {
    const existing = out[key];
    out[key] = isTree(existing) && isTree(value) ? combine(existing, value) : value;
  }
  return out;
}
