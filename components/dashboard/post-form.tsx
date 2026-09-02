"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { createPost, updatePost, deletePost, type ActionResult } from "@/app/dashboard/posts/actions";
import { postPublicUrl } from "@/lib/routes";
import ImageUpload from "@/components/dashboard/image-upload";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import Select from "@/components/dashboard/form/select";
import FieldError from "@/components/dashboard/form/field-error";
import FieldHint from "@/components/dashboard/form/field-hint";

export type PostFormValues = {
  title: string;
  slug: string;
  locale: "EN" | "FR";
  excerpt: string;
  content: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  categoryId: string;
  tags: string;
  featuredImage: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogImage: string;
  noIndex: boolean;
};

type PostFormProps = {
  mode: "create" | "edit";
  post?: PostFormValues & { id: string };
  categories: { id: string; name: string; locale: string }[];
  canPublish: boolean;
};

const DEFAULTS: PostFormValues = {
  title: "",
  slug: "",
  locale: "EN",
  excerpt: "",
  content: "",
  status: "DRAFT",
  categoryId: "",
  tags: "",
  featuredImage: "",
  featuredImageAlt: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  ogImage: "",
  noIndex: false,
};

function makeClientSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

function describedBy(...parts: Array<string | false | undefined>) {
  const ids = parts.filter(Boolean) as string[];
  return ids.length ? ids.join(" ") : undefined;
}

const RichTextEditor = dynamic(() => import("@/components/dashboard/rich-text-editor"), {
  ssr: false,
  loading: () => <div className="min-h-400 rounded-8 border border-neutral-10" />,
});

export default function PostForm({ mode, post, categories, canPublish }: PostFormProps) {
  const router = useRouter();
  const initial = post ?? DEFAULTS;

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [locale, setLocale] = useState(initial.locale);
  const [status, setStatus] = useState(initial.status);
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle);
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription);
  const [ogImageUrl, setOgImageUrl] = useState(initial.ogImage);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const isBusy = isPending || uploadingCount > 0;

  function handleUploadingChange(uploading: boolean) {
    setUploadingCount((count) => count + (uploading ? 1 : -1));
  }

  const dirtyRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    if (mode === "create" && !slugTouched) setSlug(makeClientSlug(value));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    if (mode === "create") setSlugTouched(true);
  }

  function applyResult(result: ActionResult) {
    if (!result.ok) {
      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      summaryRef.current?.focus();
      return;
    }

    dirtyRef.current = false;
    setFieldErrors({});
    setFormError(null);

    if (mode === "create") {
      router.push(`/dashboard/posts/${result.id}/edit`);
      router.refresh();
      return;
    }

    setSuccessMessage(result.note ?? "Saved.");
    router.refresh();
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  function submit(formData: FormData) {
    const featuredImageValue = String(formData.get("featuredImage") ?? "").trim();
    const featuredImageAltValue = String(formData.get("featuredImageAlt") ?? "").trim();
    if (featuredImageValue && !featuredImageAltValue) {
      setFormError("Please fix the errors below.");
      setFieldErrors({ featuredImageAlt: "Alt text is required when a featured image is set." });
      summaryRef.current?.focus();
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create" ? await createPost(formData) : await updatePost(post!.id, formData);
      applyResult(result);
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    submit(new FormData(formRef.current!));
  }

  function handleSaveAsDraft() {
    setFormError(null);
    const formData = new FormData(formRef.current!);
    formData.set("status", "DRAFT");
    submit(formData);
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const result = await deletePost(post!.id);
      if (result.ok) {
        dirtyRef.current = false;
        router.push("/dashboard/posts");
        router.refresh();
      } else {
        setFormError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  const metaTitleClass =
    metaTitle.length > 60 ? "text-error" : metaTitle.length > 55 ? "text-warning" : "text-neutral-5";
  const metaDescriptionClass =
    metaDescription.length > 160
      ? "text-error"
      : metaDescription.length > 150
        ? "text-warning"
        : "text-neutral-5";

  const previewTitle = metaTitle || title || "Untitled post";
  const previewDescription = metaDescription || excerpt || "No description provided yet.";
  const effectiveSlug = slug || "your-post-slug";
  const publicUrl = postPublicUrl(locale, effectiveSlug);

  const slugChangedOnPublished =
    mode === "edit" && post?.status === "PUBLISHED" && slug !== post.slug;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onChange={() => {
        dirtyRef.current = true;
      }}
    >
      {formError && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-24 rounded-16 border border-error bg-error/5 px-24 py-16 text-p3 text-error focus:outline-none"
        >
          {formError}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="mb-24 rounded-16 border border-success bg-success/5 px-24 py-16 text-p3 text-success"
        >
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-24 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-24">
          <div className="rounded-16 border border-neutral-10 bg-white p-32">
            <h2 className="mb-24 text-p2 font-medium text-neutral-1">Content</h2>

            <div className="mb-20">
              <FieldLabel htmlFor="title" required>
                Title
              </FieldLabel>
              <TextInput
                id="title"
                name="title"
                value={title}
                onChange={handleTitleChange}
                className="text-h6"
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={describedBy(fieldErrors.title && "title-error")}
              />
              <FieldError id="title-error">{fieldErrors.title}</FieldError>
            </div>

            <div className="mb-20">
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <TextInput
                id="slug"
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                aria-invalid={Boolean(fieldErrors.slug)}
                aria-describedby={describedBy(
                  "slug-hint",
                  slugChangedOnPublished && "slug-warning",
                  fieldErrors.slug && "slug-error"
                )}
              />
              <FieldHint id="slug-hint">{publicUrl}</FieldHint>
              {slugChangedOnPublished && (
                <FieldHint id="slug-warning">
                  <span className="text-warning">
                    This post is published — changing the slug will break its existing URL.
                  </span>
                </FieldHint>
              )}
              <FieldError id="slug-error">{fieldErrors.slug}</FieldError>
            </div>

            <div className="mb-20">
              <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
              <Textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                aria-invalid={Boolean(fieldErrors.excerpt)}
                aria-describedby={describedBy("excerpt-hint", fieldErrors.excerpt && "excerpt-error")}
              />
              <FieldHint id="excerpt-hint">{excerpt.length}/300</FieldHint>
              <FieldError id="excerpt-error">{fieldErrors.excerpt}</FieldError>
            </div>

            <div>
              <FieldLabel htmlFor="content">Content</FieldLabel>
              <RichTextEditor
                name="content"
                defaultValue={initial.content}
                onChangeHtml={() => {
                  dirtyRef.current = true;
                }}
              />
              <FieldHint id="content-hint">
                Formatting, links, and inline images are saved as clean HTML.
              </FieldHint>
              <FieldError id="content-error">{fieldErrors.content}</FieldError>
            </div>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-32">
            <h2 className="mb-24 text-p2 font-medium text-neutral-1">SEO</h2>

            <div className="mb-20">
              <FieldLabel htmlFor="metaTitle">Meta title</FieldLabel>
              <TextInput
                id="metaTitle"
                name="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                aria-invalid={Boolean(fieldErrors.metaTitle)}
                aria-describedby={describedBy("metaTitle-hint", fieldErrors.metaTitle && "metaTitle-error")}
              />
              <FieldHint id="metaTitle-hint">
                <span className={metaTitleClass}>{metaTitle.length}/60</span>
              </FieldHint>
              <FieldError id="metaTitle-error">{fieldErrors.metaTitle}</FieldError>
            </div>

            <div className="mb-20">
              <FieldLabel htmlFor="metaDescription">Meta description</FieldLabel>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                aria-invalid={Boolean(fieldErrors.metaDescription)}
                aria-describedby={describedBy(
                  "metaDescription-hint",
                  fieldErrors.metaDescription && "metaDescription-error"
                )}
              />
              <FieldHint id="metaDescription-hint">
                <span className={metaDescriptionClass}>{metaDescription.length}/160</span>
              </FieldHint>
              <FieldError id="metaDescription-error">{fieldErrors.metaDescription}</FieldError>
            </div>

            <div className="mb-20">
              <FieldLabel htmlFor="focusKeyword">Focus keyword</FieldLabel>
              <TextInput
                id="focusKeyword"
                name="focusKeyword"
                defaultValue={initial.focusKeyword}
                aria-invalid={Boolean(fieldErrors.focusKeyword)}
                aria-describedby={describedBy(fieldErrors.focusKeyword && "focusKeyword-error")}
              />
              <FieldError id="focusKeyword-error">{fieldErrors.focusKeyword}</FieldError>
            </div>

            <div className="mb-20">
              <FieldLabel htmlFor="canonicalUrl">Canonical URL</FieldLabel>
              <TextInput
                id="canonicalUrl"
                name="canonicalUrl"
                defaultValue={initial.canonicalUrl}
                aria-invalid={Boolean(fieldErrors.canonicalUrl)}
                aria-describedby={describedBy(fieldErrors.canonicalUrl && "canonicalUrl-error")}
              />
              <FieldError id="canonicalUrl-error">{fieldErrors.canonicalUrl}</FieldError>
            </div>

            <div className="mb-20">
              <FieldLabel htmlFor="ogImage">OG image</FieldLabel>
              <ImageUpload
                name="ogImage"
                label="OG image"
                defaultUrl={initial.ogImage}
                onUploadingChange={handleUploadingChange}
                onUrlChange={(url) => {
                  dirtyRef.current = true;
                  setOgImageUrl(url);
                }}
              />
              <FieldError id="ogImage-error">{fieldErrors.ogImage}</FieldError>
            </div>

            <div className="flex items-start gap-8">
              <input
                type="checkbox"
                id="noIndex"
                name="noIndex"
                defaultChecked={initial.noIndex}
                className="mt-4 h-16 w-16 rounded-4 border-neutral-10 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-describedby="noIndex-hint"
              />
              <div>
                <FieldLabel htmlFor="noIndex" className="mb-0">
                  Hide from search engines
                </FieldLabel>
                <FieldHint id="noIndex-hint">
                  Adds a noindex tag so search engines skip this page.
                </FieldHint>
              </div>
            </div>

            <div className="mt-24 rounded-8 border border-neutral-10 bg-surface-2 p-16">
              <p className="mb-8 text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                Search preview
              </p>
              <div className="flex items-start gap-12">
                {ogImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ogImageUrl}
                    alt=""
                    className="h-48 w-48 shrink-0 rounded-8 border border-neutral-10 object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-p2 text-primary">{previewTitle}</p>
                  <p className="text-p4 text-success">{publicUrl}</p>
                  <p className="mt-4 text-p4 text-neutral-5">{previewDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 space-y-24 lg:sticky lg:top-32 lg:w-360">
          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Publish</h2>

            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PostFormValues["status"])}
              aria-describedby={describedBy(!canPublish && "status-hint")}
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending review</option>
              {canPublish && <option value="PUBLISHED">Published</option>}
              <option value="ARCHIVED">Archived</option>
            </Select>
            {!canPublish && (
              <FieldHint id="status-hint">
                An editor must approve this post before it can go live.
              </FieldHint>
            )}

            <div className="mt-24 flex flex-col gap-8">
              <button
                type="submit"
                disabled={isBusy}
                className="rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving…" : status === "PUBLISHED" ? "Publish" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isBusy}
                className="rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save as draft
              </button>
            </div>

            {mode === "edit" && (
              <div className="mt-24 border-t border-neutral-10 pt-24">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="w-full rounded-full border border-error px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-error transition-colors duration-200 hover:bg-error/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                  >
                    Delete post
                  </button>
                ) : (
                  <div className="flex gap-8">
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      disabled={isBusy}
                      className="flex-1 rounded-full bg-error px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-error/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Organisation</h2>

            <div className="mb-16">
              <FieldLabel htmlFor="locale">Locale</FieldLabel>
              <Select
                id="locale"
                name="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value as PostFormValues["locale"])}
              >
                <option value="EN">English</option>
                <option value="FR">French</option>
              </Select>
              {locale === "FR" && (
                <FieldHint id="locale-hint">
                  The site&apos;s routing has no French locale configured (only English and Chinese),
                  so French posts have no public URL yet.
                </FieldHint>
              )}
            </div>

            <div className="mb-16">
              <FieldLabel htmlFor="categoryId">Category</FieldLabel>
              <Select id="categoryId" name="categoryId" defaultValue={initial.categoryId}>
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <TextInput
                id="tags"
                name="tags"
                defaultValue={initial.tags}
                placeholder="solar, bess, africa"
                aria-invalid={Boolean(fieldErrors.tags)}
                aria-describedby={describedBy("tags-hint", fieldErrors.tags && "tags-error")}
              />
              <FieldHint id="tags-hint">Comma-separated, up to 10 tags.</FieldHint>
              <FieldError id="tags-error">{fieldErrors.tags}</FieldError>
            </div>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Featured image</h2>

            <ImageUpload
              name="featuredImage"
              altName="featuredImageAlt"
              label="Featured image"
              defaultUrl={initial.featuredImage}
              defaultAlt={initial.featuredImageAlt}
              altError={fieldErrors.featuredImageAlt}
              onUploadingChange={handleUploadingChange}
              onUrlChange={() => {
                dirtyRef.current = true;
              }}
            />
            <FieldError id="featuredImage-error">{fieldErrors.featuredImage}</FieldError>
          </div>
        </div>
      </div>
    </form>
  );
}
