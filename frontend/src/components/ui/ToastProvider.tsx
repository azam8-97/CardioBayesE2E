import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (id: string) => void;
  update: (id: string, message: string, type: Exclude<ToastType, "loading">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

let _counter = 0;

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="shrink-0" />,
  error:   <AlertCircle size={16} className="shrink-0" />,
  warning: <AlertTriangle size={16} className="shrink-0" />,
  info:    <Info size={16} className="shrink-0" />,
  loading: <Loader size={16} className="shrink-0 animate-spin" />,
};

const styles: Record<ToastType, string> = {
  success: "border-green-500/60  bg-green-500/10  text-green-200",
  error:   "border-red-500/60    bg-red-500/10    text-red-200",
  warning: "border-amber-500/60  bg-amber-500/10  text-amber-200",
  info:    "border-blue-500/60   bg-blue-500/10   text-blue-200",
  loading: "border-blue-500/60   bg-blue-500/10   text-blue-200",
};

function ToastItem({ item, dismiss }: { item: ToastItem; dismiss: (id: string) => void }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium
        backdrop-blur-sm animate-toast-in ${styles[item.type]}`}
      style={{ minWidth: 280, maxWidth: 380 }}
    >
      {icons[item.type]}
      <span className="flex-1 leading-snug">{item.message}</span>
      {item.type !== "loading" && (
        <button
          onClick={() => dismiss(item.id)}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType, duration = 4000): string => {
      const id = String(++_counter);
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const update = useCallback(
    (id: string, message: string, type: Exclude<ToastType, "loading">) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, type } : t)));
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (m) => { add(m, "success"); },
    error:   (m) => { add(m, "error");   },
    warning: (m) => { add(m, "warning"); },
    info:    (m) => { add(m, "info");    },
    loading: (m) => add(m, "loading", 0),
    dismiss,
    update,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem item={t} dismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
