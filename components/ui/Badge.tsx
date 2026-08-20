import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  children: ReactNode;
}

export default function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-surface-1 px-12 py-4 text-badge font-medium text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
