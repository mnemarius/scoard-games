# Scoard

A board-game score tracker for groups that play the same games over and over and want to know who's actually winning across the year.

## The idea

You sit down for a game of Catan, write the final scores on a napkin, and a week later it's gone. Scoard is the napkin that doesn't disappear.

You define each game **once** — its scoring categories and whether high or low score wins. You enter your regular crew as **players** once. From there you spin up a **campaign**: pick a game, pick the players, and every play between that group goes into one rolling tally. After every session Scoard updates the leaderboard, counts wins, breaks ties, and shows you the long arc of the rivalry.

It's intentionally small: no accounts, no social features, no marketplace. Score things, see who's ahead.

## Core concepts

- **Game** — a rule set. Owns a list of scoring categories (e.g. *Settlements*, *Cities*, *Longest Road*) and a `winRule` of `highest` or `lowest`.
- **Player** — a person. One shared roster across all your campaigns.
- **Campaign** — a game + a set of players, tracked together over time. The game is locked at creation so historical sessions stay meaningful.
- **Session** — a single play. Each player gets a score per category; totals, winners, and ties are derived automatically.
- **Leaderboard** — per campaign, ranked by wins first, then total points, in the direction the game's win rule dictates.

## What it's good at

- Tracking a long-running game night with the same group.
- Games with multi-category scoring where pen-and-paper gets messy.
- Settling "who's actually won more times" arguments with data.

## What it isn't

- A rules engine. Scoard doesn't know how Catan works; you tell it the categories.
- A multiplayer / live-sync app. One person enters the scores.
- A game database. You add the games you actually play.

## Project layout

```text
scoard-games/
├── scoard-games/         ← the React app — see its README for technical details
├── .github/workflows/    ← Firebase Hosting CI (auto-deploy on merge, PR previews)
├── docs/
└── CLAUDE.md             ← guidance for Claude Code working in this repo
```

The app is a client-side React 19 + TypeScript SPA backed by Cloud Firestore and deployed to Firebase Hosting. Implementation details, scripts, architecture, and environment setup live in [scoard-games/README.md](scoard-games/README.md).

## Deployment

- Pushes to `main` deploy to production via [.github/workflows/firebase-hosting-merge.yml](.github/workflows/firebase-hosting-merge.yml).
- Pull requests get a Firebase preview channel via [.github/workflows/firebase-hosting-pull-request.yml](.github/workflows/firebase-hosting-pull-request.yml).
