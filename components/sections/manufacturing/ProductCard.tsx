import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { BUTTON_ICON_SIZE } from "@/components/ui/Button";

interface ManufacturingProductCardProps {
  href: string;
  image: string;
  /** Decorative by default (empty) — the card title/description already name the product. */
  imageAlt?: string;
  title: string;
  description: string;
  learnMoreLabel: string;
  featured?: boolean;
}

export default function ManufacturingProductCard({
  href,
  image,
  imageAlt,
  title,
  description,
  learnMoreLabel,
  featured = false,
}: ManufacturingProductCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-auto flex-col overflow-hidden rounded-16 bg-surface-2 p-24 outline-none focus-visible:ring-2 focus-visible:ring-secondary md:p-32 xl:h-694"
    >
      <div className="relative mx-auto aspect-[363/300] w-full max-w-363 xl:aspect-[363/418]">
        <Image
          src={image}
          alt={imageAlt ?? ""}
          aria-hidden={imageAlt ? undefined : "true"}
          fill
          sizes="(min-width: 1280px) 363px, (min-width: 768px) 45vw, 90vw"
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-auto flex flex-col items-center gap-20 pt-24 text-center">
        <div className="flex flex-col gap-8">
          {/* Figma H5 spec (node 2247:8043) is 24/32/-0.5px; the shared --text-h5 token
              tracks -0.24px for other surfaces, so the letter-spacing is overridden here
              rather than touched globally. */}
          <span className="text-h5 font-semibold tracking-[-0.5px] text-neutral-1">{title}</span>
          {/* Figma card description (node 2247:8044) is Paragraph/Regular/P3 (18/28), not P2. */}
          <p className="max-w-456 text-p3 text-neutral-3">{description}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-48 items-center gap-8 rounded-full px-24 text-btn-sm font-semibold transition-colors duration-200 ease-out",
            featured
              ? "bg-secondary text-neutral-1 group-hover:bg-secondary/90"
              : "border-[1.5px] border-neutral-10 bg-white text-neutral-1 group-hover:bg-neutral-11"
          )}
        >
          {learnMoreLabel}
          {/* Same text/icon spec as the shared Button: 18px label, 8px gap, 20px boxed icon. */}
          <ChevronRight size={BUTTON_ICON_SIZE} boxed className="shrink-0" />
        </span>
      </div>
    </Link>
  );
}
