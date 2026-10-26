"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { playSound } from "@/lib/audio";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Hide the close button and ignore backdrop/Escape (used for first-run setup). */
  dismissable?: boolean;
}

export function Sheet({ open, title, onClose, children, dismissable = true }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return (
    <div
      className="modal modal-open modal-bottom sm:modal-middle fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-xl sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (dismissable && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="modal-box relative max-h-[94dvh] sm:max-h-[90vh] w-full overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-2xl border-2 border-cyan-400/80 bg-[#03081a]/95 p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_0_50px_rgba(6,182,212,0.4)] sm:max-w-xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 text-zinc-100 system-scanlines system-grid-bg"
      >
        {/* Luminous Diamond Corner Pins (Manhwa Accurate) */}
        <div className="absolute top-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute top-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-1.5 left-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>
        <div className="absolute bottom-1.5 right-1.5 text-cyan-400 text-xs font-mono select-none drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">◆</div>

        {/* Mobile Swipe Handle Indicator */}
        <div className="mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-cyan-500/40 sm:hidden" />

        {/* Holographic Header Bar */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-cyan-500/40 pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400/90 uppercase font-black">
              [ SYSTEM INTERFACE ]
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase text-glow-cyan font-mono">
              {title}
            </h2>
          </div>
          {dismissable && (
            <button
              onClick={() => {
                playSound("system-click");
                onClose();
              }}
              aria-label="Close"
              className="btn btn-sm btn-circle btn-ghost border border-cyan-400/50 bg-black/60 text-cyan-300 hover:bg-cyan-500/20 hover:text-white active:scale-90 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        playSound("system-click");
        onClick();
      }}
      className={`btn btn-sm min-h-[40px] px-3.5 py-1.5 text-xs font-mono font-bold tracking-wide transition-all duration-150 active:scale-95 cursor-pointer uppercase ${
        selected
          ? "btn-primary border-2 border-cyan-400 bg-cyan-400 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-102"
          : "btn-ghost border border-cyan-500/30 bg-black/70 text-zinc-300 hover:border-cyan-400/70 hover:text-cyan-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}
