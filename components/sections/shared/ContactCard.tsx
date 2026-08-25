import Image from "next/image";
import Button from "@/components/ui/Button";
import { PhoneCall } from "@/components/icons/PhoneCall";

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
        <div className="flex w-full flex-col items-start gap-16">
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
        <Button href={ctaHref} size="lg" className="pl-20 pr-24">
          <PhoneCall size={18} />
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
