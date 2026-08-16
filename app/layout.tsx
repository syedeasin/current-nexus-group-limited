import type { ReactNode } from "react";

// The html and body tags live in app/[locale]/layout.tsx.
// This root layout only passes children through, which is the
// documented next-intl App Router pattern.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
