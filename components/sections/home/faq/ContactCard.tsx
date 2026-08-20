import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import { PhoneCall } from "@/components/icons/PhoneCall";

export default async function ContactCard() {
  const t = await getTranslations("home.faq.contact");

  return (
    <div className="flex w-full flex-col items-start rounded-12 bg-surface-2 p-20">
      <div className="flex w-full flex-col items-start gap-24">
        <div className="flex w-full flex-col items-start gap-16">
          <div className="flex w-full items-center gap-12">
            <div className="relative size-48 shrink-0 overflow-hidden rounded-full">
              <Image
                src="/images/home/emmaDP.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start gap-4">
              <span className="text-p3 font-medium text-neutral-1">{t("name")}</span>
              <span className="text-p4 text-neutral-3">{t("role")}</span>
            </div>
          </div>
          <p className="whitespace-pre-line text-p3 text-neutral-3">{t("message")}</p>
        </div>
        <Button href="/contact" size="lg" className="pl-20 pr-24">
          <PhoneCall size={18} />
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}
