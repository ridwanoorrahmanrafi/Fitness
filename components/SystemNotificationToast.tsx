"use client";

import React, { useEffect } from "react";
import { Zap, CheckCircle2, AlertTriangle, Sparkles, X } from "lucide-react";
import { playSound } from "@/lib/audio";

export interface SystemToast {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "level";
}

interface SystemNotificationToastProps {
  toasts: SystemToast[];
  onDismiss: (id: string) => void;
}

export default function SystemNotificationToast({
  toasts,
  onDismiss,
}: SystemNotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-top toast-end top-20 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-3 sm:p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto alert relative p-3.5 bg-[#03091e]/95 border-2 shadow-[0_0_30px_rgba(6,182,212,0.5)] rounded-xl text-white font-mono system-scanlines system-grid-bg animate-in slide-in-from-top-3 fade-in duration-300 block ${
            toast.type === "success"
              ? "border-emerald-400"
              : toast.type === "warning"
              ? "border-amber-400"
              : "border-cyan-400"
          }`}
        >
          {/* Luminous Corner Diamonds */}
          <div className="absolute top-1 left-1 text-cyan-400 text-[10px] select-none">◆</div>
          <div className="absolute top-1 right-1 text-cyan-400 text-[10px] select-none">◆</div>
          <div className="absolute bottom-1 left-1 text-cyan-400 text-[10px] select-none">◆</div>
          <div className="absolute bottom-1 right-1 text-cyan-400 text-[10px] select-none">◆</div>

          <div className="flex items-start justify-between gap-2 border-b border-cyan-500/30 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-[11px] font-black tracking-widest text-cyan-300 uppercase text-glow-cyan">
                {toast.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="btn btn-xs btn-circle btn-ghost text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-xs text-zinc-200 font-medium leading-relaxed pl-3.5">
            {toast.message}
          </p>
        </div>
      ))}
    </div>
  );
}
