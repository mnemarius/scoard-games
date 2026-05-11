interface StatTileProps {
  label: string;
  value: number | string;
  hint?: string;
}

export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="bg-surface-raised rounded-xl border border-neutral-200 p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wider font-medium text-content-muted">{label}</div>
      <div className="font-display font-bold text-3xl leading-none tracking-tight text-content mt-1">
        {value}
      </div>
      {hint && <div className="text-xs text-content-muted mt-1.5">{hint}</div>}
    </div>
  );
}
