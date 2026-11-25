---
name: 03-performance-seo-and-security
description: >-
  Enforce Core Web Vitals optimization, semantic HTML, WCAG accessibility,
  complete route metadata and JSON-LD structured data, and production security
  best practices across every route and API endpoint.
---

# Performance, SEO & Security Playbook

Every page, component, and endpoint must perform at a 100/100 production level across Core Web Vitals, technical SEO, accessibility, and security.

## 1. Core Web Vitals & Performance

- **Zero Layout Shift (CLS)**: Always reserve explicit dimensions (`width`/`height`, `aspect-ratio`, skeleton placeholders matching final geometry) for images, media, embeds, and async UI regions. Preload critical fonts with `font-display: swap` or Next.js font optimization.
- **Minimal Client JavaScript**: Prefer Server Components / static rendering by default. Push `"use client"` boundaries down to the smallest interactive leaves. Eliminate request waterfalls by parallelizing independent fetches (`Promise.all`) and streaming slow sections.
- **Optimized Assets**: Serve responsive, modern image formats (AVIF/WebP) with proper `sizes` attributes, `priority` on the above-the-fold LCP hero asset only, and lazy loading (`loading="lazy"`) for below-the-fold media and heavy offscreen modules (dynamic imports).

## 2. Semantic HTML, Accessibility & Technical SEO

- **Semantic Landmarks**: Use proper landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`) and a strict single-`<h1>` heading hierarchy (`<h1>` -> `<h2>` -> `<h3>`, never skipping levels for styling).
- **Full Accessibility**: Provide descriptive `alt` text (empty `alt=""` for decorative images), accessible labels (`aria-label` / `aria-labelledby` / `<label htmlFor>`), proper `<button type="button|submit">` vs `<a href>` semantics, and full keyboard navigation (`Tab`, `Enter`, `Space`, `Escape`, focus trapping in modals).
- **Metadata & Structured Data**: Every public route must export complete metadata (`title`, `description`, canonical URL, `openGraph`, `twitter` card tags, and valid `robots` directives) plus accurate JSON-LD (`application/ld+json`) structured data matching page content.

## 3. Security Hardening

- **Input & Output Hygiene**: Sanitize and validate all user inputs server-side (never trust client validation alone). Prevent XSS (never inject unsanitized HTML via `dangerouslySetInnerHTML`) and SQL/command injection (use parameterized queries/ORM bindings).
- **CSRF, Auth & Abuse Protection**: Enforce authentication and authorization checks inside every protected Server Action and API route. Use `SameSite` cookies / CSRF protections on state-changing requests and apply rate-limiting patterns on sensitive/public mutation endpoints.
- **Zero Exposed Secrets**: Keep API keys, tokens, and credentials strictly server-side (never prefix private secrets with `NEXT_PUBLIC_` or `VITE_`, and never commit `.env` values or hardcode secrets in source).
