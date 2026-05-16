import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardBody, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { TextArea, TextField } from "../components/TextField";
import { useAppData } from "../context/useAppData";
import { useCampaigns } from "../hooks/useCampaigns";
import { useSessions } from "../hooks/useSessions";
import type { CategoryScores, Game, PlayerScore } from "../types/domain";
import { todayInputValue } from "../utils/format";
import { aggregateRounds, getSessionTotals, getSessionWinners } from "../utils/scoring";

function emptyCategoryScores(game: Game): CategoryScores {
  return Object.fromEntries(game.categories.map((c) => [c.id, 0])) as CategoryScores;
}

function emptyRound(game: Game, playerIds: string[]): PlayerScore[] {
  return playerIds.map((pid) => ({ playerId: pid, categoryScores: emptyCategoryScores(game) }));
}

function roundTotalFor(round: PlayerScore[], playerId: string): number {
  const sc = round.find((s) => s.playerId === playerId);
  if (!sc) return 0;
  return Object.values(sc.categoryScores).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
}

export function SessionFormPage() {
  const { id: campaignId, sessionId } = useParams<{ id: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { games, players } = useAppData();
  const { getById: getCampaign, addPlayers: addPlayersToCampaign } = useCampaigns();
  const { getById: getSession, add, update } = useSessions(campaignId);

  const campaign = campaignId ? getCampaign(campaignId) : undefined;
  const game = campaign ? games.find((g) => g.id === campaign.gameId) : undefined;
  const existing = sessionId ? getSession(sessionId) : undefined;
  const isEdit = !!existing;

  const initialRounds = useMemo<PlayerScore[][]>(() => {
    if (!campaign || !game) return [];
    if (existing?.rounds && existing.rounds.length > 0) return existing.rounds;
    if (existing?.scores.length) {
      return [
        existing.scores.map((s) => ({
          playerId: s.playerId,
          categoryScores: { ...s.categoryScores },
        })),
      ];
    }
    return [emptyRound(game, campaign.playerIds)];
  }, [existing, campaign, game]);

  const [playedAt, setPlayedAt] = useState(existing?.playedAt.slice(0, 10) ?? todayInputValue());
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [rounds, setRounds] = useState<PlayerScore[][]>(initialRounds);
  const [activeRound, setActiveRound] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!campaign || !game) {
    return (
      <div>
        <PageHeader title="Campaign not found" />
        <Link to="/campaigns" className="text-content-muted hover:text-primary-700 hover:underline text-sm">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  const safeRoundIdx = Math.min(activeRound, rounds.length - 1);

  const rosterIds: string[] = Array.from(
    new Set(rounds.flatMap((r) => r.map((s) => s.playerId))),
  );
  const sessionPlayerIds = new Set(rosterIds);
  const sessionPlayers = rosterIds
    .map((pid) => players.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const availablePlayers = players.filter((p) => !sessionPlayerIds.has(p.id));

  const aggregatedScores = aggregateRounds(rounds);
  const previewSession = {
    id: "",
    campaignId: campaign.id,
    playedAt,
    scores: aggregatedScores,
  };
  const totals = getSessionTotals(previewSession);
  const hasAnyScore = totals.some((t) => t.total !== 0);
  const winners = new Set(hasAnyScore ? getSessionWinners(previewSession, game.winRule) : []);
  const standings = [...totals].sort((a, b) =>
    game.winRule === "lowest" ? a.total - b.total : b.total - a.total,
  );
  const activeRoundScores = rounds[safeRoundIdx] ?? [];

  const setRoundCategoryScore = (
    roundIdx: number,
    playerId: string,
    categoryId: string,
    raw: string,
  ) => {
    const parsed = raw === "" || raw === "-" ? 0 : Number(raw);
    const value = Number.isFinite(parsed) ? parsed : 0;
    setRounds((prev) =>
      prev.map((round, i) =>
        i === roundIdx
          ? round.map((s) =>
              s.playerId === playerId
                ? { ...s, categoryScores: { ...s.categoryScores, [categoryId]: value } }
                : s,
            )
          : round,
      ),
    );
  };

  const addRound = () => {
    const playerIds = rosterIds.length ? rosterIds : campaign.playerIds;
    const next = [...rounds, emptyRound(game, playerIds)];
    setRounds(next);
    setActiveRound(next.length - 1);
  };

  const removeRound = (idx: number) => {
    if (rounds.length <= 1) return;
    const next = rounds.filter((_, i) => i !== idx);
    setRounds(next);
    setActiveRound((prev) => Math.max(0, Math.min(prev, next.length - 1)));
  };

  const addPlayerToSession = (playerId: string) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.some((s) => s.playerId === playerId)
          ? round
          : [...round, { playerId, categoryScores: emptyCategoryScores(game) }],
      ),
    );
    setError(null);
  };

  const removePlayerFromSession = (playerId: string) => {
    setRounds((prev) => prev.map((round) => round.filter((s) => s.playerId !== playerId)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aggregatedScores.length === 0) {
      setError("Add at least one player to this session.");
      return;
    }
    const playedAtIso = new Date(playedAt).toISOString();
    addPlayersToCampaign(
      campaign.id,
      aggregatedScores.map((s) => s.playerId),
    );
    const payload = {
      playedAt: playedAtIso,
      scores: aggregatedScores,
      rounds,
      notes,
    };
    if (isEdit && existing) {
      update(existing.id, payload);
    } else {
      add({ campaignId: campaign.id, ...payload });
    }
    navigate(`/campaigns/${campaign.id}`);
  };

  return (
    <div>
      <div className="mb-2">
        <Link to={`/campaigns/${campaign.id}`} className="text-sm text-content-muted hover:text-primary-700">
          ← {campaign.name}
        </Link>
      </div>
      <PageHeader
        title={isEdit ? "Edit session" : "Record session"}
        subtitle={`${game.name} · ${game.winRule === "highest" ? "Highest wins" : "Lowest wins"}`}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-52">
            <TextField
              type="date"
              label="Date played"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[260px]">
            <RunningTotalsBanner
              players={sessionPlayers}
              standings={standings}
              winners={winners}
              hasAnyScore={hasAnyScore}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-content">Add players</h2>
          </CardHeader>
          <CardBody>
            {players.length === 0 ? (
              <p className="text-sm text-content-muted">
                No players exist yet.{" "}
                <Link to="/players" className="font-semibold text-primary-700 underline hover:text-primary-800">
                  Add one
                </Link>{" "}
                to get started.
              </p>
            ) : availablePlayers.length === 0 ? (
              <p className="text-sm text-content-muted">All players are already in this session.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availablePlayers.map((p) => {
                  const inCampaign = campaign.playerIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addPlayerToSession(p.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 hover:border-primary-500 hover:bg-primary-50 text-sm text-content transition"
                    >
                      <span
                        className="h-6 w-6 rounded-full flex items-center justify-center text-content-inverse text-xs font-semibold"
                        style={{ backgroundColor: p.color ?? "rgb(var(--color-primary-600))" }}
                      >
                        {p.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="truncate">{p.name}</span>
                      {!inCampaign && (
                        <span className="text-[10px] uppercase tracking-wider text-accent-700 font-semibold">
                          new
                        </span>
                      )}
                      <span className="text-content-muted">+</span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>


        <Card>
          <CardHeader className="!py-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {rounds.map((round, i) => {
                const active = i === safeRoundIdx;
                const roundSum = round.reduce(
                  (sum, sc) =>
                    sum +
                    Object.values(sc.categoryScores).reduce(
                      (s, v) => s + (Number.isFinite(v) ? v : 0),
                      0,
                    ),
                  0,
                );
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveRound(i)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-600 border-primary-500 text-content-inverse"
                        : "bg-surface-raised border-neutral-200 text-content-muted hover:bg-neutral-100"
                    }`}
                  >
                    Round {i + 1}
                    {roundSum > 0 && !active && (
                      <span className="text-xs opacity-60">{roundSum}</span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={addRound}
                className="px-3 py-1 rounded-full border border-dashed border-neutral-300 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
              >
                + Add round
              </button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {sessionPlayers.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-content-muted">
                No players in this session yet. Add one below.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-sunken border-b border-neutral-200">
                      <th className="py-2.5 px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-content-muted min-w-[140px]">
                        Player
                      </th>
                      {game.categories.map((c) => (
                        <th
                          key={c.id}
                          className="py-2.5 px-2 text-center text-[11px] font-semibold uppercase tracking-wider text-content-muted whitespace-nowrap"
                        >
                          {c.name}
                        </th>
                      ))}
                      <th className="py-2.5 px-5 text-right text-[11px] font-semibold uppercase tracking-wider text-content-muted">
                        Round
                      </th>
                      <th className="py-2.5 px-3 w-px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionPlayers.map((player) => {
                      const score = activeRoundScores.find((s) => s.playerId === player.id);
                      const roundTotal = roundTotalFor(activeRoundScores, player.id);
                      const total = totals.find((t) => t.playerId === player.id)?.total ?? 0;
                      const isWinner = hasAnyScore && winners.has(player.id);
                      return (
                        <tr key={player.id} className="border-b border-neutral-100 last:border-b-0">
                          <td className="py-2 px-5">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-7 w-7 rounded-full flex items-center justify-center text-content-inverse text-xs font-semibold shrink-0"
                                style={{ backgroundColor: player.color ?? "rgb(var(--color-primary-600))" }}
                              >
                                {player.name.slice(0, 1).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <div className="font-medium text-content truncate">{player.name}</div>
                                <div
                                  className={`text-[11px] ${
                                    isWinner ? "text-accent-600 font-semibold" : "text-content-subtle"
                                  }`}
                                >
                                  {isWinner ? "★ " : ""}
                                  {total} total
                                </div>
                              </div>
                            </div>
                          </td>
                          {game.categories.map((c) => (
                            <td key={c.id} className="py-1.5 px-2 text-center">
                              <input
                                type="number"
                                value={score?.categoryScores[c.id] ?? 0}
                                onChange={(e) =>
                                  setRoundCategoryScore(safeRoundIdx, player.id, c.id, e.target.value)
                                }
                                onFocus={(e) => e.target.select()}
                                className="w-16 mx-auto block rounded-md border border-neutral-200 bg-surface-input text-content px-1 py-1 text-sm text-center focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-5 text-right">
                            <span
                              className={`font-display font-bold text-xl tracking-tight ${
                                roundTotal ? "text-content" : "text-neutral-300"
                              }`}
                            >
                              {roundTotal || "—"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              variant="ghost"
                              tone="danger"
                              size="sm"
                              onClick={() => removePlayerFromSession(player.id)}
                              aria-label={`Remove ${player.name}`}
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {rounds.length > 1 && (
              <div className="px-5 py-2 border-t border-neutral-100 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  tone="danger"
                  size="sm"
                  onClick={() => removeRound(safeRoundIdx)}
                >
                  Remove round {safeRoundIdx + 1}
                </Button>
              </div>
            )}
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

        {error && <p className="text-sm text-danger-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Link to={`/campaigns/${campaign.id}`}>
            <Button variant="outline" tone="neutral">
              Cancel
            </Button>
          </Link>
          <Button type="submit">{isEdit ? "Save changes" : "Save session"}</Button>
        </div>
      </form>
    </div>
  );
}

interface BannerProps {
  players: Array<{ id: string; name: string; color?: string }>;
  standings: Array<{ playerId: string; total: number }>;
  winners: Set<string>;
  hasAnyScore: boolean;
}

function RunningTotalsBanner({ players, standings, winners, hasAnyScore }: BannerProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap px-4 py-2.5 rounded-lg border border-neutral-200 bg-surface-sunken">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle mr-1.5">
        Running
      </span>
      {!hasAnyScore || standings.length === 0 ? (
        <span className="text-xs italic text-content-subtle">Enter scores to see standings.</span>
      ) : (
        standings.map((t, idx) => {
          const p = players.find((pl) => pl.id === t.playerId);
          if (!p) return null;
          const isWinner = winners.has(t.playerId);
          return (
            <span key={t.playerId} className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-5 w-5 rounded-full inline-flex items-center justify-center text-content-inverse text-[10px] font-semibold shrink-0"
                  style={{ backgroundColor: p.color ?? "rgb(var(--color-primary-600))" }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                <span
                  className={`text-xs ${isWinner ? "font-bold text-accent-700" : "font-medium text-content"}`}
                >
                  {isWinner && "★ "}
                  {p.name}
                </span>
                <span
                  className={`font-display font-bold text-base leading-none tracking-tight ${
                    isWinner ? "text-accent-600" : "text-content-muted"
                  }`}
                >
                  {t.total}
                </span>
              </span>
              {idx < standings.length - 1 && (
                <span className="text-neutral-300 text-xs">·</span>
              )}
            </span>
          );
        })
      )}
    </div>
  );
}
