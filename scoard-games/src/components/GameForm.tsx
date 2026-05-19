import { useRef, useState, type KeyboardEvent } from "react";
import type { Game, WinRule } from "../types/domain";
import { Button } from "./Button";
import { TextArea, TextField } from "./TextField";

interface CategoryDraft {
  id?: string;
  name: string;
}

export interface GameFormValues {
  name: string;
  description: string;
  winRule: WinRule;
  categories: CategoryDraft[];
}

interface GameFormProps {
  initial?: Game;
  onSubmit: (values: GameFormValues) => void;
  onCancel: () => void;
}

export function GameForm({ initial, onSubmit, onCancel }: GameFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [winRule, setWinRule] = useState<WinRule>(initial?.winRule ?? "highest");
  const [categories, setCategories] = useState<CategoryDraft[]>(
    initial?.categories.map((c) => ({ id: c.id, name: c.name })) ?? [],
  );
  const [catInput, setCatInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const catInputRef = useRef<HTMLInputElement>(null);

  const addCategory = () => {
    const value = catInput.trim();
    if (!value) return;
    setCategories((prev) => [...prev, { name: value }]);
    setCatInput("");
    catInputRef.current?.focus();
  };

  const removeCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCatKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Game needs a name.");
      return;
    }
    const cleanCategories = categories
      .map((c) => ({ ...c, name: c.name.trim() }))
      .filter((c) => c.name.length > 0);
    if (cleanCategories.length === 0) {
      setError("Add at least one scoring category.");
      return;
    }
    onSubmit({
      name: trimmedName,
      description: description.trim(),
      winRule,
      categories: cleanCategories,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="Game name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Catan summer league rules"
        autoFocus
      />

      <TextArea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="House rules, edition, etc."
      />

      <div>
        <div className="block text-sm font-medium text-content mb-2">Win rule</div>
        <div className="flex gap-2">
          {(
            [
              ["highest", "Highest score wins"],
              ["lowest", "Lowest score wins"],
            ] as Array<[WinRule, string]>
          ).map(([value, label]) => {
            const active = winRule === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setWinRule(value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? "border-primary-500 bg-primary-50 text-primary-800"
                    : "border-neutral-200 bg-surface-raised text-content hover:bg-neutral-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="block text-sm font-medium text-content mb-1">
          Scoring categories{" "}
          <span className="text-xs font-normal text-content-muted">
            — what gets added up for a player's score
          </span>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5 mt-2">
            {categories.map((cat, idx) => (
              <span
                key={cat.id ?? `${idx}-${cat.name}`}
                className="inline-flex items-center gap-1.5 pl-3 pr-1 py-0.5 rounded-full bg-accent-50 border border-accent-200 text-accent-800 text-xs font-medium"
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  aria-label={`Remove ${cat.name}`}
                  className="w-4 h-4 rounded-full bg-accent-200 text-accent-800 text-[9px] flex items-center justify-center hover:bg-accent-300 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={catInputRef}
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={handleCatKey}
            placeholder="Category name, then Enter…"
            className="flex-1 rounded-lg border border-neutral-300 bg-surface-raised text-content placeholder:text-content-subtle px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={addCategory}
            disabled={!catInput.trim()}
          >
            Add
          </Button>
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-content-muted mt-2">
            Add at least one category. For simple games, one is enough.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" tone="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save changes" : "Save game"}</Button>
      </div>
    </form>
  );
}
