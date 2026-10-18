import type { Metadata } from "next";
import LegalPage, { legalMetadata } from "@/components/sections/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return legalMetadata(locale, "terms");
}

export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
