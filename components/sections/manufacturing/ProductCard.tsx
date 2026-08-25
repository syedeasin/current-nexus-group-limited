import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "@/components/icons/ChevronRight";

interface ManufacturingProductCardProps {
  href: string;
  image: string;
  title: string;
  description: string;
  learnMoreLabel: string;
  featured?: boolean;
}

export default function ManufacturingProductCard({
  href,
  image,
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
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1280px) 363px, (min-width: 768px) 45vw, 90vw"
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-auto flex flex-col items-center gap-20 pt-24 text-center">
        <div className="flex flex-col gap-8">
          <span className="text-h5 font-semibold tracking-[-0.24px] text-neutral-1">{title}</span>
          <p className="max-w-456 text-p2 text-neutral-3">{description}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-8 rounded-full px-24 py-12 text-btn-sm font-semibold transition-colors duration-200 ease-out",
            featured
              ? "bg-secondary text-neutral-1 group-hover:bg-secondary/90"
              : "border border-neutral-10 bg-white text-neutral-1 group-hover:bg-neutral-11"
          )}
        >
          {learnMoreLabel}
          <ChevronRight size={20} />
        </span>
      </div>
    </Link>
  );
}
