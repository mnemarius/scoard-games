import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100";

export function TextField({ label, hint, error, className = "", ...rest }: TextFieldProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>}
      <input className={inputClass} {...rest} />
      {hint && !error && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function TextArea({ label, hint, className = "", ...rest }: TextAreaProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>}
      <textarea className={inputClass} rows={3} {...rest} />
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = "", children, ...rest }: SelectProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>}
      <select className={inputClass} {...rest}>
        {children}
      </select>
    </label>
  );
}
