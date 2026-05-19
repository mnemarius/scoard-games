import { useCallback, useMemo } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAppData } from "../context/useAppData";
import { DEFAULT_GAMES, isDefaultGameId } from "../data/defaultGames";
import { db } from "../lib/firebase";
import type { Game, ID } from "../types/domain";
import { newId } from "../utils/id";

export type NewGameInput = Omit<Game, "id" | "createdAt" | "categories"> & {
  categories: Array<{ id?: ID; name: string }>;
};

export function useGames() {
  const { games: firestoreGames, campaigns } = useAppData();

  const games = useMemo<Game[]>(
    () => [...DEFAULT_GAMES, ...firestoreGames.filter((g) => !isDefaultGameId(g.id))],
    [firestoreGames],
  );

  const add = useCallback((input: NewGameInput): Game => {
    const game: Game = {
      id: newId(),
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      winRule: input.winRule,
      categories: input.categories.map((c) => ({ id: c.id ?? newId(), name: c.name.trim() })),
      createdAt: new Date().toISOString(),
    };
    void setDoc(doc(db, "games", game.id), game);
    return game;
  }, []);

  const update = useCallback(
    (
      id: ID,
      patch: Partial<Omit<Game, "id" | "createdAt" | "categories">> & {
        categories?: Array<{ id?: ID; name: string }>;
      },
    ) => {
      if (isDefaultGameId(id)) return;
      const existing = firestoreGames.find((g) => g.id === id);
      if (!existing) return;
      const next: Game = {
        ...existing,
        ...patch,
        categories: patch.categories
          ? patch.categories.map((c) => ({ id: c.id ?? newId(), name: c.name.trim() }))
          : existing.categories,
      };
      void setDoc(doc(db, "games", id), next);
    },
    [firestoreGames],
  );

  const remove = useCallback((id: ID) => {
    if (isDefaultGameId(id)) return;
    void deleteDoc(doc(db, "games", id));
  }, []);

  const getById = useCallback((id: ID): Game | undefined => games.find((g) => g.id === id), [games]);

  const isInUse = useCallback((id: ID) => campaigns.some((c) => c.gameId === id), [campaigns]);

  const isDefault = useCallback((id: ID) => isDefaultGameId(id), []);

  return { games, add, update, remove, getById, isInUse, isDefault };
}
