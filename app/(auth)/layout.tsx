import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { switzer } from "@/app/fonts";
import { siteConfig } from "@/site.config";
import "@/app/globals.css";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${switzer.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface-2">
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* Brand panel — decorative context for the form, hidden on small screens. */}
          <aside className="relative hidden overflow-hidden bg-neutral-1 lg:flex lg:flex-col lg:justify-between lg:p-56">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-160 -top-160 h-480 w-480 rounded-full bg-tertiary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-200 -left-120 h-420 w-420 rounded-full bg-secondary/10 blur-3xl"
            />
            <Link
              href="/"
              className="relative w-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary"
            >
              <Image src="/logos/cnx-logo-white.svg" alt={`${siteConfig.name} — back to the website`} width={161} height={40} className="h-40 w-auto" priority />
            </Link>
            <div className="relative max-w-[440px]">
              <span aria-hidden="true" className="mb-24 block h-2 w-48 bg-secondary" />
              <p className="text-h3 font-extralight leading-tight tracking-[-0.5px] text-white">
                Content studio for {siteConfig.name}
              </p>
              <p className="mt-16 text-p3 font-light leading-relaxed text-white/55">
                Manage pages, news, products and downloads for the public website — in English and French.
              </p>
            </div>
            <p className="relative text-p4 font-light text-white/30">© {new Date().getFullYear()} {siteConfig.legalName}</p>
          </aside>

          <main className="flex items-center justify-center px-16 py-48 sm:px-32">
            <div className="w-full max-w-[440px]">
              <Link
                href="/"
                className="mb-40 inline-block lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <Image src="/logos/cnx-logo-dark.svg" alt={`${siteConfig.name} — back to the website`} width={129} height={32} className="h-32 w-auto" priority />
              </Link>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
