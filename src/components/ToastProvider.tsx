"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-5 bottom-5 z-50 flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2.5 text-[13px] font-medium text-[#111111] shadow-[0_8px_24px_rgba(17,17,17,0.08)] transition-all dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            {toast.type === "success" && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669] dark:text-[#34D399]" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="h-4 w-4 shrink-0 text-[#E11D48] dark:text-[#FB7185]" />
            )}
            {toast.type === "info" && (
              <Info className="h-4 w-4 shrink-0 text-[#4F46E5] dark:text-[#A5B4FC]" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="ml-1 rounded p-0.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
