import type { Game } from "../types/domain";

export const DEFAULT_GAME_ID_PREFIX = "default:";

export const isDefaultGameId = (id: string): boolean => id.startsWith(DEFAULT_GAME_ID_PREFIX);

interface DefaultGameSeed {
  slug: string;
  name: string;
  winRule: Game["winRule"];
  categories: string[];
  description?: string;
}

const SEEDS: DefaultGameSeed[] = [
  {
    slug: "catan",
    name: "Settlers of Catan",
    winRule: "highest",
    categories: ["Settlements", "Cities", "Longest road", "Largest army", "Dev cards"],
  },
  {
    slug: "wingspan",
    name: "Wingspan",
    winRule: "highest",
    categories: ["Birds", "Bonus cards", "End-of-round", "Eggs", "Food on cards", "Tucked cards"],
  },
  {
    slug: "azul",
    name: "Azul",
    winRule: "highest",
    categories: ["Tile score", "Rows", "Columns", "Color sets"],
  },
  {
    slug: "ttr",
    name: "Ticket to Ride",
    winRule: "highest",
    categories: ["Routes", "Longest road", "Completed tickets", "Globetrotter"],
  },
  {
    slug: "7w",
    name: "7 Wonders",
    winRule: "highest",
    categories: ["Military", "Treasury", "Wonder", "Civilian", "Commercial", "Guilds", "Science"],
  },
  {
    slug: "splendor",
    name: "Splendor",
    winRule: "highest",
    categories: ["Prestige points"],
  },
  {
    slug: "dominion",
    name: "Dominion",
    winRule: "highest",
    categories: ["Victory points"],
  },
  {
    slug: "mxtrain",
    name: "Mexican Train",
    winRule: "lowest",
    categories: ["Points"],
  },
  {
    slug: "scrabble",
    name: "Scrabble",
    winRule: "highest",
    categories: ["Word score"],
  },
];

const FIXED_CREATED_AT = "1970-01-01T00:00:00.000Z";

export const DEFAULT_GAMES: Game[] = SEEDS.map((seed) => ({
  id: `${DEFAULT_GAME_ID_PREFIX}${seed.slug}`,
  name: seed.name,
  description: seed.description,
  winRule: seed.winRule,
  categories: seed.categories.map((name, idx) => ({
    id: `${DEFAULT_GAME_ID_PREFIX}${seed.slug}:cat:${idx}`,
    name,
  })),
  createdAt: FIXED_CREATED_AT,
}));
