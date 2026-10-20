"use client";

import React, { useState } from "react";
import {
  Package,
  Zap,
  Lock,
  Sparkles,
  ShoppingBag,
  Coins,
  Key,
  Gem,
  Check,
  Shield,
  Sword,
  Flame,
  Info,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import { playSound, vibrate } from "@/lib/audio";
import type { Language } from "@/lib/i18n";
import type { Equipment } from "@/lib/types";

interface Props {
  lang?: Language;
  goldCount?: number;
  keysCount?: number;
  gemsCount?: number;
  unlockedEquipment?: Equipment[];
  onEquipChange?: (equipment: Equipment[]) => void;
  onOpenArsenal?: () => void;
}

interface InventorySlot {
  id: string;
  name: string;
  nameBn: string;
  type: "weapon" | "equipment" | "potion" | "relic";
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  description: string;
  descriptionBn: string;
  equipped?: boolean;
  locked?: boolean;
}

const INVENTORY_ITEMS: InventorySlot[] = [
  {
    id: "kasaka_dagger",
    name: "Kasaka's Poison Fang",
    nameBn: "কাসাকার বিষদাঁত",
    type: "weapon",
    icon: "🗡️",
    rarity: "RARE",
    description: "Paralysis effect: Push-up and pull-up sets feel 20% lighter.",
    descriptionBn: "পেশীর শক্তি বৃদ্ধি ও পুশ-আপে অতিরিক্ত স্থায়িত্ব দেয়।",
    equipped: true,
  },
  {
    id: "dumbbells",
    name: "Adjustable Dumbbells",
    nameBn: "অ্যাডজাস্টেবল ডাম্বেল",
    type: "equipment",
    icon: "🏋️",
    rarity: "COMMON",
    description: "Standard training gear for progressive overload hypertrophy.",
    descriptionBn: "মাসল হাইপারট্রফি ও প্রগ্রেসিভ ওভারলোডের প্রধান সরঞ্জাম।",
    equipped: true,
  },
  {
    id: "pullup_bar",
    name: "Heavy Duty Pull-Up Bar",
    nameBn: "পুল-আপ বার",
    type: "equipment",
    icon: "🧗",
    rarity: "COMMON",
    description: "Doorway or wall mounted bar for lats, back, and bicep volume.",
    descriptionBn: "পিঠ, ল্যাটস ও বাইসেপ গঠনের আর্সেনাল সরঞ্জাম।",
    equipped: true,
  },
  {
    id: "recovery_potion",
    name: "Full Recovery Potion",
    nameBn: "ফুল রিকভারি পোশন",
    type: "potion",
    icon: "🧪",
    rarity: "EPIC",
    description: "Instantly clears DOMS muscle soreness and restores 100% stamina.",
    descriptionBn: "মাংসপেশির ক্লান্তি দূর করে ১০০% স্ট্যামিনা পুনরুদ্ধার করে।",
    equipped: false,
  },
  {
    id: "monarch_ring",
    name: "Monarch's Dark Ring",
    nameBn: "মনার্কস ডার্ক রিং",
    type: "relic",
    icon: "💍",
    rarity: "LEGENDARY",
    description: "+15% XP multiplier on all completed daily and focus quests.",
    descriptionBn: "সকল কোয়েস্টে অতিরিক্ত ১৫% এক্সপি অর্জনের ক্ষমতা দেয়।",
    equipped: true,
  },
  {
    id: "resistance_bands",
    name: "Kinematic Resistance Bands",
    nameBn: "রেজিস্ট্যান্স ব্যান্ডস",
    type: "equipment",
    icon: "🎗️",
    rarity: "COMMON",
    description: "Progressive elastic resistance for warmups and metabolic burns.",
    descriptionBn: "ওয়ার্মআপ ও জয়েন্ট সুরক্ষার জন্য স্থিতিস্থাপক ব্যান্ড।",
    equipped: false,
  },
  {
    id: "shadow_cloak",
    name: "Cloak of the Monarch",
    nameBn: "মনার্কের কালো আলখাল্লা",
    type: "relic",
    icon: "🧥",
    rarity: "LEGENDARY",
    description: "Increases Agility by +10. Total stealth during deep focus sets.",
    descriptionBn: "গতি ও একাগ্রতা বৃদ্ধি করে পূর্ণ মনোযোগ বজায় রাখে।",
    equipped: false,
  },
  {
    id: "elixir_life",
    name: "Holy Water of Life",
    nameBn: "হলি ওয়াটার অব লাইফ",
    type: "potion",
    icon: "🏺",
    rarity: "LEGENDARY",
    description: "Cures all physical exhaustion. Extreme metabolic rejuvenation.",
    descriptionBn: "শরীরকে ভেতর থেকে পুনরুজ্জীবিত করে নতুন শক্তিতে ভরিয়ে তোলে।",
    equipped: false,
  },
];

export function LevelingInventoryView({
  lang = "bn",
  goldCount = 0,
  keysCount = 0,
  gemsCount = 0,
  onOpenArsenal,
}: Props) {
  const isBn = lang === "bn";
  const [tab, setTab] = useState<"items" | "buffs">("items");
  const [selectedItem, setSelectedItem] = useState<InventorySlot | null>(null);
  const [showShop, setShowShop] = useState(false);

  // 20 slots total (4x5 grid)
  const totalSlots = 20;
  const items = tab === "items"
    ? INVENTORY_ITEMS.filter((i) => i.type === "weapon" || i.type === "equipment" || i.type === "relic")
    : INVENTORY_ITEMS.filter((i) => i.type === "potion");

  const slots = Array.from({ length: totalSlots }).map((_, idx) => {
    if (idx < items.length) {
      return items[idx];
    }
    // Slots beyond index 11 are locked
    if (idx >= 12) {
      return { id: `locked_${idx}`, locked: true };
    }
    return { id: `empty_${idx}`, locked: false };
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Currency Bar & Shop Link */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>{goldCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold shadow-[0_0_10px_rgba(59,130,246,0.25)]">
            <Key className="h-3.5 w-3.5 text-blue-400" />
            <span>{keysCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold shadow-[0_0_10px_rgba(168,85,247,0.25)]">
            <Gem className="h-3.5 w-3.5 text-purple-400" />
            <span>{gemsCount}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound("system-click");
            setShowShop(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 transition-all"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{isBn ? "শপ" : "Shop"}</span>
        </button>
      </div>

      {/* Main Inventory Card */}
      <div className="leveling-card p-5">
        {/* Header Box */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="leveling-header-box">
            {isBn ? "ইনভেন্টরি" : "INVENTORY"}
          </div>
        </div>

        {/* Segmented Pills: Backpack vs Energy/Buffs */}
        <div className="flex rounded-2xl bg-[#081226] p-1 border border-cyan-500/20 mb-5 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("items");
            }}
            className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${
              tab === "items"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              setTab("buffs");
            }}
            className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${
              tab === "buffs"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>

        {/* 4x5 RPG Item Slots Grid */}
        <div className="grid grid-cols-4 gap-3">
          {slots.map((slot, i) => {
            if ("locked" in slot && slot.locked) {
              return (
                <div
                  key={slot.id}
                  className="aspect-square rounded-2xl border border-zinc-800/80 bg-[#060e1e]/60 flex items-center justify-center text-zinc-600 select-none cursor-not-allowed"
                >
                  <Lock className="h-4 w-4 text-zinc-600" />
                </div>
              );
            }

            if ("name" in slot) {
              const item = slot as InventorySlot;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    vibrate(15);
                    setSelectedItem(item);
                  }}
                  className={`aspect-square rounded-2xl border p-2 flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                    item.equipped
                      ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,140,255,0.35)]"
                      : "border-cyan-500/20 bg-[#091428] hover:border-cyan-500/40"
                  }`}
                >
                  <span className="text-2xl drop-shadow-md">{item.icon}</span>
                  {item.equipped && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
                  )}
                </button>
              );
            }

            // Empty open slot
            return (
              <div
                key={slot.id}
                className="aspect-square rounded-2xl border border-cyan-500/15 bg-[#071022]/80 hover:border-cyan-500/30 transition-all flex items-center justify-center"
              >
                <div className="h-2 w-2 rounded-full bg-cyan-500/20" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Item Modal Detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#091429] border border-cyan-400 p-5 shadow-[0_0_35px_rgba(0,140,255,0.4)] text-zinc-100">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-400 text-3xl mb-3 shadow-[0_0_20px_rgba(0,140,255,0.4)]">
                {selectedItem.icon}
              </div>
              <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider mb-1">
                {selectedItem.rarity} · {selectedItem.type}
              </span>
              <h3 className="text-base font-bold text-white">
                {isBn ? selectedItem.nameBn : selectedItem.name}
              </h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {isBn ? selectedItem.descriptionBn : selectedItem.description}
              </p>

              <div className="w-full mt-5">
                <button
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    vibrate(20);
                    selectedItem.equipped = !selectedItem.equipped;
                    setSelectedItem(null);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all ${
                    selectedItem.equipped
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "leveling-btn-primary"
                  }`}
                >
                  {selectedItem.equipped
                    ? (isBn ? "আন-ইকুইপ করুন" : "Unequip")
                    : (isBn ? "ইকুইপ করুন" : "Equip")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leveling Shop Drawer (Matches WhatsApp Image 2026-10-20 at 11.28.40 PM.jpeg) */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg min-h-[580px] max-h-[92vh] flex flex-col rounded-3xl bg-[#070e1c] border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,140,255,0.25)] text-zinc-100 overflow-hidden my-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setShowShop(false)}
                className="leveling-circle-btn"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-white tracking-wide">
                {isBn ? "হান্টার শপ" : "Shop"}
              </h2>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>{goldCount}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2">
              {/* Featured Section */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-cyan-400">
                  {isBn ? "বিশেষ অফার" : "Featured"}
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" /> 4d 6h
                </span>
              </div>

              {/* Featured Card: Eclipse Black Stone */}
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#1c1809]/80 to-[#0c0d15]/95 p-5 shadow-[0_0_25px_rgba(245,158,11,0.2)] text-center relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold">
                    DAILY DEAL
                  </span>
                  <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold">
                    LEGENDARY
                  </span>
                </div>

                {/* Black Stone Graphic with Solar Corona */}
                <div className="my-4 flex justify-center">
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
                    <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 border border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.4)] flex items-center justify-center text-4xl">
                      🪨
                    </div>
                  </div>
                </div>

                <h4 className="text-base font-black text-white">Eclipse</h4>
                <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto">
                  {isBn
                    ? "সোলার করোনা বেষ্টিত কৃষ্ণপাথর: সূক্ষ্ম সাদা আলোয় উদ্ভাসিত এক বিশেষ ডার্ক ইউআই।"
                    : "Black stone with a solar corona: a dark UI lit by a thin white glow."}
                </p>

                {/* Price & Buy Button */}
                <div className="my-4 flex items-center justify-center gap-3">
                  <span className="text-zinc-500 line-through text-xs font-mono">
                    🪙 6.5K
                  </span>
                  <span className="text-amber-400 font-black text-base font-mono">
                    🪙 5.1K
                  </span>
                  <span className="rounded bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 text-[10px] font-bold">
                    -22%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound("system-click");
                    alert(isBn ? "পর্যাপ্ত কয়েন নেই! কোয়েস্ট সম্পন্ন করে কয়েন অর্জন করুন।" : "Insufficient Coins! Complete quests to earn coins.");
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  {isBn ? "বিস্তারিত দেখুন" : "View details"}
                </button>
              </div>

              {/* Cosmetics List */}
              <div>
                <h4 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
                  {isBn ? "প্লেয়ার কার্ড কসমেটিকস" : "Available cosmetics"}
                </h4>
                <div className="space-y-2">
                  {[
                    { name: "Warp Stream", price: "3K", color: "from-blue-600 to-cyan-500" },
                    { name: "Violet Nebula", price: "4.5K", color: "from-purple-600 to-indigo-700" },
                    { name: "Event Horizon", price: "4.5K", color: "from-black to-zinc-900" },
                  ].map((cos) => (
                    <div
                      key={cos.name}
                      className="rounded-2xl border border-cyan-500/20 bg-[#091326] p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-16 rounded-xl bg-gradient-to-r ${cos.color} border border-white/20`} />
                        <span className="text-xs font-bold text-white">{cos.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                        🪙 {cos.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
