interface ChevronRightProps {
  size?: number;
  /** Stroke weight in viewBox units (viewBox is 7×12). Defaults to 2. */
  strokeWidth?: number;
  /**
   * Square size×size box with the chevron centred at 70% of its height, so it
   * lines up with the 20×20 arrow icons inside buttons. Without it the svg is
   * the bare 7×12 glyph (inline text links).
   */
  boxed?: boolean;
  className?: string;
}

/** 7×12 glyph centred in a square viewBox whose side is 12 / 0.7. */
const BOX = 12 / 0.7;
const BOXED_VIEWBOX = `${-(BOX - 7) / 2} ${-(BOX - 12) / 2} ${BOX} ${BOX}`;

export function ChevronRight({ size = 12, strokeWidth = 2, boxed = false, className }: ChevronRightProps) {
  const width = boxed ? size : (size * 7) / 12;
  return (
    <svg
      role="img"
      viewBox={boxed ? BOXED_VIEWBOX : "0 0 7 12"}
      width={width}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1 11L6 6L1 1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
