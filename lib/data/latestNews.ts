export interface BlogPost {
  /** Also the i18n key under home.latestNews.posts, and the future Supabase row id. */
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date (UTC), formatted for display with lib/formatDate.ts. */
  date: string;
  readTime: string;
  image: string;
}

/**
 * TODO(Easin): placeholder until Supabase is wired. `title` is duplicated
 * into messages/en.json + zh.json under home.latestNews.posts.<slug> so the
 * card can render translated copy today via next-intl — once Supabase is
 * live, title/excerpt/category come from the database (per-post, not
 * per-locale-message-file) and the message keys can be dropped. `excerpt`
 * and `category` aren't shown on the homepage card (Figma doesn't render
 * them there) and are left empty — they're only in this shape because the
 * future `BlogPost` row has them, for the article page.
 */
export const latestNews: BlogPost[] = [
  {
    slug: "high-efficiency-solar-modules",
    title: "Why high-efficiency solar modules are transforming utility-scale projects",
    excerpt: "",
    category: "",
    date: "2026-07-30",
    readTime: "7 min read",
    image: "/images/home/blog01.webp",
  },
  {
    slug: "hjt-solar-technology-yield",
    title: "How HJT solar technology delivers higher energy yield in real-world settings",
    excerpt: "",
    category: "",
    date: "2026-07-30",
    readTime: "7 min read",
    image: "/images/home/blog02.webp",
  },
  {
    slug: "choosing-commercial-solar-module",
    // Figma has a typo here ("projet" instead of "project") — reproduced as designed, not fixed. Flagged in the report.
    title: "How to choose the right solar module for commercial energy projet",
    excerpt: "",
    category: "",
    date: "2026-07-30",
    readTime: "7 min read",
    image: "/images/home/blog03.webp",
  },
];
