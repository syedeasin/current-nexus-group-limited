# Project rules
- Next.js 14 App Router + TypeScript + Tailwind + Supabase
- Never run `npm run build` while dev server is live, it corrupts .next
- Type-check with `npx tsc --noEmit` only
- All site level values live in site.config.ts, never hardcode
- Design priority: conversion, then accessibility (WCAG 2.1 AA), then hierarchy
- Use @/* path alias for all internal imports