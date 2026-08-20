interface ChevronRightProps {
  size?: number;
  className?: string;
}

export function ChevronRight({ size = 12, className }: ChevronRightProps) {
  const width = (size * 7) / 12;
  return (
    <svg
      role="img"
      viewBox="0 0 7 12"
      width={width}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1 11L6 6L1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
