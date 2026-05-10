import { useState } from "react";
import type { Game, WinRule } from "../types/domain";
import { Button } from "./Button";
import { Select, TextArea, TextField } from "./TextField";

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

function emptyCategory(): CategoryDraft {
  return { name: "" };
}

export function GameForm({ initial, onSubmit, onCancel }: GameFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [winRule, setWinRule] = useState<WinRule>(initial?.winRule ?? "highest");
  const [categories, setCategories] = useState<CategoryDraft[]>(
    initial?.categories.length ? initial.categories.map((c) => ({ id: c.id, name: c.name })) : [{ name: "Total" }],
  );
  const [error, setError] = useState<string | null>(null);

  const updateCategory = (idx: number, name: string) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, name } : c)));
  };
  const removeCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };
  const addCategory = () => setCategories((prev) => [...prev, emptyCategory()]);

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
      setError("Add at least one scoring category (e.g. 'Total').");
      return;
    }
    onSubmit({ name: trimmedName, description: description.trim(), winRule, categories: cleanCategories });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Catan" autoFocus />
      <TextArea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="House rules, edition, etc."
      />
      <Select label="Winner" value={winRule} onChange={(e) => setWinRule(e.target.value as WinRule)}>
        <option value="highest">Highest score wins</option>
        <option value="lowest">Lowest score wins</option>
      </Select>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-sm font-medium text-slate-700">Scoring categories</span>
          <Button variant="ghost" size="sm" onClick={addCategory}>
            + Add category
          </Button>
        </div>
        <div className="space-y-2">
          {categories.map((c, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={c.name}
                onChange={(e) => updateCategory(idx, e.target.value)}
                placeholder={`Category ${idx + 1}`}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCategory(idx)}
                disabled={categories.length === 1}
                aria-label="Remove"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Each session of this game records a score per category per player. The total per player is the sum.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save changes" : "Add game"}</Button>
      </div>
    </form>
  );
}
