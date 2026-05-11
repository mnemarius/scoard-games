# Business Logic

## Domain Model

Defined in `src/types/domain.ts`.

```
Game ──────────────────────────────────┐
  id, name, description?               │
  winRule: "highest" | "lowest"        │ binds
  categories: ScoreCategory[]          │
                                        │
Campaign ─────────────────────────────►┘
  id, name, notes?
  gameId          ← cannot be changed after creation
  playerIds[]

Session
  id, campaignId, playedAt, notes?
  scores: PlayerScore[]
    playerId
    categoryScores: Record<categoryId, number>
```

A **Game** defines the scoring schema (categories) and win direction. A **Campaign** binds one Game with a fixed set of Players and groups Sessions over time. A **Session** records one play: each player's score broken down by category.

## Scoring

All scoring logic lives in `src/utils/scoring.ts`. UI components must never reimplement this.

### Session total

`sessionTotal(score: PlayerScore): number`

Sums all `categoryScores` values for one player, ignoring non-finite values (NaN, Infinity).

### Session winners

`getSessionWinners(session, winRule): ID[]`

- `"highest"` — players with the maximum total win
- `"lowest"` — players with the minimum total win
- Ties produce multiple winners

### Leaderboard

`computeLeaderboard(sessions, game, playerIds): LeaderboardRow[]`

Aggregates across all sessions for each player:

| Column | Definition |
|--------|-----------|
| `sessionsPlayed` | sessions the player appeared in |
| `wins` | sessions where player was a winner |
| `totalPoints` | sum of all session totals |
| `averagePoints` | totalPoints / sessionsPlayed |
| `bestScore` | best individual session total (respects winRule direction) |

**Sort order:** wins DESC → total points (DESC for `highest`, ASC for `lowest`).

## Referential Integrity

Enforced in hooks, not the UI:

| Action | Guard |
|--------|-------|
| Delete a Game | Blocked if any Campaign references it (`useGames.isInUse`) |
| Delete a Player | Blocked if referenced by any Campaign or Session (`usePlayers.isInUse`) |
| Delete a Campaign | Allowed; **cascades** to delete all its Sessions (`useCampaigns.remove`) |

## Win Rule

`winRule` is set on the Game and controls two things:

1. Which player wins a session (`getSessionWinners`)
2. The sort direction of total points in the leaderboard

This means "lowest score wins" games (e.g. golf) rank correctly without special-casing in the UI.

## Campaign Immutability

The `gameId` on a Campaign cannot be changed after creation. The form `Select` for game is disabled in edit mode. This preserves consistency of the scoring schema across all sessions in a campaign.

## User Flow

1. Create a **Game** with scoring categories and a win rule.
2. Create **Players**.
3. Create a **Campaign** selecting the game and players (player list can be updated later).
4. Record **Sessions** — enter per-player, per-category scores.
5. View the **Leaderboard** on the Campaign detail page.

## Data Integrity Notes

- Storage keys are versioned under `scoard.v1.*`. Bump the prefix if any persisted shape changes — there is no migration path.
- All text inputs are trimmed before saving (names, descriptions, notes).
- Category IDs are generated at game-creation time and are stable — `categoryScores` keys in sessions reference them directly, so renaming or removing a category after sessions exist will silently drop or orphan those scores.