import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.150"],
  // Type-checking is the memory-hungry part of `next build` — the production
  // server has ~900MB RAM and OOMs part-way through it. `npx tsc --noEmit` is
  // already the project's real type-check gate (run separately, before every
  // push — see CLAUDE.md), so the build itself doesn't need to repeat it.
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [],
    // Logo assets (footer wordmark, trusted-brand logos) are local SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // forbidden() → app/dashboard/forbidden.tsx when a role opens a dashboard
    // page it has no permission for (lib/auth.ts requirePageAccess).
    authInterrupts: true,
    serverActions: {
      // Must cover the largest upload (25MB documents, lib/upload-limits.ts)
      // plus multipart overhead — at 10mb, documents over ~10MB failed even
      // though the validator allows 25MB. nginx's client_max_body_size on the
      // server has to be at least this too.
      bodySizeLimit: "26mb",
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
 