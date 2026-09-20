"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import StatusBadge from "@/components/dashboard/status-badge";
import {
  setManufacturingStatus,
  deleteManufacturingPage,
  duplicateManufacturingPage,
} from "./actions";

export type ManufacturingRow = {
  id: string;
  title: string;
  slug: string;
  locale: "EN" | "FR";
  category: "SOLAR_PANELS" | "BESS";
  status: "DRAFT" | "PUBLISHED";
  menuLabel: string;
  menuOrder: number;
  showInMegaMenu: boolean;
  updatedAt: string;
};

const CATEGORY_LABEL: Record<ManufacturingRow["category"], string> = {
  SOLAR_PANELS: "Solar Panels",
  BESS: "BESS",
};

function liveHref(row: ManufacturingRow) {
  const base = row.category === "BESS" ? "/manufacturing/bess" : "/manufacturing/solar-panels";
  return `/en${base}/${row.slug}`;
}

export default function ManufacturingTable({ pages }: { pages: ManufacturingRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await fn();
      if (result.ok) router.refresh();
      else setError(result.error ?? "Something went wrong.");
    });
  }

  function onDelete(id: string) {
    if (confirmId !== id) return setConfirmId(id);
    setConfirmId(null);
    act(() => deleteManufacturingPage(id));
  }

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      {error && <div role="alert" className="border-b border-error/20 bg-error/5 px-24 py-12 text-p4 text-error">{error}</div>}
      <table className="w-full text-left">
        <thead className="border-b border-neutral-10 bg-surface-2 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">
          <tr>
            <th className="px-24 py-12">Page</th>
            <th className="px-24 py-12">Menu</th>
            <th className="px-24 py-12">Status</th>
            <th className="px-24 py-12">Updated</th>
            <th className="px-24 py-12 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-10">
          {pages.map((p) => (
            <tr key={p.id} className="text-p3 text-neutral-1">
              <td className="px-24 py-16">
                <div className="font-medium text-neutral-1">{p.title}</div>
                <div className="mt-2 text-p4 font-light text-neutral-5">/{p.slug} · {CATEGORY_LABEL[p.category]} · {p.locale}</div>
              </td>
              <td className="px-24 py-16 text-p4 text-neutral-4">
                <div className="font-medium text-neutral-1">{p.menuLabel || "—"}</div>
                <div className="mt-2">#{p.menuOrder}{!p.showInMegaMenu && <span className="ml-4 text-warning">(hidden)</span>}</div>
              </td>
              <td className="px-24 py-16"><StatusBadge status={p.status} /></td>
              <td className="px-24 py-16 text-p4 font-light text-neutral-5">{new Date(p.updatedAt).toLocaleDateString()}</td>
              <td className="px-24 py-16">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/dashboard/manufacturing/${p.id}/edit`} className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:bg-surface-2">Edit</Link>
                  {p.status === "PUBLISHED" ? (
                    <>
                      <a href={liveHref(p)} target="_blank" rel="noreferrer" className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:bg-surface-2">View</a>
                      <button type="button" disabled={isPending} onClick={() => act(() => setManufacturingStatus(p.id, "DRAFT"))} className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 hover:bg-surface-2 disabled:opacity-50">Unpublish</button>
                    </>
                  ) : (
                    <button type="button" disabled={isPending} onClick={() => act(() => setManufacturingStatus(p.id, "PUBLISHED"))} className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-success hover:bg-surface-2 disabled:opacity-50">Publish</button>
                  )}
                  <button type="button" disabled={isPending} aria-label="Duplicate" onClick={() => act(async () => { const r = await duplicateManufacturingPage(p.id); return r; })} className="rounded-8 p-8 text-neutral-4 hover:text-primary disabled:opacity-50"><Copy size={16} /></button>
                  <button type="button" disabled={isPending} aria-label="Delete" onClick={() => onDelete(p.id)} className={`rounded-8 p-8 hover:bg-error/5 disabled:opacity-50 ${confirmId === p.id ? "bg-error/10 text-error" : "text-error"}`}>
                    {confirmId === p.id ? <span className="text-p4 font-semibold uppercase">Sure?</span> : <Trash2 size={16} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
