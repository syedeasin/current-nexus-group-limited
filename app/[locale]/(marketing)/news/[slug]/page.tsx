import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import DetailsHero from "@/components/sections/news/DetailsHero";
import PostNav from "@/components/sections/news/PostNav";
import { getAdjacentPosts, getAllSlugs, getPostBySlug } from "@/lib/data/news";
import { postPublicUrl } from "@/lib/routes";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { siteConfig } from "@/site.config";

/** Render posts published after build on demand instead of 404ing. */
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllSlugs();
}

/** Strip tags/whitespace so an HTML body can seed a meta description. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve a stored image path (or absolute URL) to an absolute URL for OG tags. */
function toAbsolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);

  if (!post) {
    return { title: "Post not found" };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || plainText(post.content).slice(0, 155);
  const canonical = post.canonicalUrl || postPublicUrl(locale, slug);
  const url = postPublicUrl(locale, slug);

  const imagePath = post.ogImage || post.coverImage;
  const images = imagePath
    ? [{ url: toAbsolute(imagePath), alt: post.coverImageAlt || post.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: post.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.publishedAt,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function NewsDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const [{ prev, next }, t] = await Promise.all([
    getAdjacentPosts(slug, locale),
    getTranslations("news"),
  ]);

  const postUrl = postPublicUrl(locale, slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.coverImage ? { image: [toAbsolute(post.coverImage)] } : {}),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: [{ "@type": "Person", name: post.authorName }],
  };

  return (
    <main>
      {/* Serialised from DB fields, JSON.stringify only — avoids React's text-node escaping corrupting the JSON. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <DetailsHero post={post} postUrl={postUrl} />

      <section className="w-full bg-white pt-48 pb-64 md:pt-64 md:pb-80 xl:pt-80 xl:pb-100">
        <Container>
          {/* Content was sanitised on save (D2B-3); sanitised again on output as defence in depth. */}
          <div
            className="prose-content mx-auto w-full max-w-820"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }}
          />
          <div className="mx-auto mt-32 w-full max-w-820">
            <PostNav prev={prev} next={next} previousLabel={t("previousPost")} nextLabel={t("nextPost")} />
          </div>
        </Container>
      </section>
    </main>
  );
}
