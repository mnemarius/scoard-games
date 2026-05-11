import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ className = "", children, interactive = false, ...rest }: CardProps) {
  const hover = interactive
    ? "transition-colors hover:bg-primary-50 hover:border-primary-200 hover:shadow-md cursor-pointer"
    : "";
  return (
    <div
      className={`bg-surface-raised text-content rounded-xl border border-neutral-200 shadow-sm ${hover} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-neutral-200 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
