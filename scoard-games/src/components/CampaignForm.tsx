import { useState } from "react";
import { Link } from "react-router-dom";
import type { Campaign, Game } from "../types/domain";
import { Button } from "./Button";
import { Select, TextArea, TextField } from "./TextField";

export interface CampaignFormValues {
  name: string;
  gameId: string;
  notes: string;
}

interface CampaignFormProps {
  games: Game[];
  initial?: Campaign;
  onSubmit: (values: CampaignFormValues) => void;
  onCancel: () => void;
}

export function CampaignForm({ games, initial, onSubmit, onCancel }: CampaignFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gameId, setGameId] = useState(initial?.gameId ?? games[0]?.id ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Campaign needs a name.");
    if (!gameId) return setError("Pick a game.");
    onSubmit({ name: name.trim(), gameId, notes: notes.trim() });
  };

  if (games.length === 0) {
    return (
      <div className="text-sm text-content-muted space-y-3">
        <p>You need at least one game before creating a campaign.</p>
        <Link to="/games">
          <Button>Add a game</Button>
        </Link>
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
      {initial && <p className="-mt-2 text-xs text-content-muted">Game can't be changed after creation.</p>}

      <TextArea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <p className="text-xs text-content-muted">
        Players join automatically when you add them to a session.
      </p>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" tone="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save" : "Create campaign"}</Button>
      </div>
    </form>
  );
}