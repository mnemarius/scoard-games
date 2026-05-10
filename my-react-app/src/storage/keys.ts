const PREFIX = "scoard.v1";

export const STORAGE_KEYS = {
  games: `${PREFIX}.games`,
  players: `${PREFIX}.players`,
  campaigns: `${PREFIX}.campaigns`,
  sessions: `${PREFIX}.sessions`,
} as const;
