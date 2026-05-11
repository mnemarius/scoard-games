import type { ButtonHTMLAttributes } from "react";
import {
  focusRing,
  toneGhost,
  toneOutline,
  toneRing,
  toneSolid,
  type Tone,
} from "../theme/tones";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
}

const base = `inline-flex items-center justify-center font-medium rounded-lg transition-colors ${focusRing} disabled:opacity-50 disabled:cursor-not-allowed`;

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

const variantTable: Record<Variant, Record<Tone, string>> = {
  solid: toneSolid,
  outline: toneOutline,
  ghost: toneGhost,
};

export function Button({
  tone = "accent",
  variant = "solid",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const variantClass = variantTable[variant][tone];
  const ringClass = toneRing[tone];
  return (
    <button
      type={type}
      className={`${base} focus-visible:ring-2 ${ringClass} ${variantClass} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
}
