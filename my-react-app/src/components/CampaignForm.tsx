import { useState } from "react";
import { Link } from "react-router-dom";
import type { Campaign, Game, Player } from "../types/domain";
import { Button } from "./Button";
import { Select, TextArea, TextField } from "./TextField";

export interface CampaignFormValues {
  name: string;
  gameId: string;
  playerIds: string[];
  notes: string;
}

interface CampaignFormProps {
  games: Game[];
  players: Player[];
  initial?: Campaign;
  onSubmit: (values: CampaignFormValues) => void;
  onCancel: () => void;
}

export function CampaignForm({ games, players, initial, onSubmit, onCancel }: CampaignFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gameId, setGameId] = useState(initial?.gameId ?? games[0]?.id ?? "");
  const [playerIds, setPlayerIds] = useState<string[]>(initial?.playerIds ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const togglePlayer = (id: string) => {
    setPlayerIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Campaign needs a name.");
    if (!gameId) return setError("Pick a game.");
    if (playerIds.length < 1) return setError("Add at least one player.");
    onSubmit({ name: name.trim(), gameId, playerIds, notes: notes.trim() });
  };

  if (games.length === 0 || players.length === 0) {
    return (
      <div className="text-sm text-slate-600 space-y-3">
        <p>You need at least one game and one player before creating a campaign.</p>
        <div className="flex gap-2">
          {games.length === 0 && (
            <Link to="/games">
              <Button>Add a game</Button>
            </Link>
          )}
          {players.length === 0 && (
            <Link to="/players">
              <Button variant="secondary">Add a player</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Campaign name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Catan Winter League 2026"
        autoFocus
      />
      <Select label="Game" value={gameId} onChange={(e) => setGameId(e.target.value)} disabled={!!initial}>
        {games.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>
      {initial && <p className="-mt-2 text-xs text-slate-500">Game can't be changed after creation.</p>}

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">Players</span>
        <div className="grid grid-cols-2 gap-2">
          {players.map((p) => {
            const selected = playerIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlayer(p.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${
                  selected ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: p.color ?? "#7c3aed" }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate">{p.name}</span>
                {selected && <span className="ml-auto text-brand-600">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <TextArea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save" : "Create campaign"}</Button>
      </div>
    </form>
  );
}
