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

  const roundCount = game?.roundCount ?? 0;
  const useRounds = roundCount > 0;

  const initialRounds = useMemo<PlayerScore[][]>(() => {
    if (!campaign || !game || !useRounds) return [];
    if (existing?.rounds && existing.rounds.length === roundCount) return existing.rounds;
    const playerIds = existing?.scores.length
      ? existing.scores.map((s) => s.playerId)
      : campaign.playerIds;
    const rounds: PlayerScore[][] = Array.from({ length: roundCount }, () => emptyRound(game, playerIds));
    if (existing?.scores.length && !existing.rounds) {
      rounds[0] = existing.scores.map((s) => ({
        playerId: s.playerId,
        categoryScores: { ...s.categoryScores },
      }));
    }
    return rounds;
  }, [existing, campaign, game, useRounds, roundCount]);

  const initialScores = useMemo<PlayerScore[]>(() => {
    if (existing) return existing.scores;
    if (!campaign || !game) return [];
    return campaign.playerIds.map((pid) => ({
      playerId: pid,
      categoryScores: emptyCategoryScores(game),
    }));
  }, [existing, campaign, game]);

  const [playedAt, setPlayedAt] = useState(existing?.playedAt.slice(0, 10) ?? todayInputValue());
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [scores, setScores] = useState<PlayerScore[]>(initialScores);
  const [rounds, setRounds] = useState<PlayerScore[][]>(initialRounds);
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

  const addPlayerToSession = (playerId: string) => {
    if (useRounds) {
      setRounds((prev) =>
        prev.map((round) =>
          round.some((s) => s.playerId === playerId)
            ? round
            : [...round, { playerId, categoryScores: emptyCategoryScores(game) }],
        ),
      );
    } else {
      setScores((prev) =>
        prev.some((s) => s.playerId === playerId)
          ? prev
          : [...prev, { playerId, categoryScores: emptyCategoryScores(game) }],
      );
    }
    setError(null);
  };

  const removePlayerFromSession = (playerId: string) => {
    if (useRounds) {
      setRounds((prev) => prev.map((round) => round.filter((s) => s.playerId !== playerId)));
    } else {
      setScores((prev) => prev.filter((s) => s.playerId !== playerId));
    }
  };

  const aggregatedScores = useRounds ? aggregateRounds(rounds) : scores;

  const previewSession = {
    id: "",
    campaignId: campaign.id,
    playedAt,
    scores: aggregatedScores,
  };
  const totals = getSessionTotals(previewSession);
  const hasAnyScore = totals.some((t) => t.total !== 0);
  const winners = new Set(hasAnyScore ? getSessionWinners(previewSession, game.winRule) : []);

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
      rounds: useRounds ? rounds : undefined,
      notes,
    };
    if (isEdit && existing) {
      update(existing.id, payload);
    } else {
      add({ campaignId: campaign.id, ...payload });
    }
    navigate(`/campaigns/${campaign.id}`);
  };

  const rosterIds: string[] = useRounds
    ? Array.from(new Set(rounds.flatMap((r) => r.map((s) => s.playerId))))
    : scores.map((s) => s.playerId);
  const sessionPlayerIds = new Set(rosterIds);
  const sessionPlayers = rosterIds
    .map((pid) => players.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const availablePlayers = players.filter((p) => !sessionPlayerIds.has(p.id));

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
          <CardHeader className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-content">{useRounds ? "Rounds" : "Scores"}</h2>
            <span className="text-xs text-content-muted">
              {sessionPlayers.length} {sessionPlayers.length === 1 ? "player" : "players"}
              {useRounds && ` · ${roundCount} ${roundCount === 1 ? "round" : "rounds"}`}
            </span>
          </CardHeader>
          <CardBody className="p-0">
            {sessionPlayers.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-content-muted">
                No players in this session yet. Add one below.
              </div>
            ) : useRounds ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-content-muted border-b border-neutral-200">
                      <th rowSpan={game.categories.length > 1 ? 2 : 1} className="py-3 px-5 font-medium align-bottom">
                        Player
                      </th>
                      {rounds.map((_, roundIdx) => (
                        <th
                          key={roundIdx}
                          colSpan={game.categories.length}
                          className="py-3 px-3 font-medium text-center border-l border-neutral-200"
                        >
                          Round {roundIdx + 1}
                        </th>
                      ))}
                      <th
                        rowSpan={game.categories.length > 1 ? 2 : 1}
                        className="py-3 px-5 font-medium text-right align-bottom border-l border-neutral-200"
                      >
                        Total
                      </th>
                      <th rowSpan={game.categories.length > 1 ? 2 : 1} className="py-3 px-5 font-medium text-right w-px align-bottom"></th>
                    </tr>
                    {game.categories.length > 1 && (
                      <tr className="text-left text-[10px] uppercase tracking-wide text-content-muted border-b border-neutral-200">
                        {rounds.map((_, roundIdx) =>
                          game.categories.map((c, catIdx) => (
                            <th
                              key={`${roundIdx}-${c.id}`}
                              className={`py-2 px-3 font-medium text-right ${
                                catIdx === 0 ? "border-l border-neutral-200" : ""
                              }`}
                            >
                              {c.name}
                            </th>
                          )),
                        )}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {sessionPlayers.map((player) => {
                      const total = totals.find((t) => t.playerId === player.id)?.total ?? 0;
                      const isWinner = winners.has(player.id);
                      return (
                        <tr key={player.id} className="border-b border-neutral-100 last:border-b-0">
                          <td className="py-2 px-5">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                style={{ backgroundColor: player.color ?? "#7c3aed" }}
                              >
                                {player.name.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="font-medium text-content">{player.name}</span>
                            </div>
                          </td>
                          {rounds.map((round, roundIdx) => {
                            const score = round.find((s) => s.playerId === player.id);
                            return game.categories.map((c, catIdx) => (
                              <td
                                key={`${roundIdx}-${c.id}`}
                                className={`py-2 px-3 ${catIdx === 0 ? "border-l border-neutral-100" : ""}`}
                              >
                                <input
                                  type="number"
                                  value={score?.categoryScores[c.id] ?? 0}
                                  onChange={(e) =>
                                    setRoundCategoryScore(roundIdx, player.id, c.id, e.target.value)
                                  }
                                  onFocus={(e) => e.target.select()}
                                  className="w-20 ml-auto block rounded-lg border border-neutral-300 bg-surface-input text-content shadow-inner px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                                />
                              </td>
                            ));
                          })}
                          <td className="py-2 px-5 text-right border-l border-neutral-100">
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                isWinner ? "text-accent-700" : "text-content"
                              }`}
                            >
                              {isWinner && <span>★</span>}
                              {total}
                            </span>
                          </td>
                          <td className="py-2 px-5 text-right">
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-content-muted border-b border-neutral-200">
                      <th className="py-3 px-5 font-medium">Player</th>
                      {game.categories.map((c) => (
                        <th key={c.id} className="py-3 px-3 font-medium text-right">
                          {c.name}
                        </th>
                      ))}
                      <th className="py-3 px-3 font-medium text-right">Total</th>
                      <th className="py-3 px-5 font-medium text-right w-px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionPlayers.map((player) => {
                      const score = aggregatedScores.find((s) => s.playerId === player.id);
                      const total = totals.find((t) => t.playerId === player.id)?.total ?? 0;
                      const isWinner = winners.has(player.id);
                      return (
                        <tr key={player.id} className="border-b border-neutral-100 last:border-b-0">
                          <td className="py-2 px-5">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                style={{ backgroundColor: player.color ?? "#7c3aed" }}
                              >
                                {player.name.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="font-medium text-content">{player.name}</span>
                            </div>
                          </td>
                          {game.categories.map((c) => (
                            <td key={c.id} className="py-2 px-3">
                              <input
                                type="number"
                                value={score?.categoryScores[c.id] ?? 0}
                                onChange={(e) => setCategoryScore(player.id, c.id, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="w-20 ml-auto block rounded-lg border border-neutral-300 bg-surface-input text-content shadow-inner px-2 py-1.5 text-sm text-right focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                isWinner ? "text-accent-700" : "text-content"
                              }`}
                            >
                              {isWinner && <span>★</span>}
                              {total}
                            </span>
                          </td>
                          <td className="py-2 px-5 text-right">
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
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-content">Add players</h2>
          </CardHeader>
          <CardBody>
            {players.length === 0 ? (
              <p className="text-sm text-content-muted">
                No players exist yet.{" "}
                <Link to="/players" className="text-primary-700 hover:underline">
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
                        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: p.color ?? "#7c3aed" }}
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
            <Button variant="outline" tone="neutral">Cancel</Button>
          </Link>
          <Button type="submit">{isEdit ? "Save changes" : "Save session"}</Button>
        </div>
      </form>
    </div>
  );
}