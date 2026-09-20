import type { ReactNode } from "react";

export default function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-4 text-p4 text-neutral-5">
      {children}
    </p>
  );
}
