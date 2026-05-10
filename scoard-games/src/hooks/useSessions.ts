import { useCallback, useMemo } from "react";
import { useAppData } from "../context/useAppData";
import type { ID, PlayerScore, Session } from "../types/domain";
import { newId } from "../utils/id";

export interface NewSessionInput {
  campaignId: ID;
  playedAt: string;
  scores: PlayerScore[];
  notes?: string;
}

export function useSessions(campaignId?: ID) {
  const { sessions, setSessions } = useAppData();

  const forCampaign = useMemo(
    () =>
      campaignId
        ? sessions
            .filter((s) => s.campaignId === campaignId)
            .slice()
            .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
        : sessions,
    [sessions, campaignId],
  );

  const add = useCallback(
    (input: NewSessionInput): Session => {
      const session: Session = {
        id: newId(),
        campaignId: input.campaignId,
        playedAt: input.playedAt,
        scores: input.scores,
        notes: input.notes?.trim() || undefined,
      };
      setSessions((prev) => [...prev, session]);
      return session;
    },
    [setSessions],
  );

  const update = useCallback(
    (id: ID, patch: Partial<Omit<Session, "id">>) => {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    [setSessions],
  );

  const remove = useCallback(
    (id: ID) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setSessions],
  );

  const getById = useCallback((id: ID) => sessions.find((s) => s.id === id), [sessions]);

  return { sessions: forCampaign, allSessions: sessions, add, update, remove, getById };
}
