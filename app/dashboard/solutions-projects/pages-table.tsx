"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Lock } from "lucide-react";
import StatusBadge from "@/components/dashboard/status-badge";
import { solutionEntryHref } from "@/config/nav.config";
import { deleteSolutionPage, duplicateSolutionPage } from "./actions";

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  locale: "EN" | "FR";
  status: "DRAFT" | "PUBLISHED";
  menuGroup: "SOLUTIONS" | "RENEWABLE_PROJECTS";
  menuLabel: string;
  menuOrder: number;
  showInMegaMenu: boolean;
  isProtectedTemplate: boolean;
  updatedAt: string;
};

const GROUP_LABEL: Record<PageRow["menuGroup"], string> = {
  SOLUTIONS: "Solutions",
  RENEWABLE_PROJECTS: "Renewable Projects",
};

function liveHref(row: PageRow) {
  return `/en${solutionEntryHref(row.menuGroup, row.slug)}`;
}

export default function PagesTable({ pages }: { pages: PageRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onDuplicate(id: string) {
    startTransition(async () => {
      try {
        const result = await duplicateSolutionPage(id);
        if (result.ok) {
          router.push(`/dashboard/solutions-projects/${result.id}/edit`);
          router.refresh();
        } else setError(result.error);
      } catch (err) {
        console.error("[pages-table] duplicate failed", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function onDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    startTransition(async () => {
      try {
        const result = await deleteSolutionPage(id);
        setConfirmId(null);
        if (result.ok) router.refresh();
        else setError(result.error);
      } catch (err) {
        console.error("[pages-table] delete failed", err);
        setConfirmId(null);
        setError("Something went wrong. Please try again.");
      }
    });
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
                <div className="flex items-center gap-8">
                  <Link href={`/dashboard/solutions-projects/${p.id}/edit`} className="font-medium text-primary hover:underline">
                    {p.title}
                  </Link>
                  {p.isProtectedTemplate && (
                    <span title="Master template — always available as the base design" className="inline-flex items-center gap-4 rounded-full bg-surface-1 px-8 py-2 text-p4 font-semibold uppercase tracking-[1px] text-primary">
                      <Lock size={11} /> Master
                    </span>
                  )}
                </div>
                <div className="mt-2 text-p4 font-light text-neutral-5">/{p.slug} · {p.locale}</div>
              </td>
              <td className="px-24 py-16 text-p4 text-neutral-4">
                <div className="font-medium text-neutral-1">{p.menuLabel || "—"}</div>
                <div className="mt-2">
                  {GROUP_LABEL[p.menuGroup]} · #{p.menuOrder}
                  {!p.showInMegaMenu && <span className="ml-4 text-warning">(hidden)</span>}
                </div>
              </td>
              <td className="px-24 py-16"><StatusBadge status={p.status} /></td>
              <td className="px-24 py-16 text-p4 font-light text-neutral-5">
                {new Date(p.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-24 py-16">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/dashboard/solutions-projects/${p.id}/edit`} className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:bg-surface-2">Edit</Link>
                  {p.status === "PUBLISHED" && (
                    <a href={liveHref(p)} target="_blank" rel="noreferrer" className="rounded-8 px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:bg-surface-2">View</a>
                  )}
                  <button type="button" disabled={isPending} aria-label="Duplicate" onClick={() => onDuplicate(p.id)} className="rounded-8 p-8 text-neutral-4 hover:text-primary disabled:opacity-50"><Copy size={16} /></button>
                  {p.isProtectedTemplate ? (
                    <span title="This is a protected master template and cannot be deleted." className="rounded-8 p-8 text-neutral-8">
                      <Lock size={16} />
                    </span>
                  ) : (
                    <button type="button" disabled={isPending} aria-label="Delete" onClick={() => onDelete(p.id)} className={`rounded-8 p-8 hover:bg-error/5 disabled:opacity-50 ${confirmId === p.id ? "bg-error/10 text-error" : "text-error"}`}>
                      {confirmId === p.id ? <span className="text-p4 font-semibold uppercase">Sure?</span> : <Trash2 size={16} />}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
