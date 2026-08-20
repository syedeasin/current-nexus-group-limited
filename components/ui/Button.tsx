import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
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

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-secondary text-neutral-1 hover:bg-secondary/90",
  outline:
    "border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-neutral-1",
  ghost: "bg-transparent text-neutral-1 hover:text-secondary",
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: "h-48 gap-8 px-28 text-btn-lg",
  sm: "h-40 gap-6 px-20 text-btn-sm",
  xl: "h-60 gap-8 px-32 text-btn-lg",
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-50 disabled:pointer-events-none";

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
