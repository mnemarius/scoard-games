import type { Game, Player } from "../types/domain";
import type { LeaderboardRow } from "../utils/scoring";

interface LeaderboardProps {
  rows: LeaderboardRow[];
  players: Player[];
  game: Game;
}

export function Leaderboard({ rows, players, game }: LeaderboardProps) {
  const getPlayer = (id: string) => players.find((p) => p.id === id);

  if (rows.length === 0) {
    return <p className="text-sm text-content-muted">No players in this campaign yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-content-muted border-b border-neutral-200">
            <th className="py-2 pr-4 font-medium">#</th>
            <th className="py-2 pr-4 font-medium">Player</th>
            <th className="py-2 pr-4 font-medium text-right">Wins</th>
            <th className="py-2 pr-4 font-medium text-right">Played</th>
            <th className="py-2 pr-4 font-medium text-right">Total</th>
            <th className="py-2 pr-4 font-medium text-right">Avg</th>
            <th className="py-2 font-medium text-right">Best</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const player = getPlayer(row.playerId);
            if (!player) return null;
            const isTop = idx === 0;
            return (
              <tr key={row.playerId} className="border-b border-neutral-100 last:border-b-0">
                <td className="py-2 pr-4 text-content-muted">{idx + 1}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-6 w-6 rounded-full flex items-center justify-center text-content-inverse text-xs font-semibold shrink-0"
                      style={{ backgroundColor: player.color ?? "#7c3aed" }}
                    >
                      {player.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className={`font-medium ${isTop ? "text-accent-700" : "text-content"}`}>
                      {isTop && <span className="mr-1">★</span>}
                      {player.name}
                    </span>
                  </div>
                </td>
                <td className="py-2 pr-4 text-right font-semibold text-content">{row.wins}</td>
                <td className="py-2 pr-4 text-right text-content-muted">{row.sessionsPlayed}</td>
                <td className="py-2 pr-4 text-right text-content-muted">{row.totalPoints}</td>
                <td className="py-2 pr-4 text-right text-content-muted">
                  {row.sessionsPlayed > 0 ? row.averagePoints.toFixed(1) : "—"}
                </td>
                <td className="py-2 text-right text-content-muted">
                  {row.bestScore === null ? "—" : row.bestScore}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-content-muted mt-2">
        Ranked by wins, then by {game.winRule === "highest" ? "total points (high)" : "total points (low)"}.
      </p>
    </div>
  );
}
