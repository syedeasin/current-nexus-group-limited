export default function FieldError({ id, children }: { id?: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-4 text-p4 text-error">
      {children}
    </p>
  );
}
