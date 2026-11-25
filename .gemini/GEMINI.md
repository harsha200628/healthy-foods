# Project Workspace Instructions

Before writing or modifying any code in this repository, read and apply all skills inside `./.agents/skills/`. Never ship generic UI or unverified code.

## Non-Negotiable Standards

1. **Project-Local Skill Adherence**: Always consult the relevant playbooks and installed skills in `./.agents/skills/` before designing, coding, or auditing features.
2. **Visual Craft**: Every interface must feature intentional typography, cohesive design tokens, tactile states, and hardware-accelerated motion (`transform`/`opacity` only, respecting `prefers-reduced-motion`). No placeholder copy or broken assets.
3. **Strict Type Safety & Architecture**: Maintain TypeScript `strict: true` with zero `any`, Zod validation at external boundaries, clean separation of UI primitives, domain components, server handlers, and pure utilities, and passing `tsc --noEmit` + lint checks.
4. **Performance, SEO & Security**: Optimize Core Web Vitals (zero CLS, minimal client JS, optimized media), enforce semantic HTML, WCAG accessibility, route metadata + JSON-LD, and server-side input validation with zero exposed secrets.
5. **Browser QA Definition of Done**: Every UI change must be verified via the `/browser` subagent at desktop (`1440px`) and mobile (`390px`) viewports with zero console or network errors before completion.
