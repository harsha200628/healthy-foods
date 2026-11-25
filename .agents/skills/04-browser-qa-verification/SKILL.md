---
name: 04-browser-qa-verification
description: >-
  Mandatory Definition of Done for any UI or frontend change: ensure the dev
  server is running, use the browser subagent to inspect desktop (1440px) and
  mobile (390px) viewports, verify zero console or network errors, and fix any
  visual, layout, or functional defects before reporting completion.
---

# Browser QA Verification Playbook

No UI, styling, layout, or client-side feature change is complete until it has been rendered and visually verified in a live browser.

## Mandatory Definition of Done

1. **Ensure Local Server Is Running**:
   - Check whether the project's dev/preview server is already running; if not, start it in the background (e.g., `npm run dev`) and confirm its local URL/port.

2. **Delegate Live Inspection to the `/browser` Subagent**:
   - Open the target route(s) via the `browser` subagent (never rely solely on `curl` or unit tests to validate UI rendering).
   - Inspect **Desktop (`1440x900`)** and **Mobile (`390x844`)** viewports.
   - Check key interactive flows (navigation, buttons, forms, modals, hover/focus states, theme switches if present).

3. **Strict Pass Criteria**:
   - **Zero Console Errors**: No uncaught exceptions, React hydration mismatches, or runtime console errors.
   - **Zero Failed Network Requests**: No `4xx`/`5xx` asset, font, image, or API failures on load or interaction.
   - **Layout & Visual Integrity**: No horizontal scrollbars (`scrollWidth <= innerWidth`), no clipped/overlapping text, no broken images, proper alignment, crisp contrast, and cohesive spacing at both `1440px` and `390px`.

4. **Fix-and-Reverify Loop**:
   - If any visual, layout, console, or network issue is found, fix the root cause in code, re-run typecheck/lint, and re-verify in the `/browser` subagent before reporting completion to the user.
