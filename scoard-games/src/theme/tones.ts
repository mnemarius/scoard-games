export type Tone =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export const TONES: Tone[] = [
  "primary",
  "accent",
  "success",
  "warning",
  "danger",
  "neutral",
];

export const toneSolid: Record<Tone, string> = {
  primary:
    "bg-primary-600 text-content-inverse border border-primary-600 hover:bg-primary-700 hover:border-primary-700",
  accent:
    "bg-accent-500 text-content-inverse border border-accent-500 hover:bg-accent-600 hover:border-accent-600",
  success:
    "bg-success-600 text-content-inverse border border-success-600 hover:bg-success-700 hover:border-success-700",
  warning:
    "bg-warning-500 text-content-inverse border border-warning-500 hover:bg-warning-600 hover:border-warning-600",
  danger:
    "bg-danger-600 text-content-inverse border border-danger-600 hover:bg-danger-700 hover:border-danger-700",
  neutral:
    "bg-neutral-700 text-content-inverse border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-800",
};

export const toneSoft: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-800 border border-primary-100 hover:bg-primary-100",
  accent: "bg-accent-50 text-accent-800 border border-accent-100 hover:bg-accent-100",
  success: "bg-success-50 text-success-800 border border-success-100 hover:bg-success-100",
  warning: "bg-warning-50 text-warning-800 border border-warning-100 hover:bg-warning-100",
  danger: "bg-danger-50 text-danger-800 border border-danger-100 hover:bg-danger-100",
  neutral: "bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-neutral-200",
};

export const toneOutline: Record<Tone, string> = {
  primary: "bg-transparent text-primary-700 border border-primary-300 hover:bg-primary-50",
  accent: "bg-transparent text-accent-700 border border-accent-300 hover:bg-accent-50",
  success: "bg-transparent text-success-700 border border-success-300 hover:bg-success-50",
  warning: "bg-transparent text-warning-700 border border-warning-300 hover:bg-warning-50",
  danger: "bg-transparent text-danger-700 border border-danger-300 hover:bg-danger-50",
  neutral: "bg-surface-raised text-content border border-neutral-300 hover:bg-neutral-100",
};

export const toneGhost: Record<Tone, string> = {
  primary: "bg-transparent text-primary-700 border border-transparent hover:bg-primary-50",
  accent: "bg-transparent text-accent-700 border border-transparent hover:bg-accent-50",
  success: "bg-transparent text-success-700 border border-transparent hover:bg-success-50",
  warning: "bg-transparent text-warning-700 border border-transparent hover:bg-warning-50",
  danger: "bg-transparent text-danger-700 border border-transparent hover:bg-danger-50",
  neutral: "bg-transparent text-content-muted border border-transparent hover:bg-neutral-100 hover:text-content",
};

export const toneText: Record<Tone, string> = {
  primary: "text-primary-700 hover:text-primary-800",
  accent: "text-accent-700 hover:text-accent-800",
  success: "text-success-700 hover:text-success-800",
  warning: "text-warning-700 hover:text-warning-800",
  danger: "text-danger-700 hover:text-danger-800",
  neutral: "text-content-muted hover:text-content",
};

export const toneRing: Record<Tone, string> = {
  primary: "focus-visible:ring-primary-500",
  accent: "focus-visible:ring-accent-500",
  success: "focus-visible:ring-success-500",
  warning: "focus-visible:ring-warning-500",
  danger: "focus-visible:ring-danger-500",
  neutral: "focus-visible:ring-neutral-500",
};

export const toneBorderStrong: Record<Tone, string> = {
  primary: "border-primary-500",
  accent: "border-accent-500",
  success: "border-success-500",
  warning: "border-warning-500",
  danger: "border-danger-500",
  neutral: "border-neutral-400",
};

export const surface = {
  page: "bg-surface text-content",
  card: "bg-surface-raised text-content border border-neutral-200",
  sunken: "bg-surface-sunken text-content",
  divider: "border-neutral-200",
  dividerStrong: "border-neutral-300",
} as const;

export const text = {
  heading: "text-content",
  body: "text-content",
  muted: "text-content-muted",
  subtle: "text-content-subtle",
  inverse: "text-content-inverse",
} as const;

export const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function toneFor(seed: string, tones: Tone[] = ["primary", "accent", "success", "warning", "danger"]): Tone {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return tones[Math.abs(hash) % tones.length];
}
