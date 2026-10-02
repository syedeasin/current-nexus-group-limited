"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ExternalLink, Plus, RotateCcw, Trash2 } from "lucide-react";
import { resetPageContent, savePageContent } from "@/app/dashboard/pages/actions";
import FormAccordion, { useFormAccordion } from "@/components/dashboard/form-accordion";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import Select from "@/components/dashboard/form/select";
import FieldHint from "@/components/dashboard/form/field-hint";
import FieldError from "@/components/dashboard/form/field-error";
import ImageUpload from "@/components/dashboard/image-upload";
import { cn } from "@/lib/utils";
import type { CollectionDef } from "@/lib/page-content/registry";
import {
  collectionTemplate,
  fieldKind,
  isHiddenKey,
  isTree,
  joinPath,
  matchesPattern,
  type MessageNode,
  type MessageTree,
} from "@/lib/page-content/tree";

export interface EditorSection {
  id: string;
  label: string;
  description?: string;
  path: string;
  /** Current value (defaults + saved edits), excluded keys removed. */
  value: MessageTree;
  /** Shipped default, same shape — drives field kinds, hints and "reset field". */
  defaults: MessageTree;
}

interface PageContentEditorProps {
  pageKey: string;
  pageLabel: string;
  locale: string;
  localeLabel: string;
  viewHref: string | null;
  hasEdits: boolean;
  sections: EditorSection[];
  collections: CollectionDef[];
  iconKeys: string[];
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

const LABELS: Record<string, string> = {
  eyebrow: "Eyebrow (small label above the heading)",
  bannerEyebrow: "Banner eyebrow",
  heading: "Heading",
  bannerHeading: "Banner heading",
  subtext: "Supporting text",
  paragraph: "Paragraph",
  body: "Body text",
  cta: "Button text",
  ctaHref: "Button link",
  href: "Link",
  label: "Label",
  title: "Title",
  description: "Description",
  image: "Image",
  imageAlt: "Image description (alt text)",
  imagePosition: "Image focal point",
  bannerImage: "Banner image",
  bannerImagePosition: "Banner image focal point",
  backgroundImage: "Background image",
  ctaImage: "Background image",
  iconImage: "Icon (image)",
  icon: "Icon",
  logo: "Logo",
  photo: "Photo",
  avatar: "Photo",
  number: "Number",
  suffix: "Suffix (e.g. +)",
  width: "Logo width in px (at 32px tall)",
  featured: "Highlight this card (gold “Learn more” button)",
  primaryCta: "Primary button",
  secondaryCta: "Secondary button",
  viewAll: "“View all” button text",
  viewAllHref: "“View all” button link",
  learnMoreLabel: "“Learn more” button text",
  question: "Question",
  answer: "Answer",
  caption: "Caption",
  clientName: "Client name",
  clientWordmark: "Client name (shown next to the logo)",
  quote: "Quote",
  value: "Value",
  meta: "SEO",
};

function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** `{name}` placeholders and `<tag>`s the default uses — shown as a hint, enforced on save. */
function tokensIn(text: string): string[] {
  return Array.from(new Set(text.match(/\{[^{}]+\}|<\/?[a-zA-Z]+>/g) ?? []));
}

function lastKey(path: string) {
  return path.slice(path.lastIndexOf(".") + 1);
}

/* ------------------------------------------------------------------ */
/* Field rendering                                                     */
/* ------------------------------------------------------------------ */

interface Ctx {
  collections: CollectionDef[];
  iconKeys: string[];
  errors: Record<string, string>;
  /** Bumped by "reset" so image fields (which hold their own preview state) remount. */
  generation: number;
  onUploading: (delta: number) => void;
}

function collectionAt(path: string, collections: CollectionDef[]) {
  return collections.find((c) => matchesPattern(path, c.pattern));
}

function inputId(path: string) {
  return `pc-${path.replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

function LeafField({
  path,
  value,
  example,
  onChange,
  ctx,
}: {
  path: string;
  value: string;
  example: string;
  onChange: (v: string) => void;
  ctx: Ctx;
}) {
  const key = lastKey(path);
  const kind = fieldKind(key, example);
  const label = humanize(key);
  const id = inputId(path);
  const error = ctx.errors[path];
  const tokens = tokensIn(example);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const canReset = value !== example && example !== "";

  let hint: ReactNode = null;
  if (kind === "href") hint = "A page on this site like /contact, or a full https:// address.";
  else if (key.endsWith("imagePosition") || key.endsWith("ImagePosition"))
    hint = "Which part of the photo stays in view: horizontal then vertical, e.g. 50% 50% (centre), 80% 50% (right).";
  else if (kind === "number") hint = "Numbers only.";
  else if (tokens.length > 0)
    hint = (
      <>
        Keep {tokens.map((tk, i) => (
          <span key={tk}>
            {i > 0 && ", "}
            <code className="rounded-4 bg-surface-1 px-4">{tk}</code>
          </span>
        ))}{" "}
        exactly as written — {tokens.some((tk) => tk.startsWith("<")) ? "text between the tags is styled, " : ""}
        values in braces are filled in automatically.
      </>
    );

  const resetButton = canReset ? (
    <button
      type="button"
      onClick={() => onChange(example)}
      className="inline-flex items-center gap-4 text-p4 text-neutral-5 underline-offset-2 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <RotateCcw size={12} aria-hidden="true" /> Use default
      <span className="sr-only"> for {label}</span>
    </button>
  ) : null;

  if (kind === "image") {
    return (
      <div className="mb-20">
        <div className="mb-8 flex items-center justify-between gap-8">
          <span className="text-p4 font-medium text-neutral-4">{label}</span>
          {resetButton}
        </div>
        <ImageUpload
          key={`${path}:${ctx.generation}:${value === example ? "d" : "c"}`}
          name="__img"
          label={label}
          defaultUrl={value || null}
          onUrlChange={onChange}
          onUploadingChange={(u) => ctx.onUploading(u ? 1 : -1)}
        />
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    );
  }

  if (kind === "boolean") {
    return (
      <div className="mb-20 flex items-start gap-8">
        <input
          id={id}
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          className="mt-4 h-16 w-16 rounded-4 border-neutral-10 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <FieldLabel htmlFor={id} className="mb-0">
          {label}
        </FieldLabel>
      </div>
    );
  }

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="mb-20">
      <div className="flex items-center justify-between gap-8">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {resetButton}
      </div>
      {kind === "icon" ? (
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy}>
          {!ctx.iconKeys.includes(value) && <option value={value}>{value || "Choose…"}</option>}
          {ctx.iconKeys.map((icon) => (
            <option key={icon} value={icon}>
              {humanize(icon)}
            </option>
          ))}
        </Select>
      ) : kind === "longText" ? (
        <Textarea
          id={id}
          rows={Math.min(8, Math.max(3, Math.ceil(Math.max(value.length, example.length) / 90)))}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : (
        <TextInput
          id={id}
          value={value}
          inputMode={kind === "number" ? "decimal" : undefined}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      )}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

function NodeField({
  path,
  value,
  example,
  onChange,
  ctx,
  depth,
}: {
  path: string;
  value: MessageNode | undefined;
  example: MessageNode | undefined;
  onChange: (v: MessageNode) => void;
  ctx: Ctx;
  depth: number;
}) {
  const collection = collectionAt(path, ctx.collections);
  if (collection) {
    return (
      <CollectionField
        path={path}
        def={collection}
        value={isTree(value) ? value : {}}
        defaults={isTree(example) ? example : undefined}
        onChange={onChange}
        ctx={ctx}
        depth={depth}
      />
    );
  }

  if (isTree(value)) {
    const keys = Object.keys(value).filter((k) => !isHiddenKey(k));
    const body = keys.map((key) => (
      <NodeField
        key={key}
        path={joinPath(path, key)}
        value={value[key]}
        example={isTree(example) ? example[key] : undefined}
        onChange={(v) => onChange({ ...value, [key]: v })}
        ctx={ctx}
        depth={depth + 1}
      />
    ));
    if (depth === 0) return <>{body}</>;
    return (
      <fieldset className="mb-20 rounded-12 border border-neutral-10 p-16">
        <legend className="px-4 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">
          {humanize(lastKey(path))}
        </legend>
        {body}
      </fieldset>
    );
  }

  if (typeof value === "string") {
    return (
      <LeafField
        path={path}
        value={value}
        example={typeof example === "string" ? example : ""}
        onChange={onChange}
        ctx={ctx}
      />
    );
  }
  return null;
}

function newItemId() {
  return `item${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function CollectionField({
  path,
  def,
  value,
  defaults,
  onChange,
  ctx,
  depth,
}: {
  path: string;
  def: CollectionDef;
  value: MessageTree;
  defaults: MessageTree | undefined;
  onChange: (v: MessageTree) => void;
  ctx: Ctx;
  depth: number;
}) {
  const ids = Object.keys(value);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const firstDefault = defaults ? Object.values(defaults)[0] : undefined;
  const listError = ctx.errors[path];

  function rebuild(order: string[], patch?: Record<string, MessageNode>) {
    const next: MessageTree = {};
    for (const id of order) next[id] = patch?.[id] ?? value[id];
    onChange(next);
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= ids.length) return;
    const order = [...ids];
    const [it] = order.splice(from, 1);
    order.splice(to, 0, it);
    rebuild(order);
  }
  function remove(id: string) {
    rebuild(ids.filter((x) => x !== id));
  }
  function add() {
    const template = collectionTemplate(defaults, path) ?? collectionTemplate(value, path) ?? {};
    const id = newItemId();
    onChange({ ...value, [id]: template });
    setOpenIds((prev) => new Set(prev).add(id));
  }
  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const atMin = def.minItems !== undefined && ids.length <= def.minItems;
  const heading = depth > 1 ? humanize(lastKey(path)) : null;

  return (
    <div className="mb-20">
      {heading && <p className="mb-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{heading}</p>}
      <ol className="space-y-8">
        {ids.map((id, index) => {
          const item = value[id];
          const title = (def.titleKey && isTree(item) && typeof item[def.titleKey] === "string" ? (item[def.titleKey] as string) : "") || "Untitled";
          const isOpen = openIds.has(id);
          const itemPath = joinPath(path, id);
          const itemHasError = Object.keys(ctx.errors).some((k) => k === itemPath || k.startsWith(`${itemPath}.`));
          const panelId = `${inputId(itemPath)}-panel`;
          return (
            <li key={id} className={cn("rounded-12 border bg-surface-2", itemHasError ? "border-error" : "border-neutral-10")}>
              <div className="flex items-center gap-8 px-12 py-8">
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-expanded={isOpen || itemHasError}
                  aria-controls={panelId}
                  className="flex min-w-0 flex-1 items-center gap-8 rounded-8 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={cn("shrink-0 text-neutral-5 transition-transform duration-200", (isOpen || itemHasError) && "rotate-180")}
                  />
                  <span className="shrink-0 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">
                    {def.itemLabel} {index + 1}
                  </span>
                  <span className="truncate text-p4 text-neutral-1">{title}</span>
                </button>
                <button type="button" aria-label={`Move ${def.itemLabel.toLowerCase()} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, index - 1)} className="rounded-8 p-6 text-neutral-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40">
                  <ChevronUp size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-label={`Move ${def.itemLabel.toLowerCase()} ${index + 1} down`} disabled={index === ids.length - 1} onClick={() => move(index, index + 1)} className="rounded-8 p-6 text-neutral-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40">
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-label={`Remove ${def.itemLabel.toLowerCase()} ${index + 1}`} disabled={atMin} onClick={() => remove(id)} className="rounded-8 p-6 text-error hover:bg-error/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-error disabled:opacity-40">
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              {(isOpen || itemHasError) && (
                <div id={panelId} className="border-t border-neutral-10 bg-white px-16 pt-16">
                  <NodeField
                    path={itemPath}
                    value={item}
                    example={defaults && id in defaults ? defaults[id] : firstDefault}
                    onChange={(v) => rebuild(ids, { [id]: v })}
                    ctx={ctx}
                    depth={0}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={add}
        className="mt-12 inline-flex items-center gap-8 rounded-full border border-dashed border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Plus size={16} aria-hidden="true" /> Add {def.itemLabel.toLowerCase()}
      </button>
      <FieldError id={`${inputId(path)}-error`}>{listError}</FieldError>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export default function PageContentEditor({
  pageKey,
  pageLabel,
  locale,
  localeLabel,
  viewHref,
  hasEdits,
  sections,
  collections,
  iconKeys,
}: PageContentEditorProps) {
  const router = useRouter();
  const accordion = useFormAccordion(sections.length <= 3 ? sections.map((s) => s.id) : [sections[0]?.id ?? ""]);
  const [values, setValues] = useState<Record<string, MessageTree>>(() =>
    Object.fromEntries(sections.map((s) => [s.id, s.value]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const [generation, setGeneration] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dirtyRef = useRef(false);
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

  const ctx: Ctx = useMemo(
    () => ({
      collections,
      iconKeys,
      errors,
      generation,
      onUploading: (d: number) => setUploading((n) => Math.max(0, n + d)),
    }),
    [collections, iconKeys, errors, generation]
  );

  function setSection(id: string, value: MessageTree) {
    dirtyRef.current = true;
    setSuccess(null);
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function save() {
    setFormError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await savePageContent(pageKey, locale, JSON.stringify(values));
      if (!result.ok) {
        setFormError(result.error);
        const fieldErrors = result.fieldErrors ?? {};
        setErrors(fieldErrors);
        const firstBad = sections.find((s) =>
          Object.keys(fieldErrors).some((k) => k === s.path || k.startsWith(`${s.path}.`))
        );
        if (firstBad) accordion.openAndReveal(firstBad.id);
        else summaryRef.current?.focus();
        return;
      }
      dirtyRef.current = false;
      setErrors({});
      setSuccess(
        result.changed
          ? `Saved. The live ${localeLabel} page is updated.`
          : `Saved — this page now matches the default copy.`
      );
      router.refresh();
    });
  }

  function reset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    startTransition(async () => {
      const result = await resetPageContent(pageKey, locale);
      setConfirmReset(false);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      dirtyRef.current = false;
      setErrors({});
      setValues(Object.fromEntries(sections.map((s) => [s.id, s.defaults])));
      setGeneration((g) => g + 1);
      setSuccess(`All edits removed — the ${localeLabel} page shows the default copy again.`);
      router.refresh();
    });
  }

  const busy = isPending || uploading > 0;

  return (
    <div className="flex flex-col gap-24 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-16">
        {formError && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-16 border border-error bg-error/5 px-24 py-16 text-p3 text-error focus:outline-none">
            {formError}
          </div>
        )}
        {success && (
          <div role="status" className="rounded-16 border border-success bg-success/5 px-24 py-16 text-p3 text-success">
            {success}
          </div>
        )}

        {sections.map((section, index) => {
          const hasError = Object.keys(errors).some((k) => k === section.path || k.startsWith(`${section.path}.`));
          return (
            <FormAccordion
              key={section.id}
              id={section.id}
              step={String(index + 1).padStart(2, "0")}
              title={section.label}
              description={section.description}
              open={accordion.open.has(section.id)}
              onToggle={() => accordion.toggle(section.id)}
              hasError={hasError}
              registerRef={accordion.registerRef}
            >
              <NodeField
                path={section.path}
                value={values[section.id]}
                example={section.defaults}
                onChange={(v) => setSection(section.id, v as MessageTree)}
                ctx={ctx}
                depth={0}
              />
            </FormAccordion>
          );
        })}
      </div>

      <aside className="w-full shrink-0 space-y-16 lg:sticky lg:top-0 lg:w-320">
        <div className="rounded-16 border border-neutral-10 bg-white p-24">
          <p className="text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">{localeLabel}</p>
          <p className="mt-4 text-p2 font-medium text-neutral-1">{pageLabel}</p>
          <p className="mt-8 text-p4 text-neutral-5">
            {hasEdits ? "This page has saved edits." : "This page shows the default copy."} Changes go live as soon as you save.
          </p>
          <div className="mt-20 flex flex-col gap-8">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving…" : uploading > 0 ? "Uploading…" : "Save changes"}
            </button>
            {viewHref && (
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-8 rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                View page <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
          {hasEdits && (
            <div className="mt-20 border-t border-neutral-10 pt-20">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="w-full rounded-full border border-error px-24 py-12 text-p4 font-semibold uppercase tracking-[1px] text-error transition-colors duration-200 hover:bg-error/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:opacity-60"
                >
                  Reset page to default
                </button>
              ) : (
                <div>
                  <p className="mb-8 text-p4 text-neutral-4">Remove every saved edit to this page ({localeLabel})?</p>
                  <div className="flex gap-8">
                    <button type="button" onClick={reset} disabled={busy} className="flex-1 rounded-full bg-error px-16 py-12 text-p4 font-semibold uppercase tracking-[1px] text-white hover:bg-error/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:opacity-60">
                      Reset
                    </button>
                    <button type="button" onClick={() => setConfirmReset(false)} className="flex-1 rounded-full border border-neutral-10 px-16 py-12 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
