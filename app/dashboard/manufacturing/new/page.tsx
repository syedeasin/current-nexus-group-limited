import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import ManufacturingForm from "../manufacturing-form";

export default async function NewManufacturingPage() {
  await requirePermission("manufacturingPage.manage");
  return (
    <div>
      <Link href="/dashboard/manufacturing" className="mb-16 inline-flex items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5 hover:text-primary">
        <ArrowLeft size={16} /> Back to pages
      </Link>
      <h1 className="mb-24 text-h5 font-semibold text-neutral-1">Add new page</h1>
      <ManufacturingForm mode="create" />
    </div>
  );
}
