import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card, CardBody } from "../components/Card";
import { GameForm, type GameFormValues } from "../components/GameForm";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useGames } from "../hooks/useGames";
import type { Game } from "../types/domain";

export function GamesPage() {
  const { games, add, update, remove, isInUse, isDefault } = useGames();
  const [editing, setEditing] = useState<Game | null>(null);
  const [creating, setCreating] = useState(false);

  const { defaultGames, registeredGames } = useMemo(() => {
    const defaults: Game[] = [];
    const registered: Game[] = [];
    for (const g of games) {
      if (isDefault(g.id)) defaults.push(g);
      else registered.push(g);
    }
    return { defaultGames: defaults, registeredGames: registered };
  }, [games, isDefault]);

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
    if (isDefault(game.id)) return;
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

      <div className="space-y-4">
        <GamesSection title="Default games" count={defaultGames.length} defaultOpen>
          <div className="grid sm:grid-cols-2 gap-4">
            {defaultGames.map((g) => (
              <GameCard key={g.id} game={g} isDefault />
            ))}
          </div>
        </GamesSection>

        <GamesSection
          title="Player-registered games"
          count={registeredGames.length}
          defaultOpen={registeredGames.length > 0}
        >
          {registeredGames.length === 0 ? (
            <p className="text-sm text-content-muted px-1 py-2">
              No games registered yet — click <span className="font-medium text-content">+ Add game</span> to create one.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {registeredGames.map((g) => (
                <GameCard
                  key={g.id}
                  game={g}
                  onEdit={() => setEditing(g)}
                  onDelete={() => handleDelete(g)}
                />
              ))}
            </div>
          )}
        </GamesSection>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Add game" size="lg">
        <GameForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit game" size="lg">
        {editing && <GameForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

interface GamesSectionProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function GamesSection({ title, count, defaultOpen, children }: GamesSectionProps) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-neutral-200 bg-surface-raised">
      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="text-content-muted text-xs transition-transform group-open:rotate-90">▶</span>
        <h2 className="font-semibold text-content">{title}</h2>
        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-content-muted text-xs font-medium">
          {count}
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}

interface GameCardProps {
  game: Game;
  isDefault?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function GameCard({ game, isDefault, onEdit, onDelete }: GameCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-content truncate">{game.name}</h3>
              {isDefault && (
                <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 text-[10px] font-medium uppercase tracking-wider">
                  Default
                </span>
              )}
            </div>
            {game.description && (
              <p className="text-sm text-content-muted mt-0.5">{game.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-content">
                {game.winRule === "highest" ? "Highest wins" : "Lowest wins"}
              </span>
              <span className="text-content-muted">
                {game.categories.length} {game.categories.length === 1 ? "category" : "categories"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {game.categories.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded bg-accent-50 text-accent-800 border border-accent-100 text-xs"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
          {!isDefault && (
            <div className="flex flex-col gap-1 shrink-0">
              <Button variant="ghost" tone="neutral" size="sm" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="ghost" tone="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
