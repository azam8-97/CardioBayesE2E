import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card-surface rounded-xl border border-slate-700/50 p-6", className)} {...rest} />;
}
