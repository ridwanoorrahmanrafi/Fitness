"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { playSound } from "@/lib/audio";

export interface CyberDropdownOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

interface CyberDropdownProps<T extends string | number> {
  id?: string;
  label?: string;
  value: T;
  options: CyberDropdownOption<T>[];
  onChange: (val: T) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function CyberDropdown<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  searchable = true,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}: CyberDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input or scroll selected option into view when opened
  useEffect(() => {
    if (isOpen) {
      if (searchable && options.length > 8 && searchInputRef.current) {
        searchInputRef.current.focus();
      } else if (selectedItemRef.current) {
        selectedItemRef.current.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    } else {
      setSearch("");
    }
  }, [isOpen, searchable, options.length]);

  // Keyboard navigation: Escape closes dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
    }
  };

  const selectedOption = options.find((o) => o.value === value);

  // Filter options based on search query
  const filteredOptions = search.trim()
    ? options.filter((o) => {
        const query = search.toLowerCase();
        return (
          o.label.toLowerCase().includes(query) ||
          String(o.value).toLowerCase().includes(query) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(query))
        );
      })
    : options;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative w-full ${className}`}
    >
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-400 uppercase"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        onClick={() => {
          if (disabled) return;
          playSound("click");
          setIsOpen((prev) => !prev);
        }}
        className={`min-h-[44px] w-full flex items-center justify-between rounded-xl border px-3.5 py-2 text-sm text-white transition-all ${
          isOpen
            ? "border-emerald-500/80 bg-zinc-900 ring-1 ring-emerald-500/30"
            : "border-zinc-700/80 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/80"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate font-medium text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu Panel */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950/98 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Quick Search filter if options list is sizable */}
          {searchable && options.length > 8 && (
            <div className="p-1 border-b border-zinc-800 mb-1 flex items-center gap-1.5 bg-zinc-900/80 rounded-lg px-2">
              <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search / খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-1 text-xs text-zinc-100 focus:outline-none placeholder:text-zinc-500"
              />
            </div>
          )}

          {/* Scrollable Options Menu */}
          <div className="overflow-y-auto max-h-48 space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-700">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    ref={isSelected ? selectedItemRef : null}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      playSound("click");
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-black font-semibold shadow-sm"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 ml-2 text-black shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-zinc-500">
                No matching options / কোনো ফলাফল নেই
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { CyberDropdown as Dropdown };
