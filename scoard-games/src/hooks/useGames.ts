import { useCallback } from "react";
import { useAppData } from "../context/useAppData";
import type { Game, ID } from "../types/domain";
import { newId } from "../utils/id";

export type NewGameInput = Omit<Game, "id" | "createdAt" | "categories"> & {
  categories: Array<{ id?: ID; name: string }>;
};

export function useGames() {
  const { games, setGames, campaigns } = useAppData();

  const add = useCallback(
    (input: NewGameInput): Game => {
      const game: Game = {
        id: newId(),
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        winRule: input.winRule,
        categories: input.categories.map((c) => ({ id: c.id ?? newId(), name: c.name.trim() })),
        roundCount: input.roundCount && input.roundCount > 0 ? input.roundCount : undefined,
        createdAt: new Date().toISOString(),
      };
      setGames((prev) => [...prev, game]);
      return game;
    },
    [setGames],
  );

  const update = useCallback(
    (
      id: ID,
      patch: Partial<Omit<Game, "id" | "createdAt" | "categories">> & {
        categories?: Array<{ id?: ID; name: string }>;
      },
    ) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                ...patch,
                categories: patch.categories
                  ? patch.categories.map((c) => ({ id: c.id ?? newId(), name: c.name.trim() }))
                  : g.categories,
              }
            : g,
        ),
      );
    },
    [setGames],
  );

  const remove = useCallback(
    (id: ID) => {
      setGames((prev) => prev.filter((g) => g.id !== id));
    },
    [setGames],
  );

  const getById = useCallback((id: ID): Game | undefined => games.find((g) => g.id === id), [games]);

  const isInUse = useCallback((id: ID) => campaigns.some((c) => c.gameId === id), [campaigns]);

  return { games, add, update, remove, getById, isInUse };
}
