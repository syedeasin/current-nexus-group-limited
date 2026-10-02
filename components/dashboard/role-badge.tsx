import type { Role } from "@prisma/client";
import { ROLE_META } from "@/lib/roles";

export default function RoleBadge({ role, onDark = false }: { role: Role; onDark?: boolean }) {
  const meta = ROLE_META[role];
  return (
    <span
      className={`inline-flex items-center rounded-full px-10 py-2 text-[11px] font-semibold uppercase leading-[18px] tracking-[1.5px] ${
        onDark ? "bg-secondary/90 text-neutral-1" : meta.badge
      }`}
    >
      {meta.label}
    </span>
  );
}
