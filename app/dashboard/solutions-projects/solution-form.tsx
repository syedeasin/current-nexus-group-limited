"use client";

import { useMemo, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import {
  createSolutionPage,
  updateSolutionPage,
  deleteSolutionPage,
  type ActionResult,
  type SimpleActionResult,
} from "./actions";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import Select from "@/components/dashboard/form/select";
import FieldError from "@/components/dashboard/form/field-error";
import FieldHint from "@/components/dashboard/form/field-hint";
import ImageUpload from "@/components/dashboard/image-upload";
import FormAccordion, { useFormAccordion, sectionsWithErrors } from "@/components/dashboard/form-accordion";
import { SOLUTION_ICON_NAMES } from "@/lib/solutions-projects/icons";
import type {
  SolutionPageContent,
  SolutionStat,
  SolutionFeature,
  SolutionProduct,
  SolutionApplicationCard,
  SolutionCaseSpec,
} from "@/lib/solutions-projects/types";

export type SolutionPageInitial = {
  id: string;
  title: string;
  slug: string;
  locale: "EN" | "FR";
  status: "DRAFT" | "PUBLISHED";
  menuGroup: "SOLUTIONS" | "RENEWABLE_PROJECTS";
  menuLabel: string;
  menuOrder: number;
  showInMegaMenu: boolean;
  metaTitle: string;
  metaDescription: string;
  content: SolutionPageContent;
};

const EMPTY_CONTENT: SolutionPageContent = {
  hero: { eyebrow: "SOLUTIONS & PROJECTS", heading: "", description: "", backgroundImage: "", layout: "centered" },
};

/** Accordion section ids, in on-page order — also the auto-open-on-error search order. */
const SECTION_ORDER = ["general", "hero", "stats", "whyChoose", "productModels", "applications", "caseStudy"] as const;

/** Which dotted field-error path prefixes belong to which section. */
const SECTION_ERROR_PREFIXES: Record<(typeof SECTION_ORDER)[number], string[]> = {
  general: ["title", "slug"],
  hero: ["content.hero"],
  stats: ["content.stats"],
  whyChoose: ["content.whyChoose"],
  productModels: ["content.productModels"],
  applications: ["content.applications"],
  caseStudy: ["content.caseStudy"],
};

function makeClientSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

/* ---------- small building blocks ---------- */

function SectionToggle({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-16 w-16 rounded-4 border-neutral-10 text-primary"
      />
      {enabled ? "Included" : "Hidden"}
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

function RepeaterItem({
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-12 border border-neutral-10 bg-surface-2 p-20">
      <div className="mb-12 flex items-center justify-between">
        <span className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">
          Item {index + 1}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className="rounded-8 p-8 text-neutral-4 hover:text-primary disabled:opacity-40"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === count - 1}
            onClick={() => onMove(index, index + 1)}
            className="rounded-8 p-8 text-neutral-4 hover:text-primary disabled:opacity-40"
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            aria-label="Remove"
            onClick={() => onRemove(index)}
            className="rounded-8 p-8 text-error hover:bg-error/5"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-12 inline-flex items-center gap-8 rounded-full border border-dashed border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 hover:border-primary hover:text-primary"
    >
      <Plus size={16} /> {label}
    </button>
  );
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/* ---------- form ---------- */

export default function SolutionForm({
  mode,
  page,
}: {
  mode: "create" | "edit";
  page?: SolutionPageInitial;
}) {
  const router = useRouter();
  const init = page;
  const accordion = useFormAccordion(["general"]);

  // basic
  const [title, setTitle] = useState(init?.title ?? "");
  const [slug, setSlug] = useState(init?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [locale, setLocale] = useState(init?.locale ?? "EN");
  const [status, setStatus] = useState(init?.status ?? "DRAFT");
  const [menuGroup, setMenuGroup] = useState(init?.menuGroup ?? "SOLUTIONS");
  const [menuLabel, setMenuLabel] = useState(init?.menuLabel ?? "");
  const [menuOrder, setMenuOrder] = useState(String(init?.menuOrder ?? 0));
  const [showInMenu, setShowInMenu] = useState(init?.showInMegaMenu ?? true);
  const [metaTitle, setMetaTitle] = useState(init?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(init?.metaDescription ?? "");

  // content
  const c = init?.content ?? EMPTY_CONTENT;
  const [hero, setHero] = useState(c.hero);
  const [stats, setStats] = useState<SolutionStat[]>(c.stats?.items ?? []);
  const [statsOn, setStatsOn] = useState(Boolean(c.stats));

  const [why, setWhy] = useState(
    c.whyChoose ?? { eyebrow: "WHY CHOOSE", heading: "", description: "", image: "", features: [] }
  );
  const [whyOn, setWhyOn] = useState(Boolean(c.whyChoose));

  const [pm, setPm] = useState(
    c.productModels ?? { eyebrow: "PRODUCT MODEL", heading: "", datasheetLabel: "Get your data-sheets here", products: [] }
  );
  const [pmOn, setPmOn] = useState(Boolean(c.productModels));

  const [apps, setApps] = useState(
    c.applications ?? { eyebrow: "SCENE OF APPLICATIONS", heading: "", previousLabel: "Previous", nextLabel: "Next", cards: [] }
  );
  const [appsOn, setAppsOn] = useState(Boolean(c.applications));

  const [cs, setCs] = useState(
    c.caseStudy ?? { eyebrow: "CLIENT SUCCESS STORY", heading: "", backgroundImage: "", title: "", body: "", specs: [] }
  );
  const [csOn, setCsOn] = useState(Boolean(c.caseStudy));

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  function err(key: string) {
    return fieldErrors[key];
  }

  const erroredSections = useMemo(
    () => new Set(sectionsWithErrors(fieldErrors, [...SECTION_ORDER], SECTION_ERROR_PREFIXES)),
    [fieldErrors]
  );

  // Completion heuristics — an off/hidden optional section never shows either
  // a check or an error just for being off.
  const sectionComplete: Record<(typeof SECTION_ORDER)[number], boolean> = {
    general: Boolean(title.trim()),
    hero: Boolean(hero.heading.trim() && hero.backgroundImage.trim()),
    stats: Boolean(statsOn && stats.length > 0),
    whyChoose: Boolean(whyOn && why.heading.trim() && why.image.trim()),
    productModels: Boolean(pmOn && pm.products.length > 0),
    applications: Boolean(appsOn && apps.cards.length > 0),
    caseStudy: Boolean(csOn && cs.title.trim() && cs.body.trim()),
  };

  function buildContent(): SolutionPageContent {
    const out: SolutionPageContent = { hero };
    if (statsOn) out.stats = { items: stats };
    if (whyOn) out.whyChoose = why;
    if (pmOn) out.productModels = pm;
    if (appsOn) out.applications = apps;
    if (csOn) out.caseStudy = cs;
    return out;
  }

  function submit(overrideStatus?: "DRAFT" | "PUBLISHED") {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("locale", locale);
    fd.set("status", overrideStatus ?? status);
    fd.set("menuGroup", menuGroup);
    fd.set("menuLabel", menuLabel);
    fd.set("menuOrder", menuOrder);
    if (showInMenu) fd.set("showInMegaMenu", "on");
    fd.set("metaTitle", metaTitle);
    fd.set("metaDescription", metaDescription);
    fd.set("content", JSON.stringify(buildContent()));

    startTransition(async () => {
      let result: ActionResult;
      try {
        result = mode === "create" ? await createSolutionPage(fd) : await updateSolutionPage(page!.id, fd);
      } catch (error) {
        console.error("[solution-form] save failed", error);
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
        router.push(`/dashboard/solutions-projects/${result.id}/edit`);
        router.refresh();
      } else {
        setSuccess("Saved.");
        router.refresh();
        setTimeout(() => setSuccess(null), 4000);
      }
    });
  }

  function onDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      let result: SimpleActionResult;
      try {
        result = await deleteSolutionPage(page!.id);
      } catch (error) {
        console.error("[solution-form] delete failed", error);
        setFormError("Something went wrong while deleting. Please try again.");
        setConfirmDelete(false);
        return;
      }
      if (result.ok) {
        router.push("/dashboard/solutions-projects");
        router.refresh();
      } else {
        setFormError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    submit();
  }

  const busy = isPending || uploading > 0;

  return (
    <form onSubmit={handleSubmit}>
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
      {success && (
        <div role="status" className="mb-24 rounded-16 border border-success bg-success/5 px-24 py-16 text-p3 text-success">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-24 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-16">
          {/* Basic */}
          <FormAccordion id="general" step="01" title="General information" description="Basic page and URL settings"
            open={accordion.open.has("general")} onToggle={() => accordion.toggle("general")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("general")} isComplete={sectionComplete.general}>
            <Field label="Page title">
              <TextInput
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (mode === "create" && !slugTouched) setSlug(makeClientSlug(e.target.value));
                }}
                aria-invalid={Boolean(err("title"))}
              />
              <FieldError>{err("title")}</FieldError>
            </Field>
            <Field label="Slug" hint="Unique per locale. Left blank, derived from the title.">
              <TextInput
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                aria-invalid={Boolean(err("slug"))}
              />
              <FieldError>{err("slug")}</FieldError>
            </Field>
          </FormAccordion>

          {/* Hero */}
          <FormAccordion id="hero" step="02" title="Hero section" description="Background, eyebrow, title and description"
            open={accordion.open.has("hero")} onToggle={() => accordion.toggle("hero")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("hero")} isComplete={sectionComplete.hero}>
            <Field label="Background image">
              <ImageUpload
                name="__hero"
                defaultUrl={hero.backgroundImage || null}
                label="Hero background"
                onUploadingChange={(u) => setUploading((n) => n + (u ? 1 : -1))}
                onUrlChange={(url) => setHero((h) => ({ ...h, backgroundImage: url }))}
              />
              <FieldError>{err("content.hero.backgroundImage")}</FieldError>
            </Field>
            <Field label="Eyebrow">
              <TextInput value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
              <FieldError>{err("content.hero.eyebrow")}</FieldError>
            </Field>
            <Field label="Title">
              <TextInput value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} />
              <FieldError>{err("content.hero.heading")}</FieldError>
            </Field>
            <Field label="Description">
              <Textarea rows={3} value={hero.description ?? ""} onChange={(e) => setHero({ ...hero, description: e.target.value })} />
            </Field>
            <Field label="Layout" hint="Centered = tall banner with heading + paragraph; Bottom = short banner, text bottom-left.">
              <Select value={hero.layout ?? "centered"} onChange={(e) => setHero({ ...hero, layout: e.target.value as "centered" | "bottom" })}>
                <option value="centered">Centered</option>
                <option value="bottom">Bottom</option>
              </Select>
            </Field>
          </FormAccordion>

          {/* Stats */}
          <FormAccordion id="stats" step="03" title="Stats band" description="Optional four-up figures under the banner"
            open={accordion.open.has("stats")} onToggle={() => accordion.toggle("stats")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("stats")} isComplete={sectionComplete.stats}
            headerExtra={<SectionToggle enabled={statsOn} onToggle={setStatsOn} />}>
            {statsOn && (
              <div className="space-y-12">
                {stats.map((s, i) => (
                  <RepeaterItem key={i} index={i} count={stats.length}
                    onMove={(f, t) => setStats((a) => move(a, f, t))}
                    onRemove={(idx) => setStats((a) => a.filter((_, j) => j !== idx))}>
                    <div className="grid gap-12 sm:grid-cols-2">
                      <TextInput placeholder="Value (e.g. 540W)" value={s.value} onChange={(e) => setStats((a) => a.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                      <TextInput placeholder="Label" value={s.label} onChange={(e) => setStats((a) => a.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                    </div>
                  </RepeaterItem>
                ))}
                <AddButton label="Add stat" onClick={() => setStats((a) => [...a, { value: "", label: "" }])} />
              </div>
            )}
          </FormAccordion>

          {/* Why choose */}
          <FormAccordion id="whyChoose" step="04" title="Why choose (features)" description="Optional feature-card grid"
            open={accordion.open.has("whyChoose")} onToggle={() => accordion.toggle("whyChoose")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("whyChoose")} isComplete={sectionComplete.whyChoose}
            headerExtra={<SectionToggle enabled={whyOn} onToggle={setWhyOn} />}>
            {whyOn && (
              <>
                <Field label="Eyebrow"><TextInput value={why.eyebrow} onChange={(e) => setWhy({ ...why, eyebrow: e.target.value })} /></Field>
                <Field label="Heading"><TextInput value={why.heading} onChange={(e) => setWhy({ ...why, heading: e.target.value })} /></Field>
                <Field label="Description"><Textarea rows={3} value={why.description} onChange={(e) => setWhy({ ...why, description: e.target.value })} /></Field>
                <Field label="Image">
                  <ImageUpload name="__why" defaultUrl={why.image || null} label="Section image"
                    onUploadingChange={(u) => setUploading((n) => n + (u ? 1 : -1))}
                    onUrlChange={(url) => setWhy((w) => ({ ...w, image: url }))} />
                </Field>
                <FieldLabel>Feature cards</FieldLabel>
                <div className="mt-8 space-y-12">
                  {why.features.map((f, i) => (
                    <RepeaterItem key={i} index={i} count={why.features.length}
                      onMove={(from, to) => setWhy((w) => ({ ...w, features: move(w.features, from, to) }))}
                      onRemove={(idx) => setWhy((w) => ({ ...w, features: w.features.filter((_, j) => j !== idx) }))}>
                      <div className="mb-12">
                        <FieldLabel>Icon (SVG/image)</FieldLabel>
                        <ImageUpload name="__feat" defaultUrl={f.icon || null} label="Feature icon"
                          onUploadingChange={(u) => setUploading((n) => n + (u ? 1 : -1))}
                          onUrlChange={(url) => setWhy((w) => ({ ...w, features: w.features.map((x, j) => (j === i ? { ...x, icon: url } : x)) }))} />
                      </div>
                      <TextInput className="mb-12" placeholder="Title" value={f.title} onChange={(e) => setWhy((w) => ({ ...w, features: w.features.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))} />
                      <Textarea rows={2} placeholder="Description" value={f.description} onChange={(e) => setWhy((w) => ({ ...w, features: w.features.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) }))} />
                    </RepeaterItem>
                  ))}
                  <AddButton label="Add feature" onClick={() => setWhy((w) => ({ ...w, features: [...w.features, { icon: "", title: "", description: "" } as SolutionFeature] }))} />
                </div>
              </>
            )}
          </FormAccordion>

          {/* Product models */}
          <FormAccordion id="productModels" step="05" title="Product models" description="Optional product cards with a datasheet link"
            open={accordion.open.has("productModels")} onToggle={() => accordion.toggle("productModels")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("productModels")} isComplete={sectionComplete.productModels}
            headerExtra={<SectionToggle enabled={pmOn} onToggle={setPmOn} />}>
            {pmOn && (
              <>
                <Field label="Eyebrow"><TextInput value={pm.eyebrow} onChange={(e) => setPm({ ...pm, eyebrow: e.target.value })} /></Field>
                <Field label="Heading"><TextInput value={pm.heading} onChange={(e) => setPm({ ...pm, heading: e.target.value })} /></Field>
                <Field label="Datasheet button label"><TextInput value={pm.datasheetLabel} onChange={(e) => setPm({ ...pm, datasheetLabel: e.target.value })} /></Field>
                <FieldLabel>Products</FieldLabel>
                <div className="mt-8 space-y-12">
                  {pm.products.map((p, i) => (
                    <RepeaterItem key={i} index={i} count={pm.products.length}
                      onMove={(from, to) => setPm((s) => ({ ...s, products: move(s.products, from, to) }))}
                      onRemove={(idx) => setPm((s) => ({ ...s, products: s.products.filter((_, j) => j !== idx) }))}>
                      <div className="mb-12">
                        <FieldLabel>Product image</FieldLabel>
                        <ImageUpload name="__prod" defaultUrl={p.image || null} label="Product image"
                          onUploadingChange={(u) => setUploading((n) => n + (u ? 1 : -1))}
                          onUrlChange={(url) => setPm((s) => ({ ...s, products: s.products.map((x, j) => (j === i ? { ...x, image: url } : x)) }))} />
                      </div>
                      <TextInput className="mb-12" placeholder="Name" value={p.name} onChange={(e) => setPm((s) => ({ ...s, products: s.products.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))} />
                      <TextInput className="mb-12" placeholder="Datasheet link (/service/downloads)" value={p.datasheetHref} onChange={(e) => setPm((s) => ({ ...s, products: s.products.map((x, j) => (j === i ? { ...x, datasheetHref: e.target.value } : x)) }))} />
                      <Select value={p.buttonVariant ?? "primary"} onChange={(e) => setPm((s) => ({ ...s, products: s.products.map((x, j) => (j === i ? { ...x, buttonVariant: e.target.value as "primary" | "outline" } : x)) }))}>
                        <option value="primary">Filled button</option>
                        <option value="outline">Outline button</option>
                      </Select>
                    </RepeaterItem>
                  ))}
                  <AddButton label="Add product" onClick={() => setPm((s) => ({ ...s, products: [...s.products, { name: "", image: "", datasheetHref: "/service/downloads", buttonVariant: "primary" } as SolutionProduct] }))} />
                </div>
              </>
            )}
          </FormAccordion>

          {/* Applications */}
          <FormAccordion id="applications" step="06" title="Applications carousel" description="Optional scrolling scene cards"
            open={accordion.open.has("applications")} onToggle={() => accordion.toggle("applications")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("applications")} isComplete={sectionComplete.applications}
            headerExtra={<SectionToggle enabled={appsOn} onToggle={setAppsOn} />}>
            {appsOn && (
              <>
                <Field label="Eyebrow"><TextInput value={apps.eyebrow} onChange={(e) => setApps({ ...apps, eyebrow: e.target.value })} /></Field>
                <Field label="Heading"><TextInput value={apps.heading} onChange={(e) => setApps({ ...apps, heading: e.target.value })} /></Field>
                <FieldLabel>Cards</FieldLabel>
                <div className="mt-8 space-y-12">
                  {apps.cards.map((card, i) => (
                    <RepeaterItem key={i} index={i} count={apps.cards.length}
                      onMove={(from, to) => setApps((s) => ({ ...s, cards: move(s.cards, from, to) }))}
                      onRemove={(idx) => setApps((s) => ({ ...s, cards: s.cards.filter((_, j) => j !== idx) }))}>
                      <div className="mb-12">
                        <FieldLabel>Card image</FieldLabel>
                        <ImageUpload name="__app" defaultUrl={card.image || null} label="Card image"
                          onUploadingChange={(u) => setUploading((n) => n + (u ? 1 : -1))}
                          onUrlChange={(url) => setApps((s) => ({ ...s, cards: s.cards.map((x, j) => (j === i ? { ...x, image: url } : x)) }))} />
                      </div>
                      <TextInput className="mb-12" placeholder="Title" value={card.title} onChange={(e) => setApps((s) => ({ ...s, cards: s.cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))} />
                      <Textarea rows={2} placeholder="Description" value={card.description} onChange={(e) => setApps((s) => ({ ...s, cards: s.cards.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) }))} />
                    </RepeaterItem>
                  ))}
                  <AddButton label="Add card" onClick={() => setApps((s) => ({ ...s, cards: [...s.cards, { title: "", description: "", image: "" } as SolutionApplicationCard] }))} />
                </div>
              </>
            )}
          </FormAccordion>

          {/* Case study */}
          <FormAccordion id="caseStudy" step="07" title="Case study" description="Optional client success story"
            open={accordion.open.has("caseStudy")} onToggle={() => accordion.toggle("caseStudy")} registerRef={accordion.registerRef}
            hasError={erroredSections.has("caseStudy")} isComplete={sectionComplete.caseStudy}
            headerExtra={<SectionToggle enabled={csOn} onToggle={setCsOn} />}>
            {csOn && (
              <>
                <Field label="Eyebrow"><TextInput value={cs.eyebrow} onChange={(e) => setCs({ ...cs, eyebrow: e.target.value })} /></Field>
                <Field label="Heading"><TextInput value={cs.heading} onChange={(e) => setCs({ ...cs, heading: e.target.value })} /></Field>
                <Field label="Background image">
                  <ImageUpload name="__cs" defaultUrl={cs.backgroundImage || null} label="Case study background"
                    onUploadingChange={(u) => setUploading((n) => n + (u ? 1 : -1))}
                    onUrlChange={(url) => setCs((s) => ({ ...s, backgroundImage: url }))} />
                </Field>
                <Field label="Title"><TextInput value={cs.title} onChange={(e) => setCs({ ...cs, title: e.target.value })} /></Field>
                <Field label="Body"><Textarea rows={4} value={cs.body} onChange={(e) => setCs({ ...cs, body: e.target.value })} /></Field>
                <FieldLabel>Specs</FieldLabel>
                <div className="mt-8 space-y-12">
                  {cs.specs.map((spec, i) => (
                    <RepeaterItem key={i} index={i} count={cs.specs.length}
                      onMove={(from, to) => setCs((s) => ({ ...s, specs: move(s.specs, from, to) }))}
                      onRemove={(idx) => setCs((s) => ({ ...s, specs: s.specs.filter((_, j) => j !== idx) }))}>
                      <div className="grid gap-12 sm:grid-cols-[160px_1fr]">
                        <Select value={spec.icon} onChange={(e) => setCs((s) => ({ ...s, specs: s.specs.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)) }))}>
                          {SOLUTION_ICON_NAMES.map((n) => (<option key={n} value={n}>{n}</option>))}
                        </Select>
                        <TextInput placeholder="Spec text" value={spec.text} onChange={(e) => setCs((s) => ({ ...s, specs: s.specs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) }))} />
                      </div>
                    </RepeaterItem>
                  ))}
                  <AddButton label="Add spec" onClick={() => setCs((s) => ({ ...s, specs: [...s.specs, { icon: SOLUTION_ICON_NAMES[0], text: "" } as SolutionCaseSpec] }))} />
                </div>
              </>
            )}
          </FormAccordion>
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
              <button type="submit" disabled={busy} className="rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white hover:bg-primary/90 disabled:opacity-60">
                {busy ? "Saving…" : status === "PUBLISHED" ? "Publish" : "Save"}
              </button>
              <button type="button" disabled={busy} onClick={() => submit("DRAFT")} className="rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 hover:border-primary hover:text-primary disabled:opacity-60">
                Save as draft
              </button>
              {page && status === "PUBLISHED" && (
                <a href={`/en${menuGroup === "RENEWABLE_PROJECTS" ? "/solutions-projects/renewable-projects" : "/solutions-projects/solutions"}/${slug}`} target="_blank" rel="noreferrer" className="text-center text-p4 font-semibold uppercase tracking-[1px] text-primary underline">
                  View live page
                </a>
              )}
            </div>
            {mode === "edit" && (
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
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Mega menu</h2>
            <div className="mb-16">
              <FieldLabel>Menu group</FieldLabel>
              <Select value={menuGroup} onChange={(e) => setMenuGroup(e.target.value as "SOLUTIONS" | "RENEWABLE_PROJECTS")}>
                <option value="SOLUTIONS">Solutions</option>
                <option value="RENEWABLE_PROJECTS">Renewable Projects</option>
              </Select>
            </div>
            <div className="mb-16">
              <FieldLabel>Menu label</FieldLabel>
              <TextInput value={menuLabel} onChange={(e) => setMenuLabel(e.target.value)} placeholder="e.g. Residential" aria-invalid={Boolean(err("menuLabel"))} />
              <FieldHint>Shown in the header. Can differ from the page title.</FieldHint>
              <FieldError>{err("menuLabel")}</FieldError>
            </div>
            <div className="mb-16">
              <FieldLabel>Menu order</FieldLabel>
              <TextInput type="number" min={0} max={9999} value={menuOrder} onChange={(e) => setMenuOrder(e.target.value)} />
            </div>
            <label className="flex cursor-pointer items-center gap-8 text-p3 text-neutral-1">
              <input type="checkbox" checked={showInMenu} onChange={(e) => setShowInMenu(e.target.checked)} className="h-16 w-16 rounded-4 border-neutral-10 text-primary" />
              Show in mega menu
            </label>
          </div>

          <div className="rounded-16 border border-neutral-10 bg-white p-24">
            <h2 className="mb-16 text-p2 font-medium text-neutral-1">Organisation & SEO</h2>
            <div className="mb-16">
              <FieldLabel>Locale</FieldLabel>
              <Select value={locale} onChange={(e) => setLocale(e.target.value as "EN" | "FR")}>
                <option value="EN">English</option>
                <option value="FR">French</option>
              </Select>
            </div>
            <div className="mb-16">
              <FieldLabel>Meta title</FieldLabel>
              <TextInput value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Meta description</FieldLabel>
              <Textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
