import { useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../storage/keys";
import { db } from "../lib/firebase";
import type { Campaign, Game, Player, Session } from "../types/domain";
import { AppDataContext, type AppDataState } from "./appDataContextValue";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useLocalStorage<Player[]>(STORAGE_KEYS.players, []);
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>(STORAGE_KEYS.campaigns, []);
  const [sessions, setSessions] = useLocalStorage<Session[]>(STORAGE_KEYS.sessions, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "games"), (snap) => {
      setGames(snap.docs.map((d) => d.data() as Game));
    });
    return unsub;
  }, []);

  const value = useMemo<AppDataState>(
    () => ({ games, players, campaigns, sessions, setPlayers, setCampaigns, setSessions }),
    [games, players, campaigns, sessions, setPlayers, setCampaigns, setSessions],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
