export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="group relative bg-white p-24 transition-colors duration-200 hover:bg-surface-1">
      <span className="absolute inset-x-0 top-0 h-0 bg-primary transition-all duration-200 group-hover:h-2" />
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">{label}</p>
      <p className="mt-4 text-h3 font-extralight leading-none text-neutral-1">{value}</p>
      {hint && <p className="mt-8 text-p4 font-light text-neutral-5">{hint}</p>}
    </div>
  );
}
