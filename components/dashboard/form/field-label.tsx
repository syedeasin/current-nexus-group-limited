import type { LabelHTMLAttributes } from "react";

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export default function FieldLabel({
  required,
  children,
  className,
  ...props
}: FieldLabelProps) {
  return (
    <label
      {...props}
      className={`mb-8 block text-p4 font-medium text-neutral-4 ${className ?? ""}`}
    >
      {children}
      {required && (
        <>
          <span aria-hidden="true" className="ml-4 text-error">
            *
          </span>
          <span className="sr-only"> required</span>
        </>
      )}
    </label>
  );
}
