import { isTree, type MessageTree } from "@/lib/page-content/tree";

/**
 * Reading editable lists ("collections") out of the message tree. Pass the
 * result of `t.raw("…")`; items come back in the admin's order, each as its
 * raw subtree. Fixed single fields are still read with plain `t("…")`.
 */
export function entries(raw: unknown): [string, MessageTree][] {
  if (!isTree(raw)) return [];
  return Object.entries(raw).filter((entry): entry is [string, MessageTree] => isTree(entry[1]));
}

export function str(tree: unknown, key: string): string {
  if (!isTree(tree)) return "";
  const value = tree[key];
  return typeof value === "string" ? value : "";
}

export function num(tree: unknown, key: string, fallback = 0): number {
  const n = Number.parseFloat(str(tree, key));
  return Number.isFinite(n) ? n : fallback;
}

/** "true" (stored by the editor's checkbox) → true; anything else → false. */
export function bool(tree: unknown, key: string): boolean {
  return str(tree, key) === "true";
}
