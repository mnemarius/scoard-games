import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const BASE = "http://localhost:5173";
const OUT = resolve("screenshots");

async function shot(page, url, name) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const path = resolve(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log("saved", name, "->", path);
}

const seed = {
  "scoard.v1.games": [
    {
      id: "g1",
      name: "Catan",
      description: "Sheep, wood, brick, ore, wheat.",
      winRule: "highest",
      categories: [
        { id: "c1", name: "Settlements" },
        { id: "c2", name: "Cities" },
        { id: "c3", name: "Longest road" },
        { id: "c4", name: "Largest army" },
        { id: "c5", name: "Dev cards" },
      ],
      createdAt: "2026-01-10T12:00:00.000Z",
    },
    {
      id: "g2",
      name: "Golf",
      winRule: "lowest",
      categories: [{ id: "gc1", name: "Score" }],
      createdAt: "2026-02-12T12:00:00.000Z",
    },
  ],
  "scoard.v1.players": [
    { id: "p1", name: "Alice", color: "#7c3aed", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "p2", name: "Bob", color: "#0ea5e9", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "p3", name: "Carol", color: "#10b981", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "p4", name: "Dan", color: "#f59e0b", createdAt: "2026-01-01T00:00:00.000Z" },
  ],
  "scoard.v1.campaigns": [
    {
      id: "ca1",
      name: "Catan Winter League 2026",
      gameId: "g1",
      playerIds: ["p1", "p2", "p3", "p4"],
      notes: "First-to-three wins gets bragging rights.",
      createdAt: "2026-01-15T12:00:00.000Z",
    },
  ],
  "scoard.v1.sessions": [
    {
      id: "s1",
      campaignId: "ca1",
      playedAt: "2026-02-01T19:00:00.000Z",
      scores: [
        { playerId: "p1", categoryScores: { c1: 4, c2: 6, c3: 2, c4: 0, c5: 1 } },
        { playerId: "p2", categoryScores: { c1: 3, c2: 4, c3: 0, c4: 2, c5: 2 } },
        { playerId: "p3", categoryScores: { c1: 5, c2: 2, c3: 0, c4: 0, c5: 1 } },
        { playerId: "p4", categoryScores: { c1: 4, c2: 4, c3: 0, c4: 0, c5: 0 } },
      ],
    },
    {
      id: "s2",
      campaignId: "ca1",
      playedAt: "2026-03-09T19:00:00.000Z",
      scores: [
        { playerId: "p1", categoryScores: { c1: 4, c2: 2, c3: 0, c4: 2, c5: 1 } },
        { playerId: "p2", categoryScores: { c1: 4, c2: 6, c3: 2, c4: 0, c5: 1 } },
        { playerId: "p3", categoryScores: { c1: 3, c2: 4, c3: 0, c4: 0, c5: 2 } },
        { playerId: "p4", categoryScores: { c1: 5, c2: 2, c3: 0, c4: 2, c5: 0 } },
      ],
    },
    {
      id: "s3",
      campaignId: "ca1",
      playedAt: "2026-04-20T19:00:00.000Z",
      scores: [
        { playerId: "p1", categoryScores: { c1: 5, c2: 4, c3: 0, c4: 0, c5: 1 } },
        { playerId: "p2", categoryScores: { c1: 3, c2: 4, c3: 2, c4: 0, c5: 0 } },
        { playerId: "p3", categoryScores: { c1: 4, c2: 6, c3: 0, c4: 2, c5: 0 } },
        { playerId: "p4", categoryScores: { c1: 4, c2: 2, c3: 0, c4: 0, c5: 2 } },
      ],
    },
  ],
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Empty-state pass
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => window.localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await shot(page, "/", "01-dashboard-empty");
await shot(page, "/games", "02-games-empty");
await shot(page, "/players", "03-players-empty");
await shot(page, "/campaigns", "04-campaigns-empty");

// Seeded pass
await page.evaluate((data) => {
  for (const [k, v] of Object.entries(data)) {
    window.localStorage.setItem(k, JSON.stringify(v));
  }
}, seed);
await shot(page, "/", "05-dashboard-seeded");
await shot(page, "/games", "06-games-seeded");
await shot(page, "/players", "07-players-seeded");
await shot(page, "/campaigns", "08-campaigns-seeded");
await shot(page, "/campaigns/ca1", "09-campaign-detail");
await shot(page, "/campaigns/ca1/sessions/new", "10-session-new");
await shot(page, "/campaigns/ca1/sessions/s1", "11-session-edit");

// Modal: click "+ Add game" and capture
await page.goto(BASE + "/games", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "+ Add game" }).click();
await page.waitForTimeout(150);
await page.screenshot({ path: resolve(OUT, "12-game-modal.png"), fullPage: true });
console.log("saved 12-game-modal");

await browser.close();