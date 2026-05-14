import { useState } from "react";
import { Button } from "../components/Button";
import { Card, CardBody } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { GameForm, type GameFormValues } from "../components/GameForm";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useGames } from "../hooks/useGames";
import type { Game } from "../types/domain";

export function GamesPage() {
  const { games, add, update, remove, isInUse } = useGames();
  const [editing, setEditing] = useState<Game | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = (values: GameFormValues) => {
    add(values);
    setCreating(false);
  };

  const handleUpdate = (values: GameFormValues) => {
    if (!editing) return;
    update(editing.id, values);
    setEditing(null);
  };

  const handleDelete = (game: Game) => {
    if (isInUse(game.id)) {
      alert(`"${game.name}" is used by an existing campaign and can't be deleted.`);
      return;
    }
    if (confirm(`Delete "${game.name}"?`)) remove(game.id);
  };

  return (
    <div>
      <PageHeader
        title="Games"
        subtitle="Define the games you play and their scoring categories."
        action={<Button onClick={() => setCreating(true)}>+ Add game</Button>}
      />

      {games.length === 0 ? (
        <EmptyState
          title="No games yet"
          description="Add your first game to start tracking scores."
          action={<Button onClick={() => setCreating(true)}>Add a game</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {games.map((g) => (
            <Card key={g.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-content truncate">{g.name}</h3>
                    {g.description && <p className="text-sm text-content-muted mt-0.5">{g.description}</p>}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-content">
                        {g.winRule === "highest" ? "Highest wins" : "Lowest wins"}
                      </span>
                      <span className="text-content-muted">
                        {g.categories.length} {g.categories.length === 1 ? "category" : "categories"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {g.categories.map((c) => (
                        <span key={c.id} className="px-2 py-0.5 rounded bg-accent-50 text-accent-800 border border-accent-100 text-xs">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" tone="neutral" size="sm" onClick={() => setEditing(g)}>
                      Edit
                    </Button>
                    <Button variant="ghost" tone="danger" size="sm" onClick={() => handleDelete(g)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Add game" size="lg">
        <GameForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit game" size="lg">
        {editing && <GameForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
