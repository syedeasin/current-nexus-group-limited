interface ArrowLeftProps {
  size?: number;
  className?: string;
}

export function ArrowLeft({ size = 20, className }: ArrowLeftProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15.833 10H4.167M8.333 5.833 4.167 10l4.166 4.167"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
