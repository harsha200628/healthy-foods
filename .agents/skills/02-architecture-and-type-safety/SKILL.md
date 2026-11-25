---
name: 02-architecture-and-type-safety
description: >-
  Enforce strict TypeScript, runtime schema validation with Zod, clean modular
  architecture separating UI primitives, domain components, API/server handlers,
  and pure utilities, plus mandatory typecheck and lint verification.
---

# Architecture & Type Safety Playbook

All application code in this repository must meet strict engineering standards with zero type escapes and clean separation of concerns.

## 1. Strict TypeScript Discipline

- **Compiler Strictness**: Maintain `"strict": true` (and `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes` where applicable) in `tsconfig.json`.
- **Zero `any` Policy**: Never use `any`, `@ts-ignore`, or unsafe type assertions (`as Foo`) to silence compiler errors. Use `unknown` with explicit type guards or schema parsing instead.
- **Explicit Contracts**: Define clear TypeScript `interface` / `type` contracts for component props, domain entities, API payloads, and return values.
- **Runtime Boundary Validation**: Validate all untrusted inputs (route params, query strings, request bodies, form payloads, environment variables, and external API responses) at the boundary using **Zod** schemas and derive static types via `z.infer<typeof schema>`.

## 2. Clean Modular Architecture

Keep layers decoupled, small, and single-purpose:

- **UI Primitives (`components/ui/`)**: Reusable, domain-agnostic, accessible building blocks (buttons, inputs, dialogs, surfaces) styled via tokens. No business logic or data fetching.
- **Domain Components (`components/<feature>/`)**: Feature-specific compositions that assemble primitives and present domain state. Keep data-fetching separated from pure presentation where practical.
- **Server Actions / API Handlers (`app/api/` or `server/`)**: Thin boundary handlers responsible for authentication/authorization, Zod input validation, rate/error handling, and delegating business logic to domain services.
- **Pure Utilities & Domain Logic (`lib/` / `utils/`)**: Deterministic, side-effect-free functions (formatting, calculations, state transforms) that are straightforward to unit test.
- **No Logic Duplication**: Extract shared helpers or data-driven mappings instead of repeating conditional branches or view blocks.

## 3. Mandatory Build & Lint Gate

Before reporting any task as complete:

1. Run TypeScript typechecking (`npx tsc --noEmit` or project script) and verify **0 errors**.
2. Run the project linter (`npm run lint` / `eslint` / `biome`) and verify **0 errors** (and resolve warnings introduced by your changes).
3. Run relevant unit/integration tests and production build checks (`npm run build` when structural/routing changes occur).
