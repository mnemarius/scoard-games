import { useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../storage/keys";
import type { Campaign, Game, Player, Session } from "../types/domain";
import { AppDataContext, type AppDataState } from "./appDataContextValue";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useLocalStorage<Game[]>(STORAGE_KEYS.games, []);
  const [players, setPlayers] = useLocalStorage<Player[]>(STORAGE_KEYS.players, []);
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>(STORAGE_KEYS.campaigns, []);
  const [sessions, setSessions] = useLocalStorage<Session[]>(STORAGE_KEYS.sessions, []);

  const value = useMemo<AppDataState>(
    () => ({ games, players, campaigns, sessions, setGames, setPlayers, setCampaigns, setSessions }),
    [games, players, campaigns, sessions, setGames, setPlayers, setCampaigns, setSessions],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
