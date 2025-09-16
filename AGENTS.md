# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/` (React + TypeScript). Key folders: `components/`, `sections/`, `pages/`, `routes/`, `services/`, `api/`, `hooks/`, `utils/`, `types/`, `i18n/`, `theme/`.
- Static assets: `public/`; built output: `dist/`; docs: `docs/`; samples: `sample/`.
- Import aliases: use `@/` or `src/` (e.g., `import Button from '@/components/ui/button'`). Entry points: `src/main.tsx`, `src/app.tsx`.

## Build, Test, and Development Commands
- `npm run dev` or `yarn dev`: start Vite dev server.
- `npm run build` or `yarn build`: production build to `dist/`.
- `npm run preview` or `yarn preview`: serve the build locally (default port 8080 here).
- `npm run lint` / `npm run lint:fix`: run ESLint (Airbnb + Prettier) and auto-fix.
- `npm run prettier`: format `src/**/*.{js,jsx,ts,tsx}`.
- Useful cleanup: `yarn rm:all` then `yarn install` to reset dependencies.

## Coding Style & Naming Conventions
- Formatting via Prettier: 2 spaces, `singleQuote: true`, `trailingComma: 'es5'`.
- ESLint config extends Airbnb; many ergonomics rules relaxed; keep code readable and consistent.
- TypeScript is strict (no `any`); colocate types in `src/types/` when shared.
- React: components and hooks in PascalCase/CamelCase (`UserCard.tsx`, `useAuth.ts`); file names for components should match the component.
- CSS: Tailwind in `src/global.css` plus theme utilities in `src/theme/`.

## Testing Guidelines
- No unit test runner is configured yet. If adding tests, prefer Vitest + React Testing Library; name files `*.test.tsx` under the same folder as the unit.
- Keep coverage meaningful for hooks, utils, and complex components.

## Commit & Pull Request Guidelines
- Commits: imperative present (“add dashboard layout”), scoped when helpful (`factory:`). Keep subject ≤ 72 chars.
- PRs: include a concise description, screenshots/GIFs for UI changes, and linked issues. Note breaking changes and steps to verify.

## Security & Configuration Tips
- Environment variables must be prefixed with `VITE_` (Vite requirement). Store in `.env` locally; do not commit secrets.
- Network and OPC UA endpoints should be configured via env or `src/config/`—avoid hard-coding.
