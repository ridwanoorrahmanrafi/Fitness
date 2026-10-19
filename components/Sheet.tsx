"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
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
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {dismissable && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
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
      onClick={onClick}
      className={`min-h-[40px] rounded-full border px-3.5 text-sm transition-colors ${
        selected
          ? "border-emerald-400 bg-emerald-500 font-semibold text-black"
          : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
      } ${className}`}
    >
      {children}
    </button>
  );
}
