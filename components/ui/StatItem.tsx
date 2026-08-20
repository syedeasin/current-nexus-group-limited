import CountUp from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  className?: string;
}

export default function StatItem({ value, suffix, label, className }: StatItemProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start border-l-[1.5px] border-surface-1 pl-24 md:pl-40",
        className
      )}
    >
      <p className="text-h2 font-semibold text-neutral-1 max-[399px]:text-h3">
        <CountUp value={value} suffix={suffix} />
      </p>
      <p className="mt-8 text-p3 text-neutral-3">{label}</p>
    </div>
  );
}
