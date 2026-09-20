import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Controlled delivery endpoint for uploaded images (Media library, and every
 * dashboard image field that calls it).
 *
 * A plain `/uploads/...` href relies on Next's `/public` static-file
 * resolution, which does not reliably see files written to disk *after* the
 * server process started (`next start` can fall through to the app router
 * for such a path, render `not-found`, and cache that response — every
 * upload made while the server is running would 404 until the next
 * restart). Serving through an explicit route handler reads the file fresh
 * from disk on every request instead, sidestepping that entirely — the same
 * reason app/api/downloads/[id]/route.ts already avoids linking at a
 * storage path directly.
 */

const UPLOADS_ROOT = path.resolve(path.join(process.cwd(), "public", "uploads"));

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;

  // Joined against a fixed root and re-checked — a traversal here would expose the whole disk.
  const absolutePath = path.resolve(path.join(process.cwd(), "public", "uploads", ...segments));
  if (absolutePath !== UPLOADS_ROOT && !absolutePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(absolutePath).slice(1).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let size: number;
  try {
    const stats = await stat(absolutePath);
    if (!stats.isFile()) throw new Error("Not a file");
    size = stats.size;
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stream = Readable.toWeb(createReadStream(absolutePath)) as ReadableStream<Uint8Array>;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(size),
      // Filenames are random UUIDs, never reused — safe to cache indefinitely.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
