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
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
 