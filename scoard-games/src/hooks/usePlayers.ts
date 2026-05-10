import { useCallback } from "react";
import { useAppData } from "../context/useAppData";
import type { ID, Player } from "../types/domain";
import { newId } from "../utils/id";

export type NewPlayerInput = Omit<Player, "id" | "createdAt">;

export function usePlayers() {
  const { players, setPlayers, campaigns, sessions } = useAppData();

  const add = useCallback(
    (input: NewPlayerInput): Player => {
      const player: Player = {
        id: newId(),
        name: input.name.trim(),
        color: input.color,
        createdAt: new Date().toISOString(),
      };
      setPlayers((prev) => [...prev, player]);
      return player;
    },
    [setPlayers],
  );

  const update = useCallback(
    (id: ID, patch: Partial<Omit<Player, "id" | "createdAt">>) => {
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [setPlayers],
  );

  const remove = useCallback(
    (id: ID) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    },
    [setPlayers],
  );

  const getById = useCallback((id: ID) => players.find((p) => p.id === id), [players]);

  const isInUse = useCallback(
    (id: ID) =>
      campaigns.some((c) => c.playerIds.includes(id)) ||
      sessions.some((s) => s.scores.some((sc) => sc.playerId === id)),
    [campaigns, sessions],
  );

  return { players, add, update, remove, getById, isInUse };
}
