interface ArrowRightProps {
  size?: number;
  className?: string;
}

export function ArrowRight({ size = 20, className }: ArrowRightProps) {
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
        d="M4.167 10h11.666M11.667 5.833 15.833 10l-4.166 4.167"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
