import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "lg" | "sm" | "xl";

interface ButtonSharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = ButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonSharedProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Icon size every button in the design uses, at every button size. Exported so
 * call sites pass `size={BUTTON_ICON_SIZE}` instead of guessing a number.
 */
export const BUTTON_ICON_SIZE = 20;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-secondary text-neutral-1 hover:bg-secondary/90",
  /** Glass button for dark sections (Figma node 4031:5043/4013:9986: white 5% fill, white 10% border, 10.45px blur). */
  secondary:
    "border border-white/10 bg-white/5 text-white backdrop-blur-[10.45px] hover:bg-white/10",
  outline:
    "border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-neutral-1",
  ghost: "bg-transparent text-neutral-1 hover:text-secondary",
};

/**
 * Figma button sizes: large is 32/18 padding at 20px text (60px tall), medium
 * is 24/12 at 18px text (48px tall). Both use an 8px gap and a pill radius.
 */
const sizeStyles: Record<ButtonSize, string> = {
  xl: "h-60 gap-8 px-32 text-btn-lg",
  lg: "h-48 gap-8 px-24 text-btn-sm",
  sm: "h-40 gap-6 px-20 text-btn-sm",
};

// Hover is a colour shift only and press is a 2% squeeze — deliberately small,
// so a page of buttons reads as calm. Timing comes from the motion tokens, and
// focus uses an outline (not a ring) so it stays visible on light and dark
// surfaces alike.
const baseStyles = [
  "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
  "transition-[background-color,border-color,color,transform] duration-[var(--dur-base)] ease-[var(--ease-out)]",
  "active:scale-[0.98]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
  "disabled:pointer-events-none disabled:opacity-50",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
].join(" ");

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "lg", className, children, href, ...rest } = props;
  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(rest as Omit<ComponentProps<typeof Link>, "href" | "className" | "children">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
