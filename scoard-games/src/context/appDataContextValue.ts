import { createContext } from "react";
import type { Campaign, Game, Player, Session } from "../types/domain";

export interface AppDataState {
  games: Game[];
  players: Player[];
  campaigns: Campaign[];
  sessions: Session[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export const AppDataContext = createContext<AppDataState | null>(null);
