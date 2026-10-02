import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Every public URL an uploaded file may be referenced by. Files written since
 * the switch to the /media route are stored under public/uploads but linked
 * as /media/...; older content links the raw /uploads/... path. A reference
 * by either spelling is a reference to the same file.
 */
export function mediaUrlAliases(url: string): string[] {
  const rest = url.replace(/^\/(media|uploads)\//, "");
  if (rest === url) return [url];
  return [`/media/${rest}`, `/uploads/${rest}`];
}

/**
 * Where an uploaded file is still used, as human-readable labels
 * ("Post: …", "Manufacturing page: …"). Empty when nothing references it.
 * Deleting a file that is still referenced would leave a broken image on the
 * live site, so the media library refuses until the reference is removed.
 */
export async function findMediaUsage(url: string): Promise<string[]> {
  const aliases = mediaUrlAliases(url);

  const posts = await prisma.post.findMany({
    where: {
      OR: aliases.flatMap((alias) => [
        { content: { contains: alias } },
        { featuredImage: alias },
        { ogImage: alias },
      ]),
    },
    select: { title: true },
    take: 5,
  });

  // JSON page bodies are searched as text — the URL can sit at any depth.
  const likeAny = (column: string) =>
    Prisma.join(
      aliases.map((alias) => Prisma.sql`${Prisma.raw(column)}::text LIKE ${`%${alias}%`}`),
      " OR "
    );

  const [manufacturing, solutions, sitePages] = await Promise.all([
    prisma.$queryRaw<{ title: string }[]>`
      SELECT title FROM manufacturing_pages WHERE ${likeAny("content")} OR ${likeAny("seo")} LIMIT 5`,
    prisma.$queryRaw<{ title: string }[]>`
      SELECT title FROM solution_pages WHERE ${likeAny("content")} OR ${likeAny("seo")} LIMIT 5`,
    prisma.$queryRaw<{ pageKey: string; locale: string }[]>`
      SELECT "pageKey", locale::text AS locale FROM page_contents WHERE ${likeAny("data")} LIMIT 5`,
  ]);

  return [
    ...posts.map((p) => `Post: ${p.title}`),
    ...manufacturing.map((p) => `Manufacturing page: ${p.title}`),
    ...solutions.map((p) => `Solutions page: ${p.title}`),
    ...sitePages.map((p) => `Website page: ${p.pageKey} (${p.locale})`),
  ];
}
