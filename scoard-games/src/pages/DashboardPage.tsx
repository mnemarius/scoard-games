import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { NewSessionPicker } from "../components/NewSessionPicker";
import { PageHeader } from "../components/PageHeader";
import { StatTile } from "../components/StatTile";
import { useCampaigns } from "../hooks/useCampaigns";
import { useGames } from "../hooks/useGames";
import { usePlayers } from "../hooks/usePlayers";
import { useSessions } from "../hooks/useSessions";
import { formatDate } from "../utils/format";
import { getSessionTotals, getSessionWinners, sessionTotal } from "../utils/scoring";

export function DashboardPage() {
  const { games } = useGames();
  const { players } = usePlayers();
  const { campaigns } = useCampaigns();
  const { allSessions } = useSessions();
  const [picking, setPicking] = useState(false);

  const recentSessions = allSessions
    .slice()
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Track scores across your board game campaigns."
        action={<Button onClick={() => setPicking(true)}>+ New session</Button>}
      />

      <Modal
        open={picking}
        onClose={() => setPicking(false)}
        title="New session — pick a campaign"
        size="lg"
      >
        <NewSessionPicker
          campaigns={campaigns}
          games={games}
          sessions={allSessions}
          onClose={() => setPicking(false)}
        />
      </Modal>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatTile label="Games" value={games.length} />
        <StatTile label="Players" value={players.length} />
        <StatTile label="Campaigns" value={campaigns.length} />
        <StatTile label="Sessions" value={allSessions.length} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-content">Recent sessions</h2>
            <Link
              to="/campaigns"
              className="text-xs text-primary-700 hover:text-primary-800 hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <div>
          {recentSessions.length === 0 ? (
            <div className="px-5 py-4">
              <EmptyState
                title="No sessions yet"
                description="Record a session inside a campaign to start filling the leaderboard."
              />
            </div>
          ) : (
            <ul>
              {recentSessions.map((s) => {
                const campaign = campaigns.find((c) => c.id === s.campaignId);
                const game = campaign ? games.find((g) => g.id === campaign.gameId) : undefined;
                const winnerIds = game ? getSessionWinners(s, game.winRule) : [];
                const winner = winnerIds[0] ? players.find((p) => p.id === winnerIds[0]) : undefined;
                const winnerTotal = winner
                  ? sessionTotal(s.scores.find((sc) => sc.playerId === winner.id)!)
                  : null;
                const totalSum = getSessionTotals(s).reduce((acc, t) => acc + t.total, 0);
                const to = campaign ? `/campaigns/${campaign.id}/sessions/${s.id}` : "/campaigns";
                return (
                  <li key={s.id} className="border-b border-neutral-100 last:border-b-0">
                    <Link
                      to={to}
                      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-primary-50"
                    >
                      {winner ? (
                        <span
                          className="h-7 w-7 rounded-full flex items-center justify-center text-content-inverse text-xs font-semibold shrink-0"
                          style={{ backgroundColor: winner.color ?? "rgb(var(--color-primary-600))" }}
                          aria-hidden
                        >
                          {winner.name.slice(0, 1).toUpperCase()}
                        </span>
                      ) : (
                        <span className="h-7 w-7 rounded-full bg-neutral-200 shrink-0" aria-hidden />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-content truncate">
                          {campaign?.name ?? "Unknown campaign"}
                        </div>
                        <div className="text-xs text-content-muted truncate">
                          {winner ? (
                            <>
                              <span className="text-accent-600">★</span> {winner.name}
                              {winnerTotal !== null && ` · ${winnerTotal} pts`}
                            </>
                          ) : (
                            <>No winner recorded · {totalSum} pts total</>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-content-subtle whitespace-nowrap">
                        {formatDate(s.playedAt)}
                      </span>
                      <span
                        className="text-content-subtle group-hover:text-primary-700 transition-colors"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
