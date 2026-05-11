# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

The application lives in the `scoard-games/` subdirectory, not at the repo root. All `npm` commands must be run from there.

```
scoard-games/         ← Vite + React 19 + TS app (run npm here)
```

## Commands

All from inside `scoard-games/`:

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — typecheck (`tsc -b`) then production build via Vite
- `npm run lint` — ESLint over the whole tree
- `npm run preview` — serve the built `dist/`

There is no test runner configured.

## Architecture

Scoard is a **client-only board-game score tracker**. There is no backend; all state is persisted to `localStorage`. Pages, components, and hooks are the three structural layers.

### State flow (important)

A single context, `AppDataProvider`, owns all four entity arrays (`games`, `players`, `campaigns`, `sessions`) and persists each one to its own `localStorage` key. **Every entity hook reads/writes through this provider** — never instantiate `useLocalStorage` directly in a feature for these entities, or you'll create a divergent copy of state.

- `src/context/appDataContextValue.ts` — context object + state type (extracted so HMR/`react-refresh` lint stays happy)
- `src/context/AppDataContext.tsx` — `AppDataProvider` only
- `src/context/useAppData.ts` — consumer hook
- `src/hooks/useLocalStorage.ts` — generic, syncs across tabs via the `storage` event

### Entity hooks

`useGames`, `usePlayers`, `useCampaigns`, `useSessions` all share the same shape: `{ items, add, update, remove, getById }` plus entity-specific extras (e.g. `isInUse` for referential safety, `forCampaign` filtering on `useSessions`). When adding a new entity, follow this contract.

Referential integrity is enforced in the hooks, not the UI:
- `useGames.isInUse` / `usePlayers.isInUse` block deletion when the entity is referenced.
- `useCampaigns.remove` **cascades** to delete the campaign's sessions.

### Domain model (`src/types/domain.ts`)

- `Game` owns its scoring `categories: ScoreCategory[]` and a `winRule: "highest" | "lowest"`.
- `Campaign` binds **one** `Game` + N `Player`s and groups sessions across time. The game cannot be changed after creation (UI enforces this).
- `Session` records `scores: PlayerScore[]` where each `PlayerScore.categoryScores` is keyed by `category.id`. Session total = sum of category scores.
- IDs come from `src/utils/id.ts` (`crypto.randomUUID` with a fallback).

### Scoring (`src/utils/scoring.ts`)

Pure functions, no React. `computeLeaderboard` ranks by **wins first, then total points** in a direction that respects the game's `winRule` (high vs. low). Winners per session are determined by `getSessionWinners` — ties produce multiple winners. UI components should never reimplement this; always call through these helpers.

### Routing

`react-router-dom` v6 with a single `<Layout>` route shell. Routes:

- `/` Dashboard
- `/games`, `/players`, `/campaigns`
- `/campaigns/:id` (detail + leaderboard)
- `/campaigns/:id/sessions/new` and `/campaigns/:id/sessions/:sessionId` — both render `SessionFormPage` (it branches on `sessionId` for create vs. edit)

### Storage keys

All keyed under `scoard.v1.*` in `src/storage/keys.ts`. **Bump the prefix** if you make a breaking change to any persisted shape — there is no migration code.

## Conventions worth knowing

- `tsconfig.app.json` sets `verbatimModuleSyntax: true`, so type-only imports must use `import type { ... }`.
- `noUnusedLocals` and `noUnusedParameters` are on — unused symbols fail the build.
- ESLint uses `react-refresh/only-export-components`: a file that exports a React component should not also export non-component values (hooks, contexts, constants). This is why context value, provider, and consumer hook are split across three files in `src/context/`.
- Styling is Tailwind v3 with a custom `brand` palette (purple) in `tailwind.config.js`. There are no CSS modules; prefer Tailwind utility classes over new CSS files.
- Forms generally use the local-state-in-form pattern with a modal wrapper (`<Modal>` + a `*Form` component). See `GameForm` and `CampaignForm` for the template.