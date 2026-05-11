import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardBody, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { TextArea, TextField } from "../components/TextField";
import { useAppData } from "../context/useAppData";
import { useCampaigns } from "../hooks/useCampaigns";
import { useSessions } from "../hooks/useSessions";
import type { CategoryScores, PlayerScore } from "../types/domain";
import { todayInputValue } from "../utils/format";
import { getSessionTotals, getSessionWinners } from "../utils/scoring";

export function SessionFormPage() {
  const { id: campaignId, sessionId } = useParams<{ id: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { games, players } = useAppData();
  const { getById: getCampaign } = useCampaigns();
  const { getById: getSession, add, update } = useSessions(campaignId);

  const campaign = campaignId ? getCampaign(campaignId) : undefined;
  const game = campaign ? games.find((g) => g.id === campaign.gameId) : undefined;
  const existing = sessionId ? getSession(sessionId) : undefined;
  const isEdit = !!existing;

  const initialScores = useMemo<PlayerScore[]>(() => {
    if (existing) return existing.scores;
    if (!campaign || !game) return [];
    return campaign.playerIds.map((pid) => ({
      playerId: pid,
      categoryScores: Object.fromEntries(game.categories.map((c) => [c.id, 0])) as CategoryScores,
    }));
  }, [existing, campaign, game]);

  const [playedAt, setPlayedAt] = useState(existing?.playedAt.slice(0, 10) ?? todayInputValue());
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [scores, setScores] = useState<PlayerScore[]>(initialScores);

  if (!campaign || !game) {
    return (
      <div>
        <PageHeader title="Campaign not found" />
        <Link to="/campaigns" className="text-brand-600 hover:underline text-sm">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  const setCategoryScore = (playerId: string, categoryId: string, raw: string) => {
    const parsed = raw === "" || raw === "-" ? 0 : Number(raw);
    const value = Number.isFinite(parsed) ? parsed : 0;
    setScores((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, categoryScores: { ...s.categoryScores, [categoryId]: value } }
          : s,
      ),
    );
  };

  const previewSession = {
    id: "",
    campaignId: campaign.id,
    playedAt,
    scores,
  };
  const totals = getSessionTotals(previewSession);
  const hasAnyScore = totals.some((t) => t.total !== 0);
  const winners = new Set(hasAnyScore ? getSessionWinners(previewSession, game.winRule) : []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const playedAtIso = new Date(playedAt).toISOString();
    if (isEdit && existing) {
      update(existing.id, { playedAt: playedAtIso, scores, notes });
    } else {
      add({ campaignId: campaign.id, playedAt: playedAtIso, scores, notes });
    }
    navigate(`/campaigns/${campaign.id}`);
  };

  const sessionPlayers = campaign.playerIds
    .map((pid) => players.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div>
      <div className="mb-2">
        <Link to={`/campaigns/${campaign.id}`} className="text-sm text-slate-500 hover:text-brand-700">
          ← {campaign.name}
        </Link>
      </div>
      <PageHeader
        title={isEdit ? "Edit session" : "Record session"}
        subtitle={`${game.name} · ${game.winRule === "highest" ? "Highest wins" : "Lowest wins"}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="grid sm:grid-cols-2 gap-4">
            <TextField
              type="date"
              label="Date played"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Scores</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-5 font-medium">Player</th>
                    {game.categories.map((c) => (
                      <th key={c.id} className="py-3 px-3 font-medium text-right">
                        {c.name}
                      </th>
                    ))}
                    <th className="py-3 px-5 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionPlayers.map((player) => {
                    const score = scores.find((s) => s.playerId === player.id);
                    const total = totals.find((t) => t.playerId === player.id)?.total ?? 0;
                    const isWinner = winners.has(player.id);
                    return (
                      <tr key={player.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-2 px-5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                              style={{ backgroundColor: player.color ?? "#7c3aed" }}
                            >
                              {player.name.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="font-medium text-slate-900">{player.name}</span>
                          </div>
                        </td>
                        {game.categories.map((c) => (
                          <td key={c.id} className="py-2 px-3">
                            <input
                              type="number"
                              value={score?.categoryScores[c.id] ?? 0}
                              onChange={(e) => setCategoryScore(player.id, c.id, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              className="w-20 ml-auto block rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-5 text-right">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isWinner ? "text-brand-700" : "text-slate-900"
                            }`}
                          >
                            {isWinner && <span>★</span>}
                            {total}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <TextArea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Memorable moments, house rules in effect, etc."
            />
          </CardBody>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to={`/campaigns/${campaign.id}`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit">{isEdit ? "Save changes" : "Save session"}</Button>
        </div>
      </form>
    </div>
  );
}
