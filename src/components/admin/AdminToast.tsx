import React from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface AdminToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function AdminToastContainer({ toasts, onRemove }: AdminToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`pointer-events-auto w-full p-4 border rounded-none shadow-2xl relative overflow-hidden flex gap-3 text-xs font-mono transition-all bg-[#161618] ${
              toast.type === "success"
                ? "border-emerald-500/30 text-[#FDFBF7]"
                : toast.type === "error"
                ? "border-red-500/30 text-[#FDFBF7]"
                : "border-[#C9A84C]/30 text-[#FDFBF7]"
            }`}
          >
            {/* Elegant side accent bar */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-[3px] ${
                toast.type === "success"
                  ? "bg-emerald-500"
                  : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-[#C9A84C]"
              }`}
            />

            <div className="shrink-0 mt-0.5">
              {toast.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : toast.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Info className="w-4 h-4 text-[#C9A84C]" />
              )}
            </div>

            <div className="flex-1 flex flex-col gap-0.5 pr-4">
              {toast.title && (
                <span className="font-bold tracking-wider text-[#C9A84C] uppercase text-[9px] mb-0.5">
                  {toast.title}
                </span>
              )}
              <span className="text-[#D5D3CC] font-sans font-light leading-relaxed text-xs">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              className="absolute top-2 East-2 right-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
