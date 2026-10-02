"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { validateImageUpload } from "@/lib/validation/upload";
import { putFile, deleteFile } from "@/lib/storage";
import { findMediaUsage } from "@/lib/media-usage";

type UploadMediaResult =
  | {
      ok: true;
      media: { id: string; url: string; alt: string | null; width: number | null; height: number | null };
    }
  | { ok: false; error: string };

type SimpleResult = { ok: true } | { ok: false; error: string };

function parseDimension(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 20000) return null;
  return n;
}

/**
 * Storage key for a media URL. Uploads live under public/uploads but are
 * linked as /media/... (app/media/[...path]/route.ts) — stripping the slash
 * alone turned "/media/2026/09/x.webp" into "media/2026/09/x.webp", which
 * deleteFile rightly refused as outside the uploads root, and the uncaught
 * throw took the whole Media page down.
 */
function keyFromUrl(url: string): string {
  return url.replace(/^\/media\//, "uploads/").replace(/^\//, "");
}

export async function uploadMedia(formData: FormData): Promise<UploadMediaResult> {
  const user = await requirePermission("media.upload");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }

  const validation = await validateImageUpload(file);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const width = parseDimension(formData.get("width"));
  const height = parseDimension(formData.get("height"));

  // SVG is stored sanitised, never the uploaded bytes — validateImageUpload
  // already ran it through DOMPurify's SVG profile.
  const fileToStore =
    validation.verifiedType === "image/svg+xml" && validation.sanitizedSvg !== undefined
      ? new File([validation.sanitizedSvg], file.name, { type: "image/svg+xml" })
      : file;

  let stored;
  try {
    stored = await putFile(fileToStore);
  } catch (error) {
    console.error("[media] storage write failed", error);
    return { ok: false, error: "Could not store the file. Please try again." };
  }

  try {
    const media = await prisma.media.create({
      data: {
        url: stored.url,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        size: stored.size,
        width,
        height,
        uploadedById: user.id,
      },
    });

    revalidatePath("/dashboard/media");
    revalidatePath("/dashboard");

    return {
      ok: true,
      media: { id: media.id, url: media.url, alt: media.alt, width: media.width, height: media.height },
    };
  } catch {
    await deleteFile(stored.key);
    return { ok: false, error: "Could not save the upload. Please try again." };
  }
}

export async function deleteMedia(id: string): Promise<SimpleResult> {
  const user = await requirePermission("media.upload");

  const media = await prisma.media.findUnique({
    where: { id },
    select: { url: true, uploadedById: true },
  });
  if (!media) return { ok: false, error: "File not found." };

  const authorised = can(user.role, "media.deleteAny") || media.uploadedById === user.id;
  if (!authorised) {
    return { ok: false, error: "You do not have permission to delete this file." };
  }

  try {
    const usage = await findMediaUsage(media.url);
    if (usage.length > 0) {
      return {
        ok: false,
        error: `This image is still used by ${usage.join("; ")}. Remove it there first, then delete it here.`,
      };
    }

    // Row first: if the file unlink then fails, the library no longer lists
    // a file that might be half-gone — an orphaned file on disk is harmless.
    await prisma.media.delete({ where: { id } });
    try {
      await deleteFile(keyFromUrl(media.url));
    } catch (error) {
      console.error("[media] file unlink failed after row delete", error);
    }
  } catch (error) {
    console.error("[media] delete failed", error);
    return { ok: false, error: "Could not delete this file. Please try again." };
  }

  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function updateMediaAlt(id: string, alt: string): Promise<SimpleResult> {
  const user = await requirePermission("media.upload");

  const media = await prisma.media.findUnique({
    where: { id },
    select: { uploadedById: true },
  });
  if (!media) return { ok: false, error: "File not found." };

  const authorised = can(user.role, "media.deleteAny") || media.uploadedById === user.id;
  if (!authorised) {
    return { ok: false, error: "You do not have permission to edit this file." };
  }

  try {
    await prisma.media.update({ where: { id }, data: { alt: alt.trim().slice(0, 180) || null } });
  } catch (error) {
    console.error("[media] alt update failed", error);
    return { ok: false, error: "Could not save the alt text. Please try again." };
  }

  revalidatePath("/dashboard/media");

  return { ok: true };
}
