import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** "page" = 1440 content (Navbar/Footer). "section" = 1320 content (homepage sections). */
  size?: "page" | "section";
}

export default function Container({ children, className, size = "page" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-1600",
        size === "page" && "px-20 md:px-40 xl:px-80",
        size === "section" && "px-20 md:px-40 xl:px-140",
        className
      )}
    >
      {children}
    </div>
  );
}
