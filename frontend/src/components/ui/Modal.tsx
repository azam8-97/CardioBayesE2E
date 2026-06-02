import clsx from "clsx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  title?: string;
  onClose: () => void;
};

export function Modal({ open, title, onClose, className, children, ...rest }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal>
      <div className={clsx("bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-modal", className)} {...rest}>
        <div className="flex items-center justify-between mb-4">
          {title ? <h2 className="text-h5 text-white">{title}</h2> : <span />}
          <button type="button" className="text-slate-400 hover:text-white" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
