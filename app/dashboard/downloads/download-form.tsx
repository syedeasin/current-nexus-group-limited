"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import {
  createDownload,
  updateDownload,
  deleteDownload,
  type ActionResult,
} from "@/app/dashboard/downloads/actions";
import { fileTypeLabel, formatFileSize } from "@/app/dashboard/downloads/file-utils";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import Select from "@/components/dashboard/form/select";
import FieldError from "@/components/dashboard/form/field-error";
import FieldHint from "@/components/dashboard/form/field-hint";

export type FilterGroupChoice = {
  id: string;
  name: string;
  locale: "EN" | "FR";
  isActive: boolean;
  options: { id: string; name: string; isActive: boolean }[];
};

export type DownloadFormValues = {
  title: string;
  slug: string;
  locale: "EN" | "FR";
  description: string;
  status: "DRAFT" | "PUBLISHED";
  displayOrder: number;
  tags: string;
  filterOptionIds: string[];
};

export type ExistingFile = {
  fileName: string;
  mimeType: string;
  fileSize: number;
};

type DownloadFormProps = {
  mode: "create" | "edit";
  download?: DownloadFormValues & { id: string; file: ExistingFile };
  groups: FilterGroupChoice[];
};

const DEFAULTS: DownloadFormValues = {
  title: "",
  slug: "",
  locale: "EN",
  description: "",
  status: "DRAFT",
  displayOrder: 0,
  tags: "",
  filterOptionIds: [],
};

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

function makeClientSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

function describedBy(...parts: Array<string | false | undefined>) {
  const ids = parts.filter(Boolean) as string[];
  return ids.length ? ids.join(" ") : undefined;
}

export default function DownloadForm({ mode, download, groups }: DownloadFormProps) {
  const router = useRouter();
  const initial = download ?? DEFAULTS;

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [locale, setLocale] = useState(initial.locale);
  const [status, setStatus] = useState(initial.status);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initial.filterOptionIds);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  // A group belongs to one locale, so only that locale's taxonomy can tag this
  // resource — tagging across locales would never match the public facets.
  const visibleGroups = groups.filter(
    (group) => group.locale === locale && (group.isActive || groupHasSelection(group))
  );

  function groupHasSelection(group: FilterGroupChoice) {
    return group.options.some((option) => selectedOptions.includes(option.id));
  }

  function toggleOption(id: string) {
    dirtyRef.current = true;
    setSelectedOptions((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    if (mode === "create" && !slugTouched) setSlug(makeClientSlug(value));
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
      router.push(`/dashboard/downloads/${result.id}/edit`);
      router.refresh();
      return;
    }

    setSuccessMessage("Saved.");
    router.refresh();
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createDownload(formData)
          : await updateDownload(download!.id, formData);
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
      const result = await deleteDownload(download!.id);
      if (result.ok) {
        dirtyRef.current = false;
        router.push("/dashboard/downloads");
        router.refresh();
      } else {
        setFormError(result.error);
        setConfirmDelete(false);
      }
    });
  }

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

      {selectedOptions.map((id) => (
        <input key={id} type="hidden" name="filterOptionIds" value={id} />
      ))}

      <div className="flex flex-col gap-24 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-24">
          <div className="rounded-16 border border-neutral-10 bg-white p-32">
            <h2 className="mb-24 text-p2 font-medium text-neutral-1">Document</h2>

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
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (mode === "create") setSlugTouched(true);
                }}
                aria-invalid={Boolean(fieldErrors.slug)}
                aria-describedby={describedBy("slug-hint", fieldErrors.slug && "slug-error")}
              />
              <FieldHint id="slug-hint">
                Unique per locale. Left blank, it is derived from the title.
              </FieldHint>
              <FieldError id="slug-error">{fieldErrors.slug}</FieldError>
            </div>

            <div>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={initial.description}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={describedBy(
                  "description-hint",
                  fieldErrors.description && "description-error"
                )}
              />
              <FieldHint id="description-hint">
                Optional. Shown alongside the document and searched by visitors.
              </FieldHint>
              <FieldError id="description-error">{fieldErrors.description}</FieldError>
            </div>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-32">
            <h2 className="mb-8 text-p2 font-medium text-neutral-1">File</h2>
            <p className="mb-20 text-p4 font-light text-neutral-5">
              PDF, Word, Excel or PowerPoint, up to 25MB.
            </p>

            {mode === "edit" && download && (
              <div className="mb-20 rounded-8 border border-neutral-10 bg-surface-2 p-16">
                <p className="mb-8 text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                  Currently attached
                </p>
                <div className="flex flex-wrap items-center gap-12">
                  <span className="inline-flex items-center rounded-4 bg-white px-8 py-4 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4">
                    {fileTypeLabel(download.file.mimeType)}
                  </span>
                  <span className="min-w-0 truncate text-p3 font-light text-neutral-1">
                    {download.file.fileName}
                  </span>
                  <span className="text-p4 font-light text-neutral-5">
                    {formatFileSize(download.file.fileSize)}
                  </span>
                  <a
                    href={`/api/downloads/${download.id}`}
                    className="text-p4 font-semibold uppercase tracking-[1px] text-primary underline transition-colors duration-200 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Download
                  </a>
                </div>
                <p className="mt-8 text-p4 font-light text-neutral-5">
                  Published documents only download while they are live.
                </p>
              </div>
            )}

            <FieldLabel htmlFor="file" required={mode === "create"}>
              {mode === "create" ? "Upload document" : "Replace document"}
            </FieldLabel>
            <input
              id="file"
              name="file"
              type="file"
              accept={ACCEPT}
              aria-invalid={Boolean(fieldErrors.file)}
              aria-describedby={describedBy("file-hint", fieldErrors.file && "file-error")}
              className="w-full rounded-8 border border-neutral-10 bg-white px-16 py-12 text-p3 text-neutral-1 outline-none transition-colors duration-200 file:mr-16 file:rounded-full file:border-0 file:bg-surface-1 file:px-16 file:py-8 file:text-p4 file:font-semibold file:uppercase file:tracking-[1px] file:text-neutral-4 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[invalid=true]:border-error"
            />
            <FieldHint id="file-hint">
              {mode === "create"
                ? "Required."
                : "Optional — leave empty to keep the current file."}
            </FieldHint>
            <FieldError id="file-error">{fieldErrors.file}</FieldError>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-32">
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-8">
              <h2 className="text-p2 font-medium text-neutral-1">Filters</h2>
              <Link
                href="/dashboard/downloads/filters"
                className="text-p4 font-semibold uppercase tracking-[1px] text-primary underline transition-colors duration-200 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Manage taxonomy
              </Link>
            </div>
            <p className="mb-24 text-p4 font-light text-neutral-5">
              Tick every facet this document belongs to. A document can sit in several groups at
              once.
            </p>

            {visibleGroups.length === 0 ? (
              <p className="rounded-8 border border-dashed border-neutral-10 p-24 text-center text-p4 font-light text-neutral-5">
                No filter groups exist for {locale === "EN" ? "English" : "French"} yet. Create them
                under Manage taxonomy.
              </p>
            ) : (
              <div className="space-y-24">
                {visibleGroups.map((group) => (
                  <fieldset key={group.id}>
                    <legend className="mb-12 text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                      {group.name}
                      {!group.isActive && (
                        <span className="ml-8 normal-case tracking-normal text-warning">
                          (inactive)
                        </span>
                      )}
                    </legend>
                    <div className="grid gap-8 sm:grid-cols-2">
                      {group.options
                        .filter((option) => option.isActive || selectedOptions.includes(option.id))
                        .map((option) => (
                          <label
                            key={option.id}
                            className="flex items-start gap-8 text-p3 font-light text-neutral-1"
                          >
                            <input
                              type="checkbox"
                              checked={selectedOptions.includes(option.id)}
                              onChange={() => toggleOption(option.id)}
                              className="mt-4 h-16 w-16 rounded-4 border-neutral-10 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            />
                            <span>
                              {option.name}
                              {!option.isActive && (
                                <span className="ml-4 text-p4 text-warning">(inactive)</span>
                              )}
                            </span>
                          </label>
                        ))}
                      {group.options.length === 0 && (
                        <p className="text-p4 font-light text-neutral-5">No options yet.</p>
                      )}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
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
              onChange={(e) => setStatus(e.target.value as DownloadFormValues["status"])}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
            <FieldHint id="status-hint">
              Only published documents are downloadable from the public site.
            </FieldHint>

            <div className="mt-24 flex flex-col gap-8">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving…" : status === "PUBLISHED" ? "Publish" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isPending}
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
                    Delete download
                  </button>
                ) : (
                  <div className="flex gap-8">
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      disabled={isPending}
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
                onChange={(e) => setLocale(e.target.value as DownloadFormValues["locale"])}
                aria-describedby="locale-hint"
              >
                <option value="EN">English</option>
                <option value="FR">French</option>
              </Select>
              <FieldHint id="locale-hint">
                Filter groups are locale-specific, so changing this swaps the facets above.
              </FieldHint>
            </div>

            <div className="mb-16">
              <FieldLabel htmlFor="displayOrder">Display order</FieldLabel>
              <TextInput
                id="displayOrder"
                name="displayOrder"
                type="number"
                min={0}
                max={9999}
                step={1}
                defaultValue={String(initial.displayOrder)}
                aria-invalid={Boolean(fieldErrors.displayOrder)}
                aria-describedby={describedBy(
                  "displayOrder-hint",
                  fieldErrors.displayOrder && "displayOrder-error"
                )}
              />
              <FieldHint id="displayOrder-hint">
                Lower sorts first in the curated &ldquo;most relevant&rdquo; order. 0&ndash;9999.
              </FieldHint>
              <FieldError id="displayOrder-error">{fieldErrors.displayOrder}</FieldError>
            </div>

            <div>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <TextInput
                id="tags"
                name="tags"
                defaultValue={initial.tags}
                placeholder="datasheet, hjt, bifacial"
                aria-invalid={Boolean(fieldErrors.tags)}
                aria-describedby={describedBy("tags-hint", fieldErrors.tags && "tags-error")}
              />
              <FieldHint id="tags-hint">
                Comma-separated free text, matched by site search. Up to 20.
              </FieldHint>
              <FieldError id="tags-error">{fieldErrors.tags}</FieldError>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
