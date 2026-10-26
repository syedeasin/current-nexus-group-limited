import type { PostSection } from "@prisma/client";

/**
 * The News Room listings (plus Case Studies, revision 1022). Each is the same index design (banner,
 * highlights carousel, paginated "all" grid) over the posts whose `section`
 * matches; only the banner and headings differ, and those come from
 * messages `news.sections.<messageKey>` so they are editable under
 * Dashboard → Pages. Post detail pages stay at /news/<slug> for every section.
 *
 * Client-safe: no Prisma runtime import, only the enum's type.
 */
export interface NewsSectionDef {
  section: PostSection;
  /** Public index route. */
  path: string;
  /** Key under messages `news.sections`. */
  messageKey: "news" | "reAnalysis" | "knowledgeDatabase" | "events" | "caseStudies";
  /** Dashboard label. */
  label: string;
}

export const NEWS_SECTIONS: Record<PostSection, NewsSectionDef> = {
  NEWS: { section: "NEWS", path: "/news", messageKey: "news", label: "News" },
  RE_ANALYSIS: { section: "RE_ANALYSIS", path: "/news/re-analysis", messageKey: "reAnalysis", label: "RE Analysis" },
  KNOWLEDGE_DATABASE: {
    section: "KNOWLEDGE_DATABASE",
    path: "/news/knowledge-database",
    messageKey: "knowledgeDatabase",
    label: "Knowledge Database",
  },
  EVENTS: { section: "EVENTS", path: "/news/events", messageKey: "events", label: "Events" },
  // Revision 1022: "View Case Study" opens a case page laid out like a news post.
  CASE_STUDIES: { section: "CASE_STUDIES", path: "/news/case-studies", messageKey: "caseStudies", label: "Case Studies" },
};

export const NEWS_SECTION_LIST: NewsSectionDef[] = Object.values(NEWS_SECTIONS);

/**
 * Slugs owned by the section index routes under /news/. A post with one of
 * these slugs could never be reached (the static route wins), so post
 * validation rejects them.
 */
export const RESERVED_NEWS_SLUGS = NEWS_SECTION_LIST.filter((s) => s.path !== "/news").map((s) =>
  s.path.replace("/news/", "")
);
