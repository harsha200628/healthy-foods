---
name: 01-visual-craft-and-motion
description: >-
  Enforce bespoke, agency-grade visual design, intentional typography scales,
  cohesive design tokens, layered surfaces, tactile interaction states, and
  hardware-accelerated micro-interactions for all UI work in this project.
---

# Visual Craft & Motion Playbook

Every component, layout, and page in this project must look custom-crafted rather than generic or template-generated.

## 1. Visual Hierarchy, Typography & Tokens

- **Intentional Type Scale**: Define clear typographic contrast (display, heading, body, caption, mono) with deliberate font pairings, optical tracking, and tight line-heights on headings (`1.05`–`1.2`) vs. comfortable reading measure (`55ch`–`72ch`, line-height `1.5`–`1.65`) on body copy.
- **Cohesive Color Tokens**: Use semantic CSS custom properties (`--bg-canvas`, `--bg-surface`, `--bg-elevated`, `--text-primary`, `--text-muted`, `--border-subtle`, `--accent-primary`) rather than scattered raw hex/utility overrides. Ensure light and dark surfaces maintain crisp contrast ratios (WCAG AA minimum: `4.5:1` normal text, `3:1` large text/UI graphics).
- **Layered Depth & Borders**: Prefer subtle hairline borders (`1px solid`), surface elevation stepping, and multi-layered soft shadows over flat boxes or heavy drop shadows. Use inner highlights or subtle translucency deliberately where it adds clarity.
- **Responsive Rhythm**: Design layouts with fluid spacing, CSS Grid/Flexbox discipline, and zero horizontal overflow at any viewport (`320px` to `1440px+`).

## 2. Tactile States & Micro-Interactions

- **Interactive Affordance**: Every interactive element (`button`, `a`, `input`, `select`, card link, menu item) must have distinct, well-crafted `:hover`, `:focus-visible`, `:active`, and `:disabled` states.
- **Hardware-Accelerated Motion Only**: Animate exclusively `transform` and `opacity` (and composited `clip-path`/`filter` only when justified). Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- **Fluid Easing & Timing**: Use crisp, natural curves (e.g., `cubic-bezier(0.22, 1, 0.36, 1)`) and purposeful durations (`120ms`–`220ms` for micro-feedback, `280ms`–`450ms` for view transitions).
- **Reduced Motion Compliance**: Wrap non-essential motion and transitions in `@media (prefers-reduced-motion: reduce)` or motion-library equivalents so reduced-motion users experience instant, calm state changes.

## 3. Strict Quality Bans

- **Zero Placeholder Content**: Never ship "lorem ipsum", dummy names ("John Doe"), fake placeholder metrics, or dead `href="#"` links. Write realistic, domain-authentic copy.
- **Zero Broken Media**: Every `<img>`, `<video>`, `<svg>`, or icon must resolve cleanly with explicit dimensions/aspect ratios.
- **Zero Unstyled Browser Defaults**: Never leave unstyled `<input>`, `<select>`, `<checkbox>`, `<dialog>`, or default blue focus outlines without intentional styling and accessible `:focus-visible` rings.
