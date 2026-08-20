import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Badge from "@/components/ui/Badge";

type SectionHeadingAlign = "left" | "center";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: SectionHeadingAlign;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-16",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <Heading level={2} size="h2">
        {title}
      </Heading>
      {description ? (
        <Text size="p2" className="max-w-600 text-neutral-6">
          {description}
        </Text>
      ) : null}
    </div>
  );
}
