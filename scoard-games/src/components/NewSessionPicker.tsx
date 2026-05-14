import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Campaign, Game, Session } from "../types/domain";
import { formatDate } from "../utils/format";

interface NewSessionPickerProps {
  campaigns: Campaign[];
  games: Game[];
  sessions: Session[];
  onClose: () => void;
}

export function NewSessionPicker({ campaigns, games, sessions, onClose }: NewSessionPickerProps) {
  const navigate = useNavigate();

  const sorted = useMemo(() => {
    const lastPlayedAt = (campaignId: string): string => {
      const last = sessions
        .filter((s) => s.campaignId === campaignId)
        .sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0];
      const c = campaigns.find((cc) => cc.id === campaignId);
      return last?.playedAt ?? c?.createdAt ?? "";
    };
    return campaigns.slice().sort((a, b) => lastPlayedAt(b.id).localeCompare(lastPlayedAt(a.id)));
  }, [campaigns, sessions]);

  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-content-muted m-0">
        No campaigns yet. Create one first to record a session.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {sorted.map((c) => {
        const game = games.find((g) => g.id === c.gameId);
        const campaignSessions = sessions.filter((s) => s.campaignId === c.id);
        const count = campaignSessions.length;
        const last = campaignSessions.sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0];
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/campaigns/${c.id}/sessions/new`);
              }}
              className="group w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border border-neutral-200 bg-surface-raised shadow-sm transition-colors text-left hover:bg-primary-50 hover:border-primary-400 hover:shadow-md"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-content group-hover:text-primary-800 truncate">
                  {c.name}
                </div>
                <div className="text-xs text-content-muted mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>{game?.name ?? "(deleted game)"}</span>
                  <span className="text-neutral-300">·</span>
                  <span>
                    {count} {count === 1 ? "session" : "sessions"}
                  </span>
                  {last && (
                    <>
                      <span className="text-neutral-300">·</span>
                      <span>Last played {formatDate(last.playedAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <span
                className="text-lg text-neutral-300 group-hover:text-primary-600 shrink-0 transition-colors"
                aria-hidden
              >
                →
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
