import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredFile = {
  url: string; // public URL or root-relative path
  key: string; // storage key, e.g. "uploads/2026/08/abc123.webp"
  fileName: string; // sanitised original name, for display
  mimeType: string;
  size: number;
};

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

// The caller (app/dashboard/media/actions.ts) verifies the file's magic
// bytes before calling putFile, so file.type is trustworthy here.
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  // Downloadable documents (Service -> Downloads). Verified by magic bytes in
  // lib/validation/upload.ts before they reach putFile, same as images.
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

function sanitizeFileName(name: string): string {
  const stripped = name
    .replace(/[/\\]/g, "")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/^\.+/, "");
  return (stripped || "upload").slice(0, 120);
}

async function putFileLocal(file: File, opts?: { prefix?: string }): Promise<StoredFile> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new Error(`Cannot store file with unsupported MIME type: ${file.type}`);

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const subdir = opts?.prefix ? path.join(opts.prefix, year, month) : path.join(year, month);

  const dir = path.join(UPLOADS_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const fileName = `${randomUUID()}.${ext}`;
  const key = path.posix.join("uploads", ...subdir.split(path.sep), fileName);
  const absolutePath = path.join(dir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    // Served through app/media/[...path]/route.ts, not the raw /public path —
    // see that file's doc comment for why a direct /uploads/... href is unsafe
    // for content written after the server started.
    url: `/media/${key.replace(/^uploads\//, "")}`,
    key,
    fileName: sanitizeFileName(file.name),
    mimeType: file.type,
    size: file.size,
  };
}

async function deleteFileLocal(key: string): Promise<void> {
  const resolved = path.resolve(path.join(process.cwd(), "public", key));
  const root = path.resolve(UPLOADS_ROOT);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("Refusing to delete a path outside the uploads root");
  }

  try {
    await unlink(resolved);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

export async function putFile(file: File, opts?: { prefix?: string }): Promise<StoredFile> {
  const driver = process.env.STORAGE_DRIVER;
  switch (driver) {
    case "local":
      return putFileLocal(file, opts);
    default:
      throw new Error(`Unrecognised STORAGE_DRIVER: "${driver}"`);
  }
}

export async function deleteFile(key: string): Promise<void> {
  const driver = process.env.STORAGE_DRIVER;
  switch (driver) {
    case "local":
      return deleteFileLocal(key);
    default:
      throw new Error(`Unrecognised STORAGE_DRIVER: "${driver}"`);
  }
}
