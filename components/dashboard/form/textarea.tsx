import { forwardRef, type TextareaHTMLAttributes } from "react";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`w-full resize-y rounded-8 border border-neutral-10 bg-white px-16 py-12 text-p3 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-5 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[invalid=true]:border-error ${className ?? ""}`}
      />
    );
  }
);

export default Textarea;
