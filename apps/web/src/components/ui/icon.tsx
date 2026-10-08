import type { HTMLAttributes } from "react";

/**
 * Material Symbols icon. The Stitch screens render icons as
 * `<span class="material-symbols-outlined">name</span>`; we keep the exact same
 * ligature mechanism so icon names in the reference HTML can be copied verbatim.
 */
export function Icon({
  name,
  className = "",
  fill = false,
  ...rest
}: {
  name: string;
  className?: string;
  fill?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className">) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined ${className}`}
      style={
        fill
          ? { fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }
          : undefined
      }
      {...rest}
    >
      {name}
    </span>
  );
}
