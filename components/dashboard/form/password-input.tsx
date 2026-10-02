"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Check, Copy, Eye, EyeOff, Wand2 } from "lucide-react";
import { PASSWORD_MIN, generatePassword, passwordStrength } from "@/lib/validation/password";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> & {
  /** Shows the 4-step strength meter and the policy hint under the field. */
  showStrength?: boolean;
  /** Adds "Generate" (fills a policy-compliant password and reveals it) and "Copy". */
  allowGenerate?: boolean;
  onValueChange?: (value: string) => void;
};

const BAR_COLORS = ["bg-neutral-10", "bg-error", "bg-warning", "bg-tertiary", "bg-success"];

export default function PasswordInput({
  showStrength,
  allowGenerate,
  onValueChange,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const strength = passwordStrength(value);

  function update(next: string) {
    setValue(next);
    setCopied(false);
    onValueChange?.(next);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => update(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          className={`w-full rounded-8 border border-neutral-10 bg-white py-12 pl-16 pr-48 text-p3 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-5 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[invalid=true]:border-error ${visible ? "font-mono tracking-[0.5px]" : ""} ${className ?? ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-6 top-1/2 flex h-36 w-36 -translate-y-1/2 items-center justify-center rounded-8 text-neutral-5 transition-colors duration-200 hover:bg-surface-1 hover:text-neutral-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {visible ? <EyeOff size={17} strokeWidth={1.5} aria-hidden="true" /> : <Eye size={17} strokeWidth={1.5} aria-hidden="true" />}
        </button>
      </div>

      {allowGenerate && (
        <div className="mt-8 flex flex-wrap gap-8">
          <button
            type="button"
            onClick={() => {
              update(generatePassword());
              setVisible(true);
            }}
            className="inline-flex items-center gap-6 rounded-full border border-neutral-10 bg-white px-12 py-6 text-p4 font-medium text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Wand2 size={14} strokeWidth={1.75} aria-hidden="true" />
            Generate strong password
          </button>
          {value && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-6 rounded-full border border-neutral-10 bg-white px-12 py-6 text-p4 font-medium text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {copied ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : <Copy size={14} strokeWidth={1.75} aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}

      {showStrength && (
        <div className="mt-10" aria-live="polite">
          <div className="flex gap-4" aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`h-4 flex-1 rounded-full transition-colors duration-200 ${
                  strength.score >= step ? BAR_COLORS[strength.score] : BAR_COLORS[0]
                }`}
              />
            ))}
          </div>
          <p className="mt-6 text-p4 text-neutral-5">
            {strength.label ? <span className="font-medium text-neutral-3">{strength.label}. </span> : null}
            At least {PASSWORD_MIN} characters, with a letter and a number.
          </p>
        </div>
      )}
    </div>
  );
}
