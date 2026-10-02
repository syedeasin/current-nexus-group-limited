import Image from "next/image";

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const SIZES = {
  sm: { box: "h-36 w-36", text: "text-[12px]", px: 36 },
  md: { box: "h-40 w-40", text: "text-p4", px: 40 },
  lg: { box: "h-48 w-48", text: "text-p4", px: 48 },
  xl: { box: "h-72 w-72", text: "text-h5", px: 72 },
} as const;

/** Photo when the user has one, otherwise initials on the brand gradient. */
export default function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={s.px}
        height={s.px}
        className={`${s.box} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${s.box} ${s.text} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-tertiary font-semibold tracking-[0.5px] text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
