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
      className="modal modal-open modal-bottom sm:modal-middle fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
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
        className="modal-box relative max-h-[94dvh] sm:max-h-[90vh] w-full overflow-y-auto overscroll-contain rounded-t-[36px] sm:rounded-3xl border border-white/10 glass-surface bg-[#050507]/95 p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 text-zinc-100 font-sans"
      >
        {/* Mobile Swipe Handle Indicator */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-700/60 sm:hidden" />

        {/* Clean Header Bar */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {dismissable && (
            <button
              onClick={() => {
                playSound("click");
                onClose();
              }}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/40 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
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
        playSound("click");
        onClick();
      }}
      className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
        selected
          ? "border border-lime-400 bg-lime-400/15 text-lime-400 font-extrabold shadow-sm"
          : "border border-white/10 bg-black/40 text-zinc-400 hover:text-white hover:border-white/20"
      } ${className}`}
    >
      {children}
    </button>
  );
}
