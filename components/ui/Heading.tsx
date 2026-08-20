import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  level: HeadingLevel;
  size: HeadingSize;
  className?: string;
  children: ReactNode;
}

const sizeStyles: Record<HeadingSize, string> = {
  h1: "text-h1 font-semibold",
  h2: "text-h2 font-semibold",
  h3: "text-h3 font-semibold",
  h4: "text-h4 font-semibold",
  h5: "text-h5 font-semibold",
  h6: "text-h6 font-semibold",
};

export default function Heading({ level, size, className, children }: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  return <Tag className={cn(sizeStyles[size], className)}>{children}</Tag>;
}
