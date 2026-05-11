# Architecture

## Overview

Scoard is a client-only React 19 + TypeScript SPA built with Vite. There is no backend — all state is persisted to `localStorage`. The app tracks board-game scores across campaigns and sessions.

## File Structure

```
scoard-games/src/
├── App.tsx                  — router setup
├── main.tsx                 — entry point, mounts AppDataProvider
├── types/domain.ts          — all domain types
├── storage/keys.ts          — localStorage key constants
├── context/
│   ├── appDataContextValue.ts  — AppDataState interface (split for react-refresh lint)
│   ├── AppDataContext.tsx      — AppDataProvider component
│   └── useAppData.ts           — consumer hook
├── hooks/
│   ├── useLocalStorage.ts   — generic persistence hook (cross-tab sync)
│   ├── useGames.ts
│   ├── usePlayers.ts
│   ├── useCampaigns.ts
│   └── useSessions.ts
├── utils/
│   ├── id.ts                — crypto.randomUUID with fallback
│   ├── scoring.ts           — pure scoring/leaderboard functions
│   └── format.ts            — date formatting helpers
├── components/              — shared UI primitives and feature forms
└── pages/                   — one file per route
```

## State Flow

`AppDataProvider` owns all four entity arrays (`games`, `players`, `campaigns`, `sessions`) and persists each to its own `localStorage` key via `useLocalStorage`. Every entity hook reads and writes through this provider.

**Never** call `useLocalStorage` directly inside a feature for these entities — doing so creates a divergent state copy that won't sync with the rest of the app.

```
AppDataProvider
  └── useLocalStorage (per entity)
        └── entity hook (useGames, usePlayers, etc.)
              └── page / component
```

## Entity Hooks

All four hooks share the same contract:

```typescript
{ items, add, update, remove, getById }
```

Plus entity-specific extras:

| Hook | Extra |
|------|-------|
| `useGames` | `isInUse(id)` — blocks delete if referenced by a campaign |
| `usePlayers` | `isInUse(id)` — blocks delete if in any campaign or session |
| `useCampaigns` | `remove` cascades to delete the campaign's sessions |
| `useSessions` | `forCampaign(id)` filtered + DESC-sorted view; `allSessions` |

Referential integrity lives in the hooks, not the UI.

## Routing

`react-router-dom` v6, all routes nested under a `<Layout>` shell.

| Path | Page |
|------|------|
| `/` | DashboardPage |
| `/games` | GamesPage |
| `/players` | PlayersPage |
| `/campaigns` | CampaignsPage |
| `/campaigns/:id` | CampaignDetailPage |
| `/campaigns/:id/sessions/new` | SessionFormPage (create mode) |
| `/campaigns/:id/sessions/:sessionId` | SessionFormPage (edit mode) |
| `*` | NotFoundPage |

`SessionFormPage` branches on whether `sessionId` param is present.

## Persistence

Storage keys are all under the `scoard.v1.*` prefix, defined in `src/storage/keys.ts`. If a breaking change is made to any persisted shape, **bump the prefix** — there is no migration code.

`useLocalStorage` listens to the browser `storage` event for cross-tab sync.

## Key Constraints

- `tsconfig.app.json` sets `verbatimModuleSyntax: true` — type-only imports must use `import type`.
- `noUnusedLocals` and `noUnusedParameters` are on — unused symbols fail the build.
- The `react-refresh/only-export-components` ESLint rule is why context value, provider, and consumer hook live in three separate files under `src/context/`.
- IDs come from `src/utils/id.ts` — prefer `crypto.randomUUID`, falls back to timestamp + random bytes.