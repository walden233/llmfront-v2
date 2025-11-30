# Repository Guidelines

## Project Structure & Module Organization
- Vue 3 + TypeScript + Vite app; main code in `src/` with `components/` for reusable UI, `views/` for pages, `api/` for HTTP wrappers, `router/` for routes, `stores/` for Pinia, `types/` for shared typings, `utils/` for helpers, `assets/` for static files, and `styles/` for SCSS variables/global styles.
- Public files served as-is live in `public/`. Build output goes to `dist/`. Environment presets live under `env/` (keep secrets in untracked local files).
- Path alias `@/` maps to `src/`. Auto-imports are configured for Vue, Vue Router, VueUse, Element Plus, and Arco components.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — type-check via `vue-tsc -b` then produce production build.
- `npm run preview` — serve the built `dist/` locally for a production-like check.

## Coding Style & Naming Conventions
- Use `<script setup>` with the Composition API; TypeScript strict mode is enabled—prefer explicit types on public interfaces and API payloads.
- Components in `PascalCase.vue`; composables as `useX.ts`; Pinia stores as `useXStore.ts`; utilities/helpers in `camelCase.ts`.
- Keep imports using `@/` aliases; avoid relative path climbing.
- SCSS is standard; prefer shared tokens from `styles/`. Follow framework defaults when using Element Plus/Arco components.

## Testing Guidelines
- No test runner is configured yet; prefer adding Vitest with Vue Test Utils when introducing tests.
- Place future specs near source (e.g., `src/components/__tests__/MyComp.spec.ts`) and cover interaction states and data formatting. Run the suite locally before pushing.

## Commit & Pull Request Guidelines
- Commit messages are short and in Chinese (e.g., `初步实现`, `多模态输入`). Commit often with focused scope.
- Before a PR, ensure `npm run build` passes. Include a brief description, linked issues, and UI screenshots/GIFs for visual changes.
- Keep diffs small, note breaking changes explicitly, and document new environment variables or configuration steps.

## Security & Configuration Tips
- Do not commit secrets; use local `.env` files and reference examples in `env/`. Validate API base URLs and keys per environment.
- If adding network calls, centralize them in `api/` and type responses. Handle errors gracefully and avoid leaking stack traces in UI.
