import TextInput from "@/components/dashboard/form/text-input";
import FieldHint from "@/components/dashboard/form/field-hint";

/**
 * Alt text for the image field directly above it. Left empty, the image
 * renders as decorative (skipped by screen readers) — that's a valid choice,
 * not an error, for photos that don't add information beyond the surrounding
 * copy. Shared by every dashboard editor (Manufacturing, Solutions & Projects)
 * so the accessibility-editing experience is identical across both.
 */
export default function AltField({
  url,
  value,
  onChange,
}: {
  url: string;
  value: string;
  onChange: (v: string) => void;
}) {
  if (!url) return null;
  return (
    <div className="mt-8">
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="Alt text (leave empty if purely decorative)" />
      <FieldHint>Describe what the image communicates for users who cannot see it.</FieldHint>
    </div>
  );
}
