import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextSize = "p1" | "p2" | "p3" | "p4";
type TextWeight = "regular" | "medium" | "semibold";

interface TextProps {
  size?: TextSize;
  weight?: TextWeight;
  className?: string;
  children: ReactNode;
}

const sizeStyles: Record<TextSize, string> = {
  p1: "text-p1",
  p2: "text-p2",
  p3: "text-p3",
  p4: "text-p4",
};

const weightStyles: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

export default function Text({
  size = "p2",
  weight = "regular",
  className,
  children,
}: TextProps) {
  return (
    <p className={cn(sizeStyles[size], weightStyles[weight], className)}>{children}</p>
  );
}
