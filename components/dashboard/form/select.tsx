import { forwardRef, type SelectHTMLAttributes } from "react";

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        className={`w-full rounded-8 border border-neutral-10 bg-white px-16 py-12 text-p3 text-neutral-1 outline-none transition-colors duration-200 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[invalid=true]:border-error ${className ?? ""}`}
      >
        {children}
      </select>
    );
  }
);

export default Select;
