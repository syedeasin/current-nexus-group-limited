"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { noticeClass, secondaryButtonClass } from "@/components/dashboard/ui-classes";
import type { FormResult } from "./actions";

/** A button that runs one server action and shows its outcome underneath. */
export default function ActionButton({
  action,
  children,
  pendingLabel,
}: {
  action: () => Promise<FormResult>;
  children: ReactNode;
  pendingLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);

  async function handleClick() {
    setPending(true);
    setResult(null);
    try {
      const next = await action();
      setResult(next);
      if (next.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "Couldn't reach the server. Check your connection and try again." });
    }
    setPending(false);
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={pending} className={secondaryButtonClass}>
        {pending ? pendingLabel : children}
      </button>
      {result && (
        <p role={result.ok ? "status" : "alert"} className={`mt-12 ${result.ok ? noticeClass.success : noticeClass.error}`}>
          {result.ok ? result.message : result.error}
        </p>
      )}
    </div>
  );
}
