"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Select from "@/components/dashboard/form/select";
import { dangerButtonClass, noticeClass } from "@/components/dashboard/ui-classes";
import { deleteUser } from "./actions";

type Props = {
  user: { id: string; name: string; postCount: number };
  heirs: { id: string; name: string }[];
  defaultHeirId: string;
};

export default function UserDeletePanel({ user, heirs, defaultHeirId }: Props) {
  const router = useRouter();
  const [heir, setHeir] = useState(defaultHeirId);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstName = user.name.split(" ")[0];
  const armed = confirmText.trim().toLowerCase() === "delete";

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      const result = await deleteUser(user.id, heir);
      if (result.ok) {
        router.replace("/dashboard/users");
        router.refresh();
        return;
      }
      setError(result.error);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setPending(false);
  }

  return (
    <section className="rounded-16 border border-error/25 bg-white p-24 lg:p-32" aria-labelledby="danger-heading">
      <h2 id="danger-heading" className="text-h6 font-extralight tracking-[-0.2px] text-error">
        Delete account
      </h2>
      <p className="mt-6 text-p4 font-light leading-relaxed text-neutral-5">
        Permanently removes {firstName}&apos;s login. Images, downloads and pages they created stay on the site. To pause
        access instead, deactivate the account.
      </p>

      {error && <div role="alert" className={`mt-16 ${noticeClass.error}`}>{error}</div>}

      <div className="mt-20 space-y-16">
        {user.postCount > 0 && (
          <div>
            <label htmlFor="heir" className="mb-8 block text-p4 font-medium text-neutral-4">
              Give {firstName}&apos;s {user.postCount} {user.postCount === 1 ? "post" : "posts"} to
            </label>
            <Select id="heir" value={heir} onChange={(e) => setHeir(e.target.value)}>
              {heirs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <label htmlFor="confirm-delete" className="mb-8 block text-p4 font-medium text-neutral-4">
            Type <span className="font-mono font-semibold text-neutral-1">delete</span> to confirm
          </label>
          <input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            className="w-full rounded-8 border border-neutral-10 bg-white px-16 py-12 text-p3 text-neutral-1 outline-none focus:border-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          />
        </div>
        <button type="button" onClick={handleDelete} disabled={!armed || pending} className={dangerButtonClass}>
          <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
          {pending ? "Deleting…" : `Delete ${firstName}'s account`}
        </button>
      </div>
    </section>
  );
}
