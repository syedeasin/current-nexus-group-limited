import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse, type NextRequest } from "next/server";
import { getDownloadForDelivery, recordDownloadHit } from "@/lib/data/downloads";

/**
 * Controlled delivery endpoint for a downloadable resource.
 *
 * The page never links at a storage path directly. Going through this route
 * buys four things a static `/uploads/...` href cannot:
 *
 *  1. Publication is enforced at request time — unpublishing a document breaks
 *     every link that was ever shared, including ones already in someone's
 *     inbox.
 *  2. The response is always `Content-Disposition: attachment` with
 *     `X-Content-Type-Options: nosniff`, so a file is handed to the user rather
 *     than rendered in the site's own origin. This is the containment half of
 *     the upload allow-list in lib/validation/upload.ts.
 *  3. Deliveries are counted.
 *  4. The public URL is stable if storage moves from local disk to object
 *     storage later — only this file changes.
 */

const UPLOADS_ROOT = path.resolve(path.join(process.cwd(), "public", "uploads"));

/** Strip anything that could break out of the header, per RFC 6266. */
function contentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let resource: Awaited<ReturnType<typeof getDownloadForDelivery>>;
  try {
    resource = await getDownloadForDelivery(id);
  } catch {
    return NextResponse.json({ error: "Downloads are temporarily unavailable." }, { status: 503 });
  }

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const driver = process.env.STORAGE_DRIVER;
  if (driver !== "local") {
    // A remote driver hands back a URL rather than bytes; redirecting keeps the
    // public href stable while letting the CDN do the transfer.
    void recordDownloadHit(resource.id);
    return NextResponse.redirect(resource.fileUrl);
  }

  // The key comes from our own storage layer, but it is still joined against a
  // fixed root and re-checked — a traversal here would expose the whole disk.
  const absolutePath = path.resolve(path.join(process.cwd(), "public", resource.fileKey));
  if (absolutePath !== UPLOADS_ROOT && !absolutePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let size: number;
  try {
    const stats = await stat(absolutePath);
    if (!stats.isFile()) throw new Error("Not a file");
    size = stats.size;
  } catch {
    return NextResponse.json({ error: "File is no longer available." }, { status: 404 });
  }

  void recordDownloadHit(resource.id);

  const stream = Readable.toWeb(createReadStream(absolutePath)) as ReadableStream<Uint8Array>;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": resource.mimeType,
      "Content-Length": String(size),
      "Content-Disposition": contentDisposition(resource.fileName),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
