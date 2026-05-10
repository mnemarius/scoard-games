import type { Game, ID, PlayerScore, Session, WinRule } from "../types/domain";

export function sessionTotal(score: PlayerScore): number {
  return Object.values(score.categoryScores).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
}

export interface SessionTotal {
  playerId: ID;
  total: number;
}

export function getSessionTotals(session: Session): SessionTotal[] {
  return session.scores.map((s) => ({ playerId: s.playerId, total: sessionTotal(s) }));
}

export function getSessionWinners(session: Session, winRule: WinRule): ID[] {
  const totals = getSessionTotals(session);
  if (totals.length === 0) return [];
  const best = totals.reduce(
    (acc, t) => (winRule === "highest" ? Math.max(acc, t.total) : Math.min(acc, t.total)),
    winRule === "highest" ? -Infinity : Infinity,
  );
  return totals.filter((t) => t.total === best).map((t) => t.playerId);
}

export interface LeaderboardRow {
  playerId: ID;
  sessionsPlayed: number;
  wins: number;
  totalPoints: number;
  averagePoints: number;
  bestScore: number | null;
}

export function computeLeaderboard(sessions: Session[], game: Game, playerIds: ID[]): LeaderboardRow[] {
  const rows = new Map<ID, LeaderboardRow>();
  for (const pid of playerIds) {
    rows.set(pid, {
      playerId: pid,
      sessionsPlayed: 0,
      wins: 0,
      totalPoints: 0,
      averagePoints: 0,
      bestScore: null,
    });
  }

  for (const session of sessions) {
    const winners = new Set(getSessionWinners(session, game.winRule));
    for (const score of session.scores) {
      const row = rows.get(score.playerId);
      if (!row) continue;
      const total = sessionTotal(score);
      row.sessionsPlayed += 1;
      row.totalPoints += total;
      if (winners.has(score.playerId)) row.wins += 1;
      if (
        row.bestScore === null ||
        (game.winRule === "highest" ? total > row.bestScore : total < row.bestScore)
      ) {
        row.bestScore = total;
      }
    }
  }

  for (const row of rows.values()) {
    row.averagePoints = row.sessionsPlayed > 0 ? row.totalPoints / row.sessionsPlayed : 0;
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return game.winRule === "highest" ? b.totalPoints - a.totalPoints : a.totalPoints - b.totalPoints;
  });
}
