"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, Lock, Trash2 } from "lucide-react";
import StatusBadge from "@/components/dashboard/status-badge";
import { brandEntryHref } from "@/config/nav.config";
import { deleteBrandPage, duplicateBrandPage } from "./actions";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  locale: "EN" | "FR";
  categoryLabel: string;
  status: "DRAFT" | "PUBLISHED";
  logo: string;
  menuOrder: number;
  showInMegaMenu: boolean;
  isProtectedTemplate: boolean;
  updatedAt: string;
};

export default function BrandsTable({ rows }: { rows: BrandRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onDuplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateBrandPage(id);
      if (result.ok) router.push(`/dashboard/brands/${result.id}/edit`);
      else setError(result.error);
    });
  }

  function onDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    startTransition(async () => {
      const result = await deleteBrandPage(id);
      setConfirmId(null);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      {error && (
        <div role="alert" className="border-b border-error/20 bg-error/5 px-24 py-12 text-p4 text-error">
          {error}
        </div>
      )}
      <div className="dash-table-scroll relative">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-neutral-10 bg-surface-2 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">
            <tr>
              <th className="px-24 py-12">Brand</th>
              <th className="px-24 py-12">Category</th>
              <th className="px-24 py-12">Status</th>
              <th className="px-24 py-12">Updated</th>
              <th className="px-24 py-12 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-10">
            {rows.map((row) => (
              <tr key={row.id} className="text-p3 text-neutral-1">
                <td className="px-24 py-16">
                  <div className="flex items-center gap-16">
                    <span className="flex h-40 w-96 shrink-0 items-center justify-center rounded-8 border border-neutral-10 bg-white px-8">
                      {row.logo ? (
                        <Image src={row.logo} alt="" width={80} height={24} className="h-24 w-auto object-contain" />
                      ) : (
                        <span className="text-p4 text-neutral-6">No logo</span>
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-8">
                        <Link href={`/dashboard/brands/${row.id}/edit`} className="font-medium text-primary hover:underline">
                          {row.name}
                        </Link>
                        {row.isProtectedTemplate && (
                          <span
                            title="Master template — always kept as the base design"
                            className="inline-flex items-center gap-4 rounded-full bg-surface-1 px-8 py-2 text-p4 font-semibold uppercase tracking-[1px] text-primary"
                          >
                            <Lock size={11} /> Master
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-p4 font-light text-neutral-5">
                        /tier-1-brands/{row.slug} · {row.locale} · #{row.menuOrder}
                        {!row.showInMegaMenu && <span className="ml-4 text-warning">(not in menu)</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-24 py-16 text-p4 text-neutral-4">{row.categoryLabel}</td>
                <td className="px-24 py-16">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-24 py-16 text-p4 font-light text-neutral-5">{new Date(row.updatedAt).toLocaleDateString()}</td>
                <td className="px-24 py-16">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/dashboard/brands/${row.id}/edit`}
                      className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:bg-surface-2"
                    >
                      Edit
                    </Link>
                    {row.status === "PUBLISHED" && (
                      <a
                        href={`/${row.locale.toLowerCase()}${brandEntryHref(row.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:bg-surface-2"
                      >
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={isPending}
                      aria-label={`Duplicate ${row.name}`}
                      title="Duplicate"
                      onClick={() => onDuplicate(row.id)}
                      className="rounded-8 p-8 text-neutral-4 hover:text-primary disabled:opacity-50"
                    >
                      <Copy size={16} />
                    </button>
                    {row.isProtectedTemplate ? (
                      <span title="The master template cannot be deleted." className="rounded-8 p-8 text-neutral-8">
                        <Lock size={16} />
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        aria-label={confirmId === row.id ? `Confirm delete ${row.name}` : `Delete ${row.name}`}
                        onClick={() => onDelete(row.id)}
                        className={`rounded-8 p-8 hover:bg-error/5 disabled:opacity-50 ${confirmId === row.id ? "bg-error/10 text-error" : "text-error"}`}
                      >
                        {confirmId === row.id ? <span className="text-p4 font-semibold uppercase">Sure?</span> : <Trash2 size={16} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
