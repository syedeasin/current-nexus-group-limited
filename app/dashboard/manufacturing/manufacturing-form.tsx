"use client";

import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { createManufacturingPage, updateManufacturingPage, deleteManufacturingPage, type ActionResult, type SimpleActionResult } from "./actions";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import Select from "@/components/dashboard/form/select";
import FieldError from "@/components/dashboard/form/field-error";
import FieldHint from "@/components/dashboard/form/field-hint";
import ImageUpload from "@/components/dashboard/image-upload";
import AltField from "@/components/dashboard/alt-field";
import FormAccordion, { useFormAccordion, sectionsWithErrors } from "@/components/dashboard/form-accordion";
import type { ManufacturingContent, ManufacturingSeo } from "@/lib/manufacturing/types";

export type ManufacturingInitial = {
  id: string;
  title: string;
  slug: string;
  locale: "EN" | "FR";
  category: "SOLAR_PANELS" | "BESS";
  status: "DRAFT" | "PUBLISHED";
  menuLabel: string;
  menuOrder: number;
  showInMegaMenu: boolean;
  isProtectedTemplate: boolean;
  content: ManufacturingContent;
  seo: ManufacturingSeo;
};

const ICON_HINT = "Icon key, e.g. layer, cloud-sun-rain, chart-increase, apartment, menu-square, snow (features); layers, zap, building (case study).";

/** Accordion section ids, in on-page order — also the auto-open-on-error search order. */
const SECTION_ORDER = [
  "general",
  "hero",
  "introduction",
  "competitiveAdvantage",
  "technicalSpecifications",
  "productVariants",
  "manufacturingReliability",
  "manufacturingWorkflow",
  "caseStudy",
  "faq",
  "relatedProducts",
  "documentsCta",
] as const;

/** Which dotted field-error path prefixes belong to which section. */
const SECTION_ERROR_PREFIXES: Record<(typeof SECTION_ORDER)[number], string[]> = {
  general: ["title", "slug"],
  hero: ["content.hero"],
  introduction: ["content.introduction"],
  competitiveAdvantage: ["content.competitiveAdvantage"],
  technicalSpecifications: ["content.technicalSpecifications"],
  productVariants: ["content.productVariants"],
  manufacturingReliability: ["content.manufacturingReliability"],
  manufacturingWorkflow: ["content.manufacturingWorkflow"],
  caseStudy: ["content.caseStudy"],
  faq: ["content.faq"],
  relatedProducts: ["content.relatedProducts"],
  documentsCta: ["content.documentsCta"],
};

function makeClientSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}
function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [it] = copy.splice(from, 1);
  copy.splice(to, 0, it);
  return copy;
}

/* ---------- primitives ---------- */

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-16 w-16 rounded-4 border-neutral-10 text-primary" />
      {on ? "Included" : "Hidden"}
    </label>
  );
}
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="mb-16">
      <FieldLabel>{label}</FieldLabel>
      {children}
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
function Item({ i, count, onMove, onRemove, children }: { i: number; count: number; onMove: (f: number, t: number) => void; onRemove: (i: number) => void; children: ReactNode }) {
  return (
    <div className="rounded-12 border border-neutral-10 bg-surface-2 p-16">
      <div className="mb-12 flex items-center justify-between">
        <span className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">#{i + 1}</span>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Up" disabled={i === 0} onClick={() => onMove(i, i - 1)} className="rounded-8 p-6 text-neutral-4 hover:text-primary disabled:opacity-40"><ChevronUp size={16} /></button>
          <button type="button" aria-label="Down" disabled={i === count - 1} onClick={() => onMove(i, i + 1)} className="rounded-8 p-6 text-neutral-4 hover:text-primary disabled:opacity-40"><ChevronDown size={16} /></button>
          <button type="button" aria-label="Remove" onClick={() => onRemove(i)} className="rounded-8 p-6 text-error hover:bg-error/5"><Trash2 size={16} /></button>
        </div>
      </div>
      {children}
    </div>
  );
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-12 inline-flex items-center gap-8 rounded-full border border-dashed border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 hover:border-primary hover:text-primary">
      <Plus size={16} /> {label}
    </button>
  );
}

/** Reusable object-array repeater. */
function Repeater<T>({ items, set, empty, add, render }: {
  items: T[]; set: (next: T[]) => void; empty: T; add: string; render: (item: T, i: number, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="space-y-12">
      {items.map((item, i) => (
        <Item key={i} i={i} count={items.length} onMove={(f, t) => set(move(items, f, t))} onRemove={(idx) => set(items.filter((_, j) => j !== idx))}>
          {render(item, i, (patch) => set(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
        </Item>
      ))}
      <AddBtn label={add} onClick={() => set([...items, empty])} />
    </div>
  );
}

/** String-array repeater (paragraphs, bullet items, steps). */
function StringList({ items, set, add, textarea }: { items: string[]; set: (next: string[]) => void; add: string; textarea?: boolean }) {
  return (
    <div className="space-y-8">
      {items.map((v, i) => (
        <div key={i} className="flex items-start gap-8">
          {textarea ? (
            <Textarea rows={2} value={v} onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))} />
          ) : (
            <TextInput value={v} onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))} />
          )}
          <button type="button" aria-label="Remove" onClick={() => set(items.filter((_, j) => j !== i))} className="mt-8 rounded-8 p-8 text-error hover:bg-error/5"><Trash2 size={16} /></button>
        </div>
      ))}
      <AddBtn label={add} onClick={() => set([...items, ""])} />
    </div>
  );
}

function ImageField({ label, url, onChange, onUploading }: { label: string; url: string; onChange: (u: string) => void; onUploading: (d: number) => void }) {
  return (
    <ImageUpload name="__img" label={label} defaultUrl={url || null} onUploadingChange={(u) => onUploading(u ? 1 : -1)} onUrlChange={onChange} />
  );
}

/* ---------- defaults ---------- */

const EMPTY_CONTENT: ManufacturingContent = {
  slug: "", category: "solar-panels",
  meta: { title: "", description: "" },
  hero: { eyebrow: "", heading: "", body: "", primaryCta: { label: "", href: "" }, secondaryCta: { label: "", href: "" }, stats: [], backgroundImage: "", backgroundImageMobile: "", productImage: "" },
};

/* ---------- form ---------- */

export default function ManufacturingForm({ mode, page }: { mode: "create" | "edit"; page?: ManufacturingInitial }) {
  const router = useRouter();
  const accordion = useFormAccordion(["general"]);

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [locale, setLocale] = useState(page?.locale ?? "EN");
  const [category, setCategory] = useState(page?.category ?? "SOLAR_PANELS");
  const [status, setStatus] = useState(page?.status ?? "DRAFT");
  const [menuLabel, setMenuLabel] = useState(page?.menuLabel ?? "");
  const [menuOrder, setMenuOrder] = useState(String(page?.menuOrder ?? 0));
  const [showInMenu, setShowInMenu] = useState(page?.showInMegaMenu ?? true);

  const [content, setContent] = useState<ManufacturingContent>(page?.content ?? EMPTY_CONTENT);
  const [seo, setSeo] = useState<ManufacturingSeo>(page?.seo ?? {});

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const onUploading = (d: number) => setUploading((n) => Math.max(0, n + d));

  // helpers to patch content immutably
  const C = content;
  function patch(p: Partial<ManufacturingContent>) {
    setContent((c) => ({ ...c, ...p }));
  }
  // toggle an optional section on/off
  function toggleSection<K extends keyof ManufacturingContent>(key: K, defaultVal: NonNullable<ManufacturingContent[K]>) {
    setContent((c) => {
      const next = { ...c };
      if (c[key]) delete next[key];
      else next[key] = defaultVal;
      return next;
    });
  }

  function err(key: string) {
    return fieldErrors[key];
  }

  const erroredSections = useMemo(
    () => new Set(sectionsWithErrors(fieldErrors, [...SECTION_ORDER], SECTION_ERROR_PREFIXES)),
    [fieldErrors]
  );

  // Completion heuristics: a section shows a check once its own required
  // fields are filled in. Optional sections that are switched off never show
  // either state — "not included" isn't an error.
  const sectionComplete: Record<(typeof SECTION_ORDER)[number], boolean> = {
    general: Boolean(title.trim()),
    hero: Boolean(C.hero.heading.trim() && C.hero.backgroundImage.trim()),
    introduction: Boolean(C.introduction && C.introduction.heading.trim() && C.introduction.image.trim()),
    competitiveAdvantage: Boolean(C.competitiveAdvantage && C.competitiveAdvantage.items.length > 0),
    technicalSpecifications: Boolean(C.technicalSpecifications && (C.technicalSpecifications.tableA.length > 0 || C.technicalSpecifications.tableB.length > 0)),
    productVariants: Boolean(C.productVariants && C.productVariants.variants.length > 0),
    manufacturingReliability: Boolean(C.manufacturingReliability && C.manufacturingReliability.intro.trim() && C.manufacturingReliability.image.trim()),
    manufacturingWorkflow: Boolean(C.manufacturingWorkflow && C.manufacturingWorkflow.steps.length > 0),
    caseStudy: Boolean(C.caseStudy && C.caseStudy.title.trim() && C.caseStudy.body.trim()),
    faq: Boolean(C.faq && C.faq.items.length > 0),
    relatedProducts: Boolean(C.relatedProducts && C.relatedProducts.items.length > 0),
    documentsCta: Boolean(C.documentsCta && C.documentsCta.heading.trim() && C.documentsCta.buttonLabel.trim()),
  };

  function submit(overrideStatus?: "DRAFT" | "PUBLISHED") {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("locale", locale);
    fd.set("category", category);
    fd.set("status", overrideStatus ?? status);
    fd.set("menuLabel", menuLabel);
    fd.set("menuOrder", menuOrder);
    if (showInMenu) fd.set("showInMegaMenu", "on");
    fd.set("content", JSON.stringify(content));
    fd.set("seo", JSON.stringify(seo));

    startTransition(async () => {
      let result: ActionResult;
      try {
        result = mode === "create" ? await createManufacturingPage(fd) : await updateManufacturingPage(page!.id, fd);
      } catch (error) {
        console.error("[manufacturing-form] save failed", error);
        setFormError("Something went wrong while saving. Please try again.");
        summaryRef.current?.focus();
        return;
      }
      if (!result.ok) {
        setFormError(result.error);
        const errors = result.fieldErrors ?? {};
        setFieldErrors(errors);
        const firstInvalid = sectionsWithErrors(errors, [...SECTION_ORDER], SECTION_ERROR_PREFIXES)[0];
        if (firstInvalid) accordion.openAndReveal(firstInvalid);
        else summaryRef.current?.focus();
        return;
      }
      setFieldErrors({});
      setFormError(null);
      if (mode === "create") {
        router.push(`/dashboard/manufacturing/${result.id}/edit`);
        router.refresh();
      } else {
        setSuccess("Saved.");
        router.refresh();
        setTimeout(() => setSuccess(null), 4000);
      }
    });
  }

  function onDelete() {
    if (!confirmDelete) return setConfirmDelete(true);
    startTransition(async () => {
      let result: SimpleActionResult;
      try {
        result = await deleteManufacturingPage(page!.id);
      } catch (error) {
        console.error("[manufacturing-form] delete failed", error);
        setFormError("Something went wrong while deleting. Please try again.");
        setConfirmDelete(false);
        return;
      }
      if (result.ok) {
        router.push("/dashboard/manufacturing");
        router.refresh();
      } else {
        setFormError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  const busy = isPending || uploading > 0;
  const liveHref = useMemo(() => {
    const base = category === "BESS" ? "/manufacturing/bess" : "/manufacturing/solar-panels";
    return `/en${base}/${slug}`;
  }, [category, slug]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); setFormError(null); submit(); }}>
      {formError && <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-24 rounded-16 border border-error bg-error/5 px-24 py-16 text-p3 text-error focus:outline-none">{formError}</div>}
      {success && <div role="status" className="mb-24 rounded-16 border border-success bg-success/5 px-24 py-16 text-p3 text-success">{success}</div>}

      <div className="flex flex-col gap-24 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-16">
          {/* Basic */}
          <FormAccordion id="general" step="01" title="General information" description="Basic page and URL settings"
            open={accordion.open.has("general")} onToggle={() => accordion.toggle("general")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("general")} isComplete={sectionComplete.general}>
            <Field label="Page title">
              <TextInput value={title} onChange={(e) => { setTitle(e.target.value); if (mode === "create" && !slugTouched) setSlug(makeClientSlug(e.target.value)); }} aria-invalid={Boolean(err("title"))} />
              <FieldError>{err("title")}</FieldError>
            </Field>
            <Field label="Slug" hint="Unique per category & locale. Left blank, derived from the title.">
              <TextInput value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} aria-invalid={Boolean(err("slug"))} />
              <FieldError>{err("slug")}</FieldError>
            </Field>
          </FormAccordion>

          {/* Hero */}
          <FormAccordion id="hero" step="02" title="Hero section" description="Background, title, description and CTA"
            open={accordion.open.has("hero")} onToggle={() => accordion.toggle("hero")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("hero")} isComplete={sectionComplete.hero}>
            <Field label="Background image (desktop)"><ImageField label="Hero background" url={C.hero.backgroundImage} onChange={(u) => patch({ hero: { ...C.hero, backgroundImage: u } })} onUploading={onUploading} /><FieldError>{err("content.hero.backgroundImage")}</FieldError></Field>
            <Field label="Background image (mobile)"><ImageField label="Hero mobile" url={C.hero.backgroundImageMobile} onChange={(u) => patch({ hero: { ...C.hero, backgroundImageMobile: u } })} onUploading={onUploading} /></Field>
            <Field label="Product image">
              <ImageField label="Product shot" url={C.hero.productImage} onChange={(u) => patch({ hero: { ...C.hero, productImage: u } })} onUploading={onUploading} />
              <AltField url={C.hero.productImage} value={C.hero.productImageAlt ?? ""} onChange={(v) => patch({ hero: { ...C.hero, productImageAlt: v } })} />
            </Field>
            <Field label="Eyebrow"><TextInput value={C.hero.eyebrow} onChange={(e) => patch({ hero: { ...C.hero, eyebrow: e.target.value } })} /><FieldError>{err("content.hero.eyebrow")}</FieldError></Field>
            <Field label="Title"><TextInput value={C.hero.heading} onChange={(e) => patch({ hero: { ...C.hero, heading: e.target.value } })} /><FieldError>{err("content.hero.heading")}</FieldError></Field>
            <Field label="Body"><Textarea rows={3} value={C.hero.body} onChange={(e) => patch({ hero: { ...C.hero, body: e.target.value } })} /></Field>
            <div className="grid gap-12 sm:grid-cols-2">
              <Field label="Primary button label"><TextInput value={C.hero.primaryCta.label} onChange={(e) => patch({ hero: { ...C.hero, primaryCta: { ...C.hero.primaryCta, label: e.target.value } } })} /></Field>
              <Field label="Primary button link"><TextInput value={C.hero.primaryCta.href} onChange={(e) => patch({ hero: { ...C.hero, primaryCta: { ...C.hero.primaryCta, href: e.target.value } } })} /></Field>
              <Field label="Secondary button label"><TextInput value={C.hero.secondaryCta.label} onChange={(e) => patch({ hero: { ...C.hero, secondaryCta: { ...C.hero.secondaryCta, label: e.target.value } } })} /></Field>
              <Field label="Secondary button link"><TextInput value={C.hero.secondaryCta.href} onChange={(e) => patch({ hero: { ...C.hero, secondaryCta: { ...C.hero.secondaryCta, href: e.target.value } } })} /></Field>
            </div>
            <FieldLabel>Hero stats</FieldLabel>
            <div className="mt-8">
              <Repeater items={C.hero.stats} set={(v) => patch({ hero: { ...C.hero, stats: v } })} empty={{ value: "", label: "" }} add="Add stat"
                render={(s, i, u) => (<div className="grid gap-12 sm:grid-cols-2"><TextInput placeholder="Value" value={s.value} onChange={(e) => u({ value: e.target.value })} /><TextInput placeholder="Label" value={s.label} onChange={(e) => u({ label: e.target.value })} /></div>)} />
            </div>
          </FormAccordion>

          {/* Introduction */}
          <FormAccordion id="introduction" step="03" title="Introduction" description="Optional intro copy and image"
            open={accordion.open.has("introduction")} onToggle={() => accordion.toggle("introduction")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("introduction")} isComplete={sectionComplete.introduction}
            headerExtra={<Toggle on={Boolean(C.introduction)} set={() => toggleSection("introduction", { eyebrow: "", heading: "", paragraphs: [], image: "" })} />}>
            {C.introduction && (<>
              <Field label="Eyebrow"><TextInput value={C.introduction.eyebrow} onChange={(e) => patch({ introduction: { ...C.introduction!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.introduction.heading} onChange={(e) => patch({ introduction: { ...C.introduction!, heading: e.target.value } })} /></Field>
              <Field label="Image">
                <ImageField label="Intro image" url={C.introduction.image} onChange={(u) => patch({ introduction: { ...C.introduction!, image: u } })} onUploading={onUploading} />
                <AltField url={C.introduction.image} value={C.introduction.imageAlt ?? ""} onChange={(v) => patch({ introduction: { ...C.introduction!, imageAlt: v } })} />
              </Field>
              <FieldLabel>Paragraphs</FieldLabel>
              <div className="mt-8"><StringList textarea items={C.introduction.paragraphs} set={(v) => patch({ introduction: { ...C.introduction!, paragraphs: v } })} add="Add paragraph" /></div>
            </>)}
          </FormAccordion>

          {/* Competitive advantage (features) */}
          <FormAccordion id="competitiveAdvantage" step="04" title="Competitive advantage (features)" description="Optional feature-card grid"
            open={accordion.open.has("competitiveAdvantage")} onToggle={() => accordion.toggle("competitiveAdvantage")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("competitiveAdvantage")} isComplete={sectionComplete.competitiveAdvantage}
            headerExtra={<Toggle on={Boolean(C.competitiveAdvantage)} set={() => toggleSection("competitiveAdvantage", { eyebrow: "", heading: "", items: [] })} />}>
            {C.competitiveAdvantage && (<>
              <Field label="Eyebrow"><TextInput value={C.competitiveAdvantage.eyebrow} onChange={(e) => patch({ competitiveAdvantage: { ...C.competitiveAdvantage!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.competitiveAdvantage.heading} onChange={(e) => patch({ competitiveAdvantage: { ...C.competitiveAdvantage!, heading: e.target.value } })} /></Field>
              <FieldLabel>Feature cards</FieldLabel>
              <div className="mt-8"><Repeater items={C.competitiveAdvantage.items} set={(v) => patch({ competitiveAdvantage: { ...C.competitiveAdvantage!, items: v } })} empty={{ icon: "", title: "", body: "" }} add="Add feature"
                render={(f, i, u) => (<><TextInput className="mb-8" placeholder="Icon key" value={f.icon} onChange={(e) => u({ icon: e.target.value })} /><TextInput className="mb-8" placeholder="Title" value={f.title} onChange={(e) => u({ title: e.target.value })} /><Textarea rows={2} placeholder="Body" value={f.body} onChange={(e) => u({ body: e.target.value })} /></>)} /></div>
              <FieldHint>{ICON_HINT}</FieldHint>
            </>)}
          </FormAccordion>

          {/* Technical specifications */}
          <FormAccordion id="technicalSpecifications" step="05" title="Technical specifications" description="Optional spec tables"
            open={accordion.open.has("technicalSpecifications")} onToggle={() => accordion.toggle("technicalSpecifications")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("technicalSpecifications")} isComplete={sectionComplete.technicalSpecifications}
            headerExtra={<Toggle on={Boolean(C.technicalSpecifications)} set={() => toggleSection("technicalSpecifications", { eyebrow: "", heading: "", tableA: [], tableB: [] })} />}>
            {C.technicalSpecifications && (<>
              <Field label="Eyebrow"><TextInput value={C.technicalSpecifications.eyebrow} onChange={(e) => patch({ technicalSpecifications: { ...C.technicalSpecifications!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.technicalSpecifications.heading} onChange={(e) => patch({ technicalSpecifications: { ...C.technicalSpecifications!, heading: e.target.value } })} /></Field>
              <FieldLabel>Table A — spec rows</FieldLabel>
              <div className="mt-8 mb-16"><Repeater items={C.technicalSpecifications.tableA} set={(v) => patch({ technicalSpecifications: { ...C.technicalSpecifications!, tableA: v } })} empty={{ label: "", value: "" }} add="Add row"
                render={(r, i, u) => (<div className="grid gap-12 sm:grid-cols-2"><TextInput placeholder="Label" value={r.label} onChange={(e) => u({ label: e.target.value })} /><TextInput placeholder="Value" value={r.value} onChange={(e) => u({ value: e.target.value })} /></div>)} /></div>
              <FieldLabel>Table B — electrical rows</FieldLabel>
              <div className="mt-8"><Repeater items={C.technicalSpecifications.tableB} set={(v) => patch({ technicalSpecifications: { ...C.technicalSpecifications!, tableB: v } })} empty={{ model: "", pmax: "", vmp: "", imp: "", voc: "", isc: "", maxVoltage: "", fuse: "" }} add="Add electrical row"
                render={(r, i, u) => (<div className="grid gap-8 sm:grid-cols-2">
                  <TextInput placeholder="Model" value={r.model} onChange={(e) => u({ model: e.target.value })} />
                  <TextInput placeholder="Pmax" value={r.pmax} onChange={(e) => u({ pmax: e.target.value })} />
                  <TextInput placeholder="Vmp" value={r.vmp} onChange={(e) => u({ vmp: e.target.value })} />
                  <TextInput placeholder="Imp" value={r.imp} onChange={(e) => u({ imp: e.target.value })} />
                  <TextInput placeholder="Voc" value={r.voc} onChange={(e) => u({ voc: e.target.value })} />
                  <TextInput placeholder="Isc" value={r.isc} onChange={(e) => u({ isc: e.target.value })} />
                  <TextInput placeholder="Max voltage" value={r.maxVoltage} onChange={(e) => u({ maxVoltage: e.target.value })} />
                  <TextInput placeholder="Fuse" value={r.fuse} onChange={(e) => u({ fuse: e.target.value })} />
                </div>)} /></div>
            </>)}
          </FormAccordion>

          {/* Product variants */}
          <FormAccordion id="productVariants" step="06" title="Product variants" description="Optional variant cards with their own specs"
            open={accordion.open.has("productVariants")} onToggle={() => accordion.toggle("productVariants")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("productVariants")} isComplete={sectionComplete.productVariants}
            headerExtra={<Toggle on={Boolean(C.productVariants)} set={() => toggleSection("productVariants", { eyebrow: "", heading: "", variants: [] })} />}>
            {C.productVariants && (<>
              <Field label="Eyebrow"><TextInput value={C.productVariants.eyebrow} onChange={(e) => patch({ productVariants: { ...C.productVariants!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.productVariants.heading} onChange={(e) => patch({ productVariants: { ...C.productVariants!, heading: e.target.value } })} /></Field>
              <FieldLabel>Variants</FieldLabel>
              <div className="mt-8"><Repeater items={C.productVariants.variants} set={(v) => patch({ productVariants: { ...C.productVariants!, variants: v } })} empty={{ eyebrowPair: ["", ""], name: "", body: "", specs: [], image: "", buttonLabel: "", buttonHref: "" }} add="Add variant"
                render={(v, i, u) => (<>
                  <div className="mb-8 grid gap-8 sm:grid-cols-2"><TextInput placeholder="Eyebrow left" value={v.eyebrowPair[0]} onChange={(e) => u({ eyebrowPair: [e.target.value, v.eyebrowPair[1]] })} /><TextInput placeholder="Eyebrow right" value={v.eyebrowPair[1]} onChange={(e) => u({ eyebrowPair: [v.eyebrowPair[0], e.target.value] })} /></div>
                  <TextInput className="mb-8" placeholder="Name" value={v.name} onChange={(e) => u({ name: e.target.value })} />
                  <Textarea className="mb-8" rows={2} placeholder="Body" value={v.body} onChange={(e) => u({ body: e.target.value })} />
                  <div className="mb-8">
                    <ImageField label="Variant image" url={v.image} onChange={(url) => u({ image: url })} onUploading={onUploading} />
                    <AltField url={v.image} value={v.imageAlt ?? ""} onChange={(alt) => u({ imageAlt: alt })} />
                  </div>
                  <div className="mb-8 grid gap-8 sm:grid-cols-2"><TextInput placeholder="Button label" value={v.buttonLabel} onChange={(e) => u({ buttonLabel: e.target.value })} /><TextInput placeholder="Button link" value={v.buttonHref} onChange={(e) => u({ buttonHref: e.target.value })} /></div>
                  <FieldLabel>Specs</FieldLabel>
                  <div className="mt-8"><Repeater items={v.specs} set={(sp) => u({ specs: sp })} empty={{ label: "", value: "" }} add="Add spec"
                    render={(s, si, su) => (<div className="grid gap-8 sm:grid-cols-2"><TextInput placeholder="Label" value={s.label} onChange={(e) => su({ label: e.target.value })} /><TextInput placeholder="Value" value={s.value} onChange={(e) => su({ value: e.target.value })} /></div>)} /></div>
                </>)} /></div>
            </>)}
          </FormAccordion>

          {/* Manufacturing reliability */}
          <FormAccordion id="manufacturingReliability" step="07" title="Manufacturing reliability" description="Optional reliability copy and image"
            open={accordion.open.has("manufacturingReliability")} onToggle={() => accordion.toggle("manufacturingReliability")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("manufacturingReliability")} isComplete={sectionComplete.manufacturingReliability}
            headerExtra={<Toggle on={Boolean(C.manufacturingReliability)} set={() => toggleSection("manufacturingReliability", { eyebrow: "", heading: "", intro: "", items: [], image: "" })} />}>
            {C.manufacturingReliability && (<>
              <Field label="Eyebrow"><TextInput value={C.manufacturingReliability.eyebrow} onChange={(e) => patch({ manufacturingReliability: { ...C.manufacturingReliability!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.manufacturingReliability.heading} onChange={(e) => patch({ manufacturingReliability: { ...C.manufacturingReliability!, heading: e.target.value } })} /></Field>
              <Field label="Intro"><Textarea rows={2} value={C.manufacturingReliability.intro} onChange={(e) => patch({ manufacturingReliability: { ...C.manufacturingReliability!, intro: e.target.value } })} /></Field>
              <Field label="Image">
                <ImageField label="Reliability image" url={C.manufacturingReliability.image} onChange={(u) => patch({ manufacturingReliability: { ...C.manufacturingReliability!, image: u } })} onUploading={onUploading} />
                <AltField url={C.manufacturingReliability.image} value={C.manufacturingReliability.imageAlt ?? ""} onChange={(v) => patch({ manufacturingReliability: { ...C.manufacturingReliability!, imageAlt: v } })} />
              </Field>
              <FieldLabel>Bullet items</FieldLabel>
              <div className="mt-8"><StringList items={C.manufacturingReliability.items} set={(v) => patch({ manufacturingReliability: { ...C.manufacturingReliability!, items: v } })} add="Add item" /></div>
            </>)}
          </FormAccordion>

          {/* Manufacturing workflow */}
          <FormAccordion id="manufacturingWorkflow" step="08" title="Manufacturing workflow" description="Optional numbered process steps"
            open={accordion.open.has("manufacturingWorkflow")} onToggle={() => accordion.toggle("manufacturingWorkflow")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("manufacturingWorkflow")} isComplete={sectionComplete.manufacturingWorkflow}
            headerExtra={<Toggle on={Boolean(C.manufacturingWorkflow)} set={() => toggleSection("manufacturingWorkflow", { eyebrow: "", heading: "", intro: "", steps: [] })} />}>
            {C.manufacturingWorkflow && (<>
              <Field label="Eyebrow"><TextInput value={C.manufacturingWorkflow.eyebrow} onChange={(e) => patch({ manufacturingWorkflow: { ...C.manufacturingWorkflow!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.manufacturingWorkflow.heading} onChange={(e) => patch({ manufacturingWorkflow: { ...C.manufacturingWorkflow!, heading: e.target.value } })} /></Field>
              <Field label="Intro"><Textarea rows={2} value={C.manufacturingWorkflow.intro} onChange={(e) => patch({ manufacturingWorkflow: { ...C.manufacturingWorkflow!, intro: e.target.value } })} /></Field>
              <FieldLabel>Steps</FieldLabel>
              <div className="mt-8"><Repeater items={C.manufacturingWorkflow.steps} set={(v) => patch({ manufacturingWorkflow: { ...C.manufacturingWorkflow!, steps: v } })} empty={{ label: "", title: "", body: "" }} add="Add step"
                render={(s, i, u) => (<><TextInput className="mb-8" placeholder="Label (e.g. 01)" value={s.label} onChange={(e) => u({ label: e.target.value })} /><TextInput className="mb-8" placeholder="Title" value={s.title} onChange={(e) => u({ title: e.target.value })} /><Textarea rows={2} placeholder="Body" value={s.body} onChange={(e) => u({ body: e.target.value })} /></>)} /></div>
            </>)}
          </FormAccordion>

          {/* Case study */}
          <FormAccordion id="caseStudy" step="09" title="Case study" description="Optional client success story"
            open={accordion.open.has("caseStudy")} onToggle={() => accordion.toggle("caseStudy")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("caseStudy")} isComplete={sectionComplete.caseStudy}
            headerExtra={<Toggle on={Boolean(C.caseStudy)} set={() => toggleSection("caseStudy", { eyebrow: "", heading: "", backgroundImage: "", title: "", body: "", specs: [] })} />}>
            {C.caseStudy && (<>
              <Field label="Eyebrow"><TextInput value={C.caseStudy.eyebrow} onChange={(e) => patch({ caseStudy: { ...C.caseStudy!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.caseStudy.heading} onChange={(e) => patch({ caseStudy: { ...C.caseStudy!, heading: e.target.value } })} /></Field>
              <Field label="Background image">
                <ImageField label="Case study bg" url={C.caseStudy.backgroundImage} onChange={(u) => patch({ caseStudy: { ...C.caseStudy!, backgroundImage: u } })} onUploading={onUploading} />
                <AltField url={C.caseStudy.backgroundImage} value={C.caseStudy.backgroundImageAlt ?? ""} onChange={(v) => patch({ caseStudy: { ...C.caseStudy!, backgroundImageAlt: v } })} />
              </Field>
              <Field label="Title"><TextInput value={C.caseStudy.title} onChange={(e) => patch({ caseStudy: { ...C.caseStudy!, title: e.target.value } })} /></Field>
              <Field label="Body"><Textarea rows={4} value={C.caseStudy.body} onChange={(e) => patch({ caseStudy: { ...C.caseStudy!, body: e.target.value } })} /></Field>
              <FieldLabel>Specs</FieldLabel>
              <div className="mt-8"><Repeater items={C.caseStudy.specs} set={(v) => patch({ caseStudy: { ...C.caseStudy!, specs: v } })} empty={{ icon: "", text: "" }} add="Add spec"
                render={(s, i, u) => (<div className="grid gap-8 sm:grid-cols-[160px_1fr]"><TextInput placeholder="Icon key" value={s.icon} onChange={(e) => u({ icon: e.target.value })} /><TextInput placeholder="Text" value={s.text} onChange={(e) => u({ text: e.target.value })} /></div>)} /></div>
              <FieldHint>{ICON_HINT}</FieldHint>
            </>)}
          </FormAccordion>

          {/* FAQ */}
          <FormAccordion id="faq" step="10" title="FAQ" description="Optional questions and contact card"
            open={accordion.open.has("faq")} onToggle={() => accordion.toggle("faq")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("faq")} isComplete={sectionComplete.faq}
            headerExtra={<Toggle on={Boolean(C.faq)} set={() => toggleSection("faq", { eyebrow: "", heading: "", items: [], defaultOpenId: "", needHelpLabel: "", contact: { avatarSrc: "", name: "", role: "", message: "", ctaLabel: "", ctaHref: "" } })} />}>
            {C.faq && (<>
              <Field label="Eyebrow"><TextInput value={C.faq.eyebrow} onChange={(e) => patch({ faq: { ...C.faq!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.faq.heading} onChange={(e) => patch({ faq: { ...C.faq!, heading: e.target.value } })} /></Field>
              <FieldLabel>Questions</FieldLabel>
              <div className="mt-8"><Repeater items={C.faq.items} set={(v) => patch({ faq: { ...C.faq!, items: v } })} empty={{ id: "", question: "", answer: "" }} add="Add question"
                render={(q, i, u) => (<><TextInput className="mb-8" placeholder="ID (e.g. q1)" value={q.id} onChange={(e) => u({ id: e.target.value })} /><TextInput className="mb-8" placeholder="Question" value={q.question} onChange={(e) => u({ question: e.target.value })} /><Textarea rows={3} placeholder="Answer" value={q.answer} onChange={(e) => u({ answer: e.target.value })} /></>)} /></div>
              <Field label="Default open question ID"><TextInput value={C.faq.defaultOpenId} onChange={(e) => patch({ faq: { ...C.faq!, defaultOpenId: e.target.value } })} /></Field>
            </>)}
          </FormAccordion>

          {/* Related products */}
          <FormAccordion id="relatedProducts" step="11" title="Related products" description="Optional cross-sell cards"
            open={accordion.open.has("relatedProducts")} onToggle={() => accordion.toggle("relatedProducts")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("relatedProducts")} isComplete={sectionComplete.relatedProducts}
            headerExtra={<Toggle on={Boolean(C.relatedProducts)} set={() => toggleSection("relatedProducts", { eyebrow: "", heading: "", items: [] })} />}>
            {C.relatedProducts && (<>
              <Field label="Eyebrow"><TextInput value={C.relatedProducts.eyebrow} onChange={(e) => patch({ relatedProducts: { ...C.relatedProducts!, eyebrow: e.target.value } })} /></Field>
              <Field label="Heading"><TextInput value={C.relatedProducts.heading} onChange={(e) => patch({ relatedProducts: { ...C.relatedProducts!, heading: e.target.value } })} /></Field>
              <FieldLabel>Products</FieldLabel>
              <div className="mt-8"><Repeater items={C.relatedProducts.items} set={(v) => patch({ relatedProducts: { ...C.relatedProducts!, items: v } })} empty={{ title: "", body: "", image: "", href: "" }} add="Add product"
                render={(p, i, u) => (<><TextInput className="mb-8" placeholder="Title" value={p.title} onChange={(e) => u({ title: e.target.value })} /><Textarea className="mb-8" rows={2} placeholder="Body" value={p.body} onChange={(e) => u({ body: e.target.value })} /><div className="mb-8"><ImageField label="Product image" url={p.image} onChange={(url) => u({ image: url })} onUploading={onUploading} /><AltField url={p.image} value={p.imageAlt ?? ""} onChange={(alt) => u({ imageAlt: alt })} /></div><TextInput placeholder="Link" value={p.href} onChange={(e) => u({ href: e.target.value })} /></>)} /></div>
            </>)}
          </FormAccordion>

          {/* Documents CTA */}
          <FormAccordion id="documentsCta" step="12" title="Documents CTA" description="Optional band linking to a datasheet or resource"
            open={accordion.open.has("documentsCta")} onToggle={() => accordion.toggle("documentsCta")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("documentsCta")} isComplete={sectionComplete.documentsCta}
            headerExtra={<Toggle on={Boolean(C.documentsCta)} set={() => toggleSection("documentsCta", { heading: "", buttonLabel: "", buttonHref: "", backgroundImage: "" })} />}>
            {C.documentsCta && (<>
              <Field label="Heading"><TextInput value={C.documentsCta.heading} onChange={(e) => patch({ documentsCta: { ...C.documentsCta!, heading: e.target.value } })} /></Field>
              <div className="grid gap-12 sm:grid-cols-2">
                <Field label="Button label"><TextInput value={C.documentsCta.buttonLabel} onChange={(e) => patch({ documentsCta: { ...C.documentsCta!, buttonLabel: e.target.value } })} /></Field>
                <Field label="Button link"><TextInput value={C.documentsCta.buttonHref} onChange={(e) => patch({ documentsCta: { ...C.documentsCta!, buttonHref: e.target.value } })} /></Field>
              </div>
              <Field label="Background image">
                <ImageField label="Documents bg" url={C.documentsCta.backgroundImage} onChange={(u) => patch({ documentsCta: { ...C.documentsCta!, backgroundImage: u } })} onUploading={onUploading} />
                <AltField url={C.documentsCta.backgroundImage} value={C.documentsCta.backgroundImageAlt ?? ""} onChange={(v) => patch({ documentsCta: { ...C.documentsCta!, backgroundImageAlt: v } })} />
              </Field>
            </>)}
          </FormAccordion>

          <p className="text-p4 font-light text-neutral-5">
            Advanced sections (Engineering tabs, Reliability charts, Energy-gain chart, ODM, Awards, Quotation form) are preserved from the source data and can be added on request — they aren&apos;t in this form yet.
          </p>
        </div>

        {/* sidebar */}
        <div className="w-full shrink-0 space-y-24 lg:w-360">
          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Publish</h2>
            <FieldLabel>Status</FieldLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
            <FieldHint>Only published pages are public and appear in the mega menu.</FieldHint>
            <div className="mt-24 flex flex-col gap-8">
              <button type="submit" disabled={busy} className="rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white hover:bg-primary/90 disabled:opacity-60">{busy ? "Saving…" : status === "PUBLISHED" ? "Publish" : "Save"}</button>
              <button type="button" disabled={busy} onClick={() => submit("DRAFT")} className="rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 hover:border-primary hover:text-primary disabled:opacity-60">Save as draft</button>
              {page && status === "PUBLISHED" && <a href={liveHref} target="_blank" rel="noreferrer" className="text-center text-p4 font-semibold uppercase tracking-[1px] text-primary underline">View live page</a>}
            </div>
            {mode === "edit" && page?.isProtectedTemplate && (
              <div className="mt-24 border-t border-neutral-10 pt-24">
                <p title="This is a protected master template and cannot be deleted." className="w-full cursor-not-allowed rounded-full border border-neutral-10 bg-surface-2 px-24 py-16 text-center text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-6">
                  Protected — cannot delete
                </p>
              </div>
            )}
            {mode === "edit" && page && !page.isProtectedTemplate && (
              <div className="mt-24 border-t border-neutral-10 pt-24">
                {!confirmDelete ? (
                  <button type="button" onClick={onDelete} className="w-full rounded-full border border-error px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-error hover:bg-error/5">Delete page</button>
                ) : (
                  <div className="flex gap-8">
                    <button type="button" onClick={onDelete} disabled={busy} className="flex-1 rounded-full bg-error px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white hover:bg-error/90 disabled:opacity-60">Confirm</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 hover:border-primary hover:text-primary">Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Category & menu</h2>
            <div className="mb-16"><FieldLabel>Category</FieldLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value as "SOLAR_PANELS" | "BESS")}>
                <option value="SOLAR_PANELS">Solar Panels</option>
                <option value="BESS">BESS</option>
              </Select>
              <FieldHint>Sets the URL base and the mega-menu column.</FieldHint>
            </div>
            <div className="mb-16"><FieldLabel>Menu label</FieldLabel><TextInput value={menuLabel} onChange={(e) => setMenuLabel(e.target.value)} placeholder="e.g. Back Contact" aria-invalid={Boolean(err("menuLabel"))} /><FieldError>{err("menuLabel")}</FieldError></div>
            <div className="mb-16"><FieldLabel>Menu order</FieldLabel><TextInput type="number" min={0} max={9999} value={menuOrder} onChange={(e) => setMenuOrder(e.target.value)} /></div>
            <label className="flex cursor-pointer items-center gap-8 text-p3 text-neutral-1"><input type="checkbox" checked={showInMenu} onChange={(e) => setShowInMenu(e.target.checked)} className="h-16 w-16 rounded-4 border-neutral-10 text-primary" /> Show in mega menu</label>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Organisation</h2>
            <FieldLabel>Locale</FieldLabel>
            <Select value={locale} onChange={(e) => setLocale(e.target.value as "EN" | "FR")}>
              <option value="EN">English</option>
              <option value="FR">French</option>
            </Select>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">SEO & social</h2>
            {/* Search preview */}
            <div className="mb-16 rounded-8 border border-neutral-10 bg-surface-2 p-12">
              <p className="truncate text-p3 text-primary">{seo.metaTitle || content.meta.title || title || "Page title"}</p>
              <p className="truncate text-p4 text-success">{liveHref}</p>
              <p className="line-clamp-2 text-p4 text-neutral-5">{seo.metaDescription || content.meta.description || "Meta description preview…"}</p>
            </div>
            <div className="mb-12"><FieldLabel>SEO title</FieldLabel><TextInput value={seo.metaTitle ?? ""} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} /><FieldHint>{(seo.metaTitle ?? "").length} chars (aim 50–60)</FieldHint></div>
            <div className="mb-12"><FieldLabel>Meta description</FieldLabel><Textarea rows={2} value={seo.metaDescription ?? ""} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} /><FieldHint>{(seo.metaDescription ?? "").length} chars (aim 140–160)</FieldHint></div>
            <div className="mb-12"><FieldLabel>Keywords</FieldLabel><TextInput value={seo.keywords ?? ""} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} placeholder="hjt, bifacial, solar" /></div>
            <div className="mb-12"><FieldLabel>Canonical URL</FieldLabel><TextInput value={seo.canonicalUrl ?? ""} onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })} /></div>
            <div className="mb-12 flex gap-16">
              <label className="flex items-center gap-8 text-p4 text-neutral-1"><input type="checkbox" checked={Boolean(seo.noIndex)} onChange={(e) => setSeo({ ...seo, noIndex: e.target.checked })} className="h-16 w-16 rounded-4 border-neutral-10 text-primary" /> No index</label>
              <label className="flex items-center gap-8 text-p4 text-neutral-1"><input type="checkbox" checked={Boolean(seo.noFollow)} onChange={(e) => setSeo({ ...seo, noFollow: e.target.checked })} className="h-16 w-16 rounded-4 border-neutral-10 text-primary" /> No follow</label>
            </div>
            <div className="mb-12"><FieldLabel>OG title</FieldLabel><TextInput value={seo.ogTitle ?? ""} onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })} /></div>
            <div className="mb-12"><FieldLabel>OG description</FieldLabel><Textarea rows={2} value={seo.ogDescription ?? ""} onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })} /></div>
            <div className="mb-12"><FieldLabel>OG image</FieldLabel><ImageField label="OG image" url={seo.ogImage ?? ""} onChange={(u) => setSeo({ ...seo, ogImage: u })} onUploading={onUploading} /></div>
            <div className="mb-12"><FieldLabel>OG image alt</FieldLabel><TextInput value={seo.ogImageAlt ?? ""} onChange={(e) => setSeo({ ...seo, ogImageAlt: e.target.value })} /></div>
            <div className="mb-12"><FieldLabel>Twitter title</FieldLabel><TextInput value={seo.twitterTitle ?? ""} onChange={(e) => setSeo({ ...seo, twitterTitle: e.target.value })} /></div>
            <div className="mb-12"><FieldLabel>Twitter description</FieldLabel><Textarea rows={2} value={seo.twitterDescription ?? ""} onChange={(e) => setSeo({ ...seo, twitterDescription: e.target.value })} /></div>
            <div className="mb-12"><FieldLabel>Twitter image</FieldLabel><ImageField label="Twitter image" url={seo.twitterImage ?? ""} onChange={(u) => setSeo({ ...seo, twitterImage: u })} onUploading={onUploading} /></div>
            <div><FieldLabel>Twitter image alt</FieldLabel><TextInput value={seo.twitterImageAlt ?? ""} onChange={(e) => setSeo({ ...seo, twitterImageAlt: e.target.value })} /></div>
          </div>
        </div>
      </div>
    </form>
  );
}
