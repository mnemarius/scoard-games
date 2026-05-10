import { useState } from "react";
import { Button } from "../components/Button";
import { Card, CardBody } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { TextField } from "../components/TextField";
import { usePlayers } from "../hooks/usePlayers";
import type { Player } from "../types/domain";

const PLAYER_COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#6366f1"];

interface PlayerFormProps {
  initial?: Player;
  onSubmit: (values: { name: string; color: string }) => void;
  onCancel: () => void;
}

function PlayerForm({ initial, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? PLAYER_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    onSubmit({ name: name.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">Color</span>
        <div className="flex gap-2 flex-wrap">
          {PLAYER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                color === c ? "border-slate-900 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save" : "Add player"}</Button>
      </div>
    </form>
  );
}

export function PlayersPage() {
  const { players, add, update, remove, isInUse } = usePlayers();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);

  const handleDelete = (player: Player) => {
    if (isInUse(player.id)) {
      alert(`${player.name} is part of an existing campaign or session and can't be deleted.`);
      return;
    }
    if (confirm(`Delete ${player.name}?`)) remove(player.id);
  };

  return (
    <div>
      <PageHeader
        title="Players"
        subtitle="Manage the people you play with."
        action={<Button onClick={() => setCreating(true)}>+ Add player</Button>}
      />

      {players.length === 0 ? (
        <EmptyState
          title="No players yet"
          description="Add players to include them in campaigns."
          action={<Button onClick={() => setCreating(true)}>Add a player</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {players.map((p) => (
            <Card key={p.id}>
              <CardBody className="flex items-center gap-3">
                <span
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                  style={{ backgroundColor: p.color ?? "#7c3aed" }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{p.name}</div>
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-brand-700"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-red-600"
                      onClick={() => handleDelete(p)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Add player">
        <PlayerForm
          onCancel={() => setCreating(false)}
          onSubmit={(v) => {
            add(v);
            setCreating(false);
          }}
        />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit player">
        {editing && (
          <PlayerForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => {
              update(editing.id, v);
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
