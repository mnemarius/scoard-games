import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-2xl leading-tight tracking-tight text-content break-words">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-content-muted mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex gap-2 flex-wrap justify-end">{action}</div>}
    </div>
  );
}
