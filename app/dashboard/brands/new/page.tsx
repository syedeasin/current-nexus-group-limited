import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import NewBrandForm from "./new-brand-form";

export default async function NewBrandPage() {
  await requirePageAccess("brandPage.manage");

  return (
    <div>
      <Link
        href="/dashboard/brands"
        className="mb-16 inline-flex items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5 hover:text-primary"
      >
        <ArrowLeft size={16} /> All brands
      </Link>
      <h1 className="mb-8 text-h5 font-semibold text-neutral-1">Add brand</h1>
      <p className="mb-24 max-w-640 text-p3 font-light text-neutral-5">
        The page starts as a draft with the template text filled in for this brand. You add the logo, products and
        documents on the next screen.
      </p>
      <NewBrandForm />
    </div>
  );
}
