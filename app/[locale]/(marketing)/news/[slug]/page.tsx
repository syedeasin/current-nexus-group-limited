import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import DetailsHero from "@/components/sections/news/DetailsHero";
import ArticleBody from "@/components/sections/news/ArticleBody";
import PostNav from "@/components/sections/news/PostNav";
import { getPathname } from "@/i18n/navigation";
import { getAdjacentPosts, getAllSlugs, getPostBySlug } from "@/lib/data/news";
import { siteConfig } from "@/site.config";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const path = getPathname({ href: `/news/${slug}`, locale });
  const url = `${siteConfig.url}${path}`;
  const coverUrl = `${siteConfig.url}${post.coverImage}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      images: [{ url: coverUrl }],
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [coverUrl],
    },
  };
}

export default async function NewsDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [{ prev, next }, t] = await Promise.all([
    getAdjacentPosts(slug),
    getTranslations("news"),
  ]);

  const path = getPathname({ href: `/news/${slug}`, locale });
  const postUrl = `${siteConfig.url}${path}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [`${siteConfig.url}${post.coverImage}`],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: [{ "@type": "Organization", name: siteConfig.name }],
  };

  return (
    <main>
      {/* Static, local data — safe per project convention, avoids React's default text-node HTML-escaping corrupting the JSON. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <DetailsHero post={post} postUrl={postUrl} />

      <section className="w-full bg-white pt-48 pb-64 md:pt-64 md:pb-80 xl:pt-80 xl:pb-100">
        <Container>
          <ArticleBody blocks={post.content} />
          <div className="mx-auto mt-32 w-full max-w-820">
            <PostNav prev={prev} next={next} previousLabel={t("previousPost")} nextLabel={t("nextPost")} />
          </div>
        </Container>
      </section>
    </main>
  );
}
