export type ID = string;

export type WinRule = "highest" | "lowest";

export interface ScoreCategory {
  id: ID;
  name: string;
}

export interface Game {
  id: ID;
  name: string;
  description?: string;
  winRule: WinRule;
  categories: ScoreCategory[];
  roundCount?: number;
  createdAt: string;
}

export interface Player {
  id: ID;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Campaign {
  id: ID;
  name: string;
  gameId: ID;
  playerIds: ID[];
  createdAt: string;
  notes?: string;
}

export type CategoryScores = Record<ID, number>;

export interface PlayerScore {
  playerId: ID;
  categoryScores: CategoryScores;
}

export interface Session {
  id: ID;
  campaignId: ID;
  playedAt: string;
  scores: PlayerScore[];
  rounds?: PlayerScore[][];
  notes?: string;
}
