import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

async function readText(file: string): Promise<string | null> {
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    return null;
  }
}

/** The commit the server is running, read straight from .git (no git binary needed). */
async function deployedCommit(): Promise<string | null> {
  const gitDir = path.join(process.cwd(), ".git");
  const head = await readText(path.join(gitDir, "HEAD"));
  if (!head) return null;
  if (!head.startsWith("ref: ")) return head.slice(0, 7);

  const ref = head.slice(5);
  const loose = await readText(path.join(gitDir, ...ref.split("/")));
  if (loose) return loose.slice(0, 7);

  const packed = await readText(path.join(gitDir, "packed-refs"));
  const line = packed?.split("\n").find((l) => l.endsWith(` ${ref}`));
  return line ? line.slice(0, 7) : null;
}

async function packageVersion(file: string): Promise<string | null> {
  const raw = await readText(file);
  try {
    return raw ? (JSON.parse(raw).version as string) : null;
  } catch {
    return null;
  }
}

async function databaseCheck(): Promise<{ ok: boolean; latencyMs: number | null }> {
  const started = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Math.round(performance.now() - started) };
  } catch {
    return { ok: false, latencyMs: null };
  }
}

export async function getSystemInfo() {
  const [commit, appVersion, nextVersion, database, counts] = await Promise.all([
    deployedCommit(),
    packageVersion(path.join(process.cwd(), "package.json")),
    packageVersion(path.join(process.cwd(), "node_modules", "next", "package.json")),
    databaseCheck(),
    Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.media.aggregate({ _count: true, _sum: { size: true } }),
      prisma.downloadResource.aggregate({ _count: true, _sum: { fileSize: true } }),
      prisma.pageContent.count(),
    ]).catch(() => null),
  ]);

  return {
    commit,
    appVersion,
    nextVersion,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV ?? "unknown",
    storageDriver: process.env.STORAGE_DRIVER ?? "not set",
    database,
    counts: counts
      ? {
          users: counts[0],
          posts: counts[1],
          mediaFiles: counts[2]._count,
          mediaBytes: counts[2]._sum.size ?? 0,
          downloads: counts[3]._count,
          downloadBytes: counts[3]._sum.fileSize ?? 0,
          editedPages: counts[4],
        }
      : null,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
