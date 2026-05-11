import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { CampaignForm } from "../components/CampaignForm";
import { Card, CardBody, CardHeader } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Leaderboard } from "../components/Leaderboard";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useAppData } from "../context/useAppData";
import { useCampaigns } from "../hooks/useCampaigns";
import { useSessions } from "../hooks/useSessions";
import { formatDate } from "../utils/format";
import { computeLeaderboard, getSessionTotals, getSessionWinners } from "../utils/scoring";

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games, players } = useAppData();
  const { getById, update, remove } = useCampaigns();
  const { sessions, remove: removeSession } = useSessions(id);
  const [editing, setEditing] = useState(false);

  const campaign = id ? getById(id) : undefined;
  const game = campaign ? games.find((g) => g.id === campaign.gameId) : undefined;

  const leaderboard = useMemo(() => {
    if (!campaign || !game) return [];
    return computeLeaderboard(sessions, game, campaign.playerIds);
  }, [sessions, campaign, game]);

  if (!campaign) {
    return (
      <div>
        <PageHeader title="Campaign not found" />
        <Link to="/campaigns" className="text-primary-700 hover:text-primary-800 hover:underline text-sm">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  if (!game) {
    return (
      <div>
        <PageHeader title={campaign.name} subtitle="The game for this campaign was deleted." />
        <Link to="/campaigns" className="text-primary-700 hover:text-primary-800 hover:underline text-sm">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Delete "${campaign.name}" and all its sessions?`)) {
      remove(campaign.id);
      navigate("/campaigns");
    }
  };

  return (
    <div>
      <div className="mb-2">
        <Link to="/campaigns" className="text-sm text-content-muted hover:text-primary-700">
          ← Campaigns
        </Link>
      </div>
      <PageHeader
        title={campaign.name}
        subtitle={`${game.name} · ${campaign.playerIds.length} players · ${sessions.length} sessions`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" tone="neutral" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="ghost" tone="danger" onClick={handleDelete}>
              Delete
            </Button>
            <Link to={`/campaigns/${campaign.id}/sessions/new`}>
              <Button>+ New session</Button>
            </Link>
          </div>
        }
      />

      {campaign.notes && (
        <Card className="mb-6">
          <CardBody>
            <p className="text-sm text-content whitespace-pre-wrap">{campaign.notes}</p>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-content">Leaderboard</h2>
        </CardHeader>
        <CardBody>
          <Leaderboard rows={leaderboard} players={players} game={game} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-content">Sessions</h2>
        </CardHeader>
        <CardBody>
          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              description="Record a session to start filling the leaderboard."
              action={
                <Link to={`/campaigns/${campaign.id}/sessions/new`}>
                  <Button>Record first session</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {sessions.map((s) => {
                const totals = getSessionTotals(s);
                const winners = new Set(getSessionWinners(s, game.winRule));
                return (
                  <li key={s.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-content">{formatDate(s.playedAt)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                          {totals.map((t) => {
                            const player = players.find((p) => p.id === t.playerId);
                            if (!player) return null;
                            const isWinner = winners.has(t.playerId);
                            return (
                              <span
                                key={t.playerId}
                                className={`flex items-center gap-1 ${isWinner ? "text-accent-700 font-semibold" : "text-content"}`}
                              >
                                {isWinner && <span>★</span>}
                                <span>{player.name}</span>
                                <span className="text-content-subtle">·</span>
                                <span>{t.total}</span>
                              </span>
                            );
                          })}
                        </div>
                        {s.notes && <p className="mt-1 text-xs text-content-muted">{s.notes}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Link to={`/campaigns/${campaign.id}/sessions/${s.id}`}>
                          <Button variant="ghost" tone="neutral" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          tone="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this session?")) removeSession(s.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit campaign" size="lg">
        <CampaignForm
          games={games}
          players={players}
          initial={campaign}
          onCancel={() => setEditing(false)}
          onSubmit={(v) => {
            update(campaign.id, { name: v.name, playerIds: v.playerIds, notes: v.notes });
            setEditing(false);
          }}
        />
      </Modal>
    </div>
  );
}
