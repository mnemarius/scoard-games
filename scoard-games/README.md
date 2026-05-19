# Scoard — React app

The Scoard web client. For the high-level product idea, see the [root README](../README.md).

A Vite + React 19 + TypeScript SPA, styled with Tailwind v3, routed with `react-router-dom` v7, and persisted to Cloud Firestore.

## Getting started

```bash
npm install
npm run dev
```

### Environment

Create `.env.local` with your Firebase web-app config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR                      |
| `npm run build`   | Type-check (`tsc -b`) then production build   |
| `npm run lint`    | ESLint over the tree                          |
| `npm run preview` | Serve the built `dist/` locally               |

There is no test runner configured.

## Directory layout

```text
src/
├── pages/        route-level views (one per URL)
├── components/   shared UI building blocks (Modal, *Form, lists, layout)
├── context/      AppDataProvider + consumer hook (split across 3 files)
├── hooks/        entity hooks: useGames, usePlayers, useCampaigns, useSessions
├── lib/          firebase.ts — app/firestore/analytics init
├── data/         defaultGames.ts — seeded games for new users
├── storage/      collection / key naming
├── types/        domain.ts — Game, Player, Campaign, Session, ScoreCategory
├── utils/        pure helpers: scoring.ts, id.ts
├── theme/        Tailwind tokens / class composers
├── assets/       static images
├── App.tsx       route table
└── main.tsx      bootstrap, providers
```

## Architecture

### State flow

A single context, **`AppDataProvider`**, owns all four entity arrays (`games`, `players`, `campaigns`, `sessions`) and is the only place that talks to Firestore. **Every entity hook reads/writes through this provider.** Don't call Firestore directly from a feature — you'll fork state.

The context is intentionally split across three files so `react-refresh/only-export-components` stays happy:

- [src/context/appDataContextValue.ts](src/context/appDataContextValue.ts) — context object + state types
- [src/context/AppDataContext.tsx](src/context/AppDataContext.tsx) — the `AppDataProvider` component
- [src/context/useAppData.ts](src/context/useAppData.ts) — the consumer hook

### Entity hooks

`useGames`, `usePlayers`, `useCampaigns`, and `useSessions` all expose the same shape:

```ts
{ items, add, update, remove, getById }
```

…plus entity-specific extras:

- `useGames.isInUse(id)` / `usePlayers.isInUse(id)` — referential safety, used to block deletion when something is referenced.
- `useCampaigns.remove(id)` — **cascades** to delete the campaign's sessions.
- `useSessions.forCampaign(campaignId)` — filtered view.

When adding a new entity, match this contract.

### Domain model

See [src/types/domain.ts](src/types/domain.ts):

- `Game` owns `categories: ScoreCategory[]` and a `winRule: "highest" | "lowest"`.
- `Campaign` binds **one** `Game` + N `Player`s. The game cannot be changed after creation (UI enforces).
- `Session` holds `scores: PlayerScore[]`, each with `categoryScores` keyed by `category.id`. Total = sum of category scores.
- IDs come from [src/utils/id.ts](src/utils/id.ts) (`crypto.randomUUID` with a fallback).

### Scoring

Pure functions in [src/utils/scoring.ts](src/utils/scoring.ts):

- `getSessionWinners(session, game)` — winners for a single session. Ties produce multiple winners.
- `computeLeaderboard(sessions, players, game)` — ranks by **wins first, then total points**, respecting the game's `winRule`.

UI components should **never reimplement scoring** — always call through these helpers.

### Routing

`react-router-dom` v7 inside a single `<Layout>` shell:

| Path                                              | Page                                    |
| ------------------------------------------------- | --------------------------------------- |
| `/`                                               | Dashboard                               |
| `/games`                                          | Game list + create/edit modal           |
| `/players`                                        | Player list + create/edit modal         |
| `/campaigns`                                      | Campaign list + create modal            |
| `/campaigns/:id`                                  | Campaign detail + leaderboard           |
| `/campaigns/:id/sessions/new`                     | New session (`SessionFormPage`)         |
| `/campaigns/:id/sessions/:sessionId`              | Edit session (same `SessionFormPage`)   |

`SessionFormPage` branches on the presence of `sessionId` to decide create vs. edit.

## Conventions

- **Type-only imports** are required (`verbatimModuleSyntax: true` in [tsconfig.app.json](tsconfig.app.json)): use `import type { Foo } from "..."`.
- **No unused symbols** — `noUnusedLocals` and `noUnusedParameters` are on; unused names fail the build.
- **One file = one component family.** `react-refresh/only-export-components` forbids exporting non-component values from a component file. That's why context/provider/hook are three files in `src/context/`.
- **Styling is Tailwind.** Prefer utility classes over new CSS files. The `brand` palette (purple) is defined in [tailwind.config.js](tailwind.config.js).
- **Forms** use the local-state-in-form pattern wrapped in `<Modal>`. See `GameForm` and `CampaignForm` as templates.

## Storage

Firestore collections are namespaced via [src/storage/keys.ts](src/storage/keys.ts). If you make a breaking change to a persisted shape, bump the namespace — there is no migration code.

## Deployment

The app is hosted on Firebase Hosting:

- [firebase.json](firebase.json) — hosting config (SPA rewrites, `dist/` as the public dir).
- [firestore.rules](firestore.rules) — security rules.
- [firestore.indexes.json](firestore.indexes.json) — composite indexes.

CI lives at the repo root in [.github/workflows/](../.github/workflows/) — merges to `main` ship to production, PRs get preview channels.
