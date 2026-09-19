import Image from "next/image";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ArrowRight } from "@/components/icons/ArrowRight";

interface ContactCardProps {
  avatarSrc: string;
  name: string;
  role: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Generic "talk to a person" card — extracted from the homepage FAQ's
 * ContactCard so the product detail template can reuse it with its own bio.
 */
export default function ContactCard({ avatarSrc, name, role, message, ctaLabel, ctaHref }: ContactCardProps) {
  return (
    <div className="flex w-full flex-col items-start rounded-12 bg-surface-2 p-20">
      <div className="flex w-full flex-col items-start gap-24">
        {/* Figma node 114:99413: name/role → message is a 12px gap, not 16px. */}
        <div className="flex w-full flex-col items-start gap-12">
          <div className="flex w-full items-center gap-12">
            <div className="relative size-48 shrink-0 overflow-hidden rounded-full">
              <Image src={avatarSrc} alt="" aria-hidden="true" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex flex-col items-start gap-4">
              <span className="text-p3 font-medium text-neutral-1">{name}</span>
              <span className="text-p4 text-neutral-3">{role}</span>
            </div>
          </div>
          <p className="whitespace-pre-line text-p3 text-neutral-3">{message}</p>
        </div>
        {/* Figma Button/Button Small spec here is gap-6 and tracks 0px, not the shared
            Button "lg" size's gap-8 / --text-btn-sm token's -0.09px. Trailing arrow,
            not a leading phone icon (node 4199-10014) — "Contact now" isn't a dial
            action, it opens the contact page/form. */}
        <Button href={ctaHref} size="lg" className="gap-6! tracking-[0px]!">
          {ctaLabel}
          <ArrowRight size={BUTTON_ICON_SIZE} />
        </Button>
      </div>
    </div>
  );
}
