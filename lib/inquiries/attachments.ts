import "server-only";

import { mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { validateDocumentUpload, validateImageUpload, DOCUMENT_EXTENSIONS } from "@/lib/validation/upload";
import { MAX_INQUIRY_FILE_BYTES } from "@/lib/inquiries/form-fields";

/**
 * Files visitors attach to an enquiry (BOQ, specifications). They are private
 * business documents, so they live outside /public — next to it, in
 * `private-uploads/` (git-ignored, untouched by deploys) — and are only served
 * to signed-in staff by app/dashboard/inquiries/files/[...path]/route.ts.
 */
const ROOT = path.resolve(process.cwd(), "private-uploads", "inquiries");

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ATTACHMENT_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export type SavedAttachment = { ok: true; key: string; fileName: string } | { ok: false; error: "fileType" | "fileSize" };

function displayName(name: string): string {
  const cleaned = name.replace(/[/\\]/g, "").replace(/[\x00-\x1f\x7f]/g, "").replace(/^\.+/, "").trim();
  return (cleaned || "attachment").slice(0, 120);
}

/** Verify by content (not the browser's claim) and store. `key` is relative to the private root. */
export async function saveInquiryAttachment(file: File): Promise<SavedAttachment> {
  if (file.size === 0 || file.size > MAX_INQUIRY_FILE_BYTES) return { ok: false, error: "fileSize" };

  let ext: string | undefined;
  const document = await validateDocumentUpload(file);
  if (document.ok) {
    ext = DOCUMENT_EXTENSIONS[document.verifiedType];
  } else {
    // Raster photos only: an SVG can carry script, and nobody's BOQ is an SVG.
    const image = await validateImageUpload(file);
    if (image.ok) ext = IMAGE_EXTENSIONS[image.verifiedType];
  }
  if (!ext) return { ok: false, error: "fileType" };

  const now = new Date();
  const dir = path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
  await mkdir(path.join(ROOT, dir), { recursive: true });
  const fileName = `${randomUUID()}.${ext}`;
  await writeFile(path.join(ROOT, dir, fileName), Buffer.from(await file.arrayBuffer()));

  return { ok: true, key: path.posix.join(...dir.split(path.sep), fileName), fileName: displayName(file.name) };
}

/** Read a stored attachment for the dashboard. Null for anything outside the root or missing. */
export async function readInquiryAttachment(segments: string[]): Promise<{ data: Buffer; mimeType: string } | null> {
  const absolute = path.resolve(ROOT, ...segments);
  if (!absolute.startsWith(ROOT + path.sep)) return null;
  const mimeType = ATTACHMENT_MIME[path.extname(absolute).slice(1).toLowerCase()];
  if (!mimeType) return null;
  try {
    if (!(await stat(absolute)).isFile()) return null;
    return { data: await readFile(absolute), mimeType };
  } catch {
    return null;
  }
}

/** Dashboard link for a stored attachment key. */
export function attachmentHref(key: string): string {
  return `/dashboard/inquiries/files/${key}`;
}
