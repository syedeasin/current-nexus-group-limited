import { getTranslations } from "next-intl/server";
import { CircleCheck, ClipboardList } from "lucide-react";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { entries, str } from "@/lib/page-content/read";

/**
 * "Project Inquiry Card" beside the FAQs (client revision 1022, replaces the
 * Emma Collins contact card). Copy lives in Dashboard → Pages → Homepage → FAQ
 * and is shared by the product page FAQs.
 */
export default async function ProjectInquiryCard({ ctaHref }: { ctaHref?: string }) {
  const t = await getTranslations("home.faq.inquiry");
  const points = entries(t.raw("points" as never))
    .map(([id, point]) => ({ id, text: str(point, "text") }))
    .filter((point) => point.text);

  return (
    <div className="flex w-full flex-col gap-28 rounded-16 bg-neutral-1 p-24 text-white md:gap-32 md:p-32">
      {/* Grouped by relation: header + description, checklist, CTA + note. */}
      <div className="flex flex-col gap-20">
        <div className="flex items-start gap-16">
          <span
            aria-hidden="true"
            className="flex size-48 shrink-0 items-center justify-center rounded-12 bg-secondary text-neutral-1"
          >
            <ClipboardList size={24} strokeWidth={1.75} />
          </span>
          <div className="flex min-w-0 flex-col gap-4">
            {/* A line break in the title/note (Pages editor) is kept: "…Energy / Storage Project?". */}
            <h3 className="whitespace-pre-line text-h6 font-semibold text-white">{t("title")}</h3>
            <span className="text-p4 text-neutral-7">{t("subtitle")}</span>
          </div>
        </div>

        <p className="text-p3 text-neutral-9">{t("description")}</p>
      </div>

      {points.length > 0 && (
        <ul className="flex flex-col gap-16 border-t border-white/10 pt-28 md:pt-32">
          {points.map((point) => (
            <li key={point.id} className="flex items-start gap-12 text-p3 text-white">
              <CircleCheck size={20} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
              <span>{point.text}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col items-center gap-16">
        <Button href={ctaHref || t("ctaHref")} size="lg" className="w-full justify-center">
          {t("cta")}
          <ArrowRight size={BUTTON_ICON_SIZE} />
        </Button>
        {t("note") && <p className="whitespace-pre-line text-center text-p4 text-neutral-7">{t("note")}</p>}
      </div>
    </div>
  );
}
