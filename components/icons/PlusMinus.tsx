interface PlusMinusProps {
  isOpen: boolean;
  size?: number;
  className?: string;
}

/**
 * Same control in two states (Figma nodes "plus" / "minus-sign"): the
 * horizontal stroke is always drawn, the vertical stroke scales to 0 on
 * open so the plus collapses into a minus instead of swapping icons.
 */
export function PlusMinus({ isOpen, size = 20, className }: PlusMinusProps) {
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
        d="M16.6614 10.0026H3.32812"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99477 3.33594V16.6693"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="origin-center transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: isOpen ? "scaleY(0)" : "scaleY(1)" }}
      />
    </svg>
  );
}
