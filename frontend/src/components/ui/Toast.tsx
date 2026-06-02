import clsx from "clsx";
import type { HTMLAttributes } from "react";

const styles: Record<string, string> = {
  success: "border-l-green-500 bg-green-500/10",
  error: "border-l-red-500 bg-red-500/10",
  warning: "border-l-amber-500 bg-amber-500/10",
  info: "border-l-blue-500 bg-blue-500/10",
};

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof styles;
};

export function Toast({ variant = "info", className, ...rest }: Props) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-slate-700/50 border-l-4 px-4 py-3 text-sm text-slate-100 shadow-card",
        styles[variant],
        className,
      )}
      {...rest}
    />
  );
}
