import DOMPurify from "isomorphic-dompurify";
import { siteConfig } from "@/site.config";

// Tags/attrs the Tiptap editor (rich-text-editor.tsx) can actually produce.
// Anything else — script, style, iframe, event handlers, etc. — is stripped
// because it's simply not in these lists; DOMPurify replaces the default
// allowlist entirely when ALLOWED_TAGS/ALLOWED_ATTR are given.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "class"];

const SITE_ORIGIN = new URL(siteConfig.url).origin;

let hooksRegistered = false;

// img src must be a same-origin /uploads/... path. Rejects data: URIs
// (exfiltration/payload vector) and any external host outright.
function isAllowedImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/uploads/")) return true;
  try {
    const resolved = new URL(src, siteConfig.url);
    return resolved.origin === SITE_ORIGIN && resolved.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

function registerHooks() {
  if (hooksRegistered) return;
  hooksRegistered = true;

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("rel", "noopener noreferrer nofollow");
      node.setAttribute("target", "_blank");
    }

    if (node.tagName === "IMG") {
      const src = node.getAttribute("src") ?? "";
      if (!isAllowedImageSrc(src)) {
        node.remove();
      }
    }
  });
}

// The server-side security boundary for post content. Called from
// createPost/updatePost before the HTML ever reaches Prisma — the client
// editor's own output is convenience only, never trusted.
export function sanitizePostHtml(dirty: string): string {
  registerHooks();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
