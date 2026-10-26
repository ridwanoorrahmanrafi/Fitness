"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Search,
  Users,
  Shield,
  ExternalLink,
  Flame,
  ChevronRight,
  MoreVertical,
  Globe,
} from "lucide-react";
import { playSound } from "@/lib/audio";
import type { Language } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: Language;
}

interface GuildItem {
  id: string;
  name: string;
  initial: string;
  members: number;
  maxMembers: number;
  level: number;
  xpCurrent: number;
  xpMax: number;
  tagline: string;
  country: string;
  streak: number;
  badgeBg: string;
  discordUrl?: string;
}

const SAMPLE_GUILDS: GuildItem[] = [
  {
    id: "valhalla",
    name: "Valhalla",
    initial: "V",
    members: 25,
    maxMembers: 30,
    level: 65,
    xpCurrent: 1900,
    xpMax: 13100,
    tagline: "⚔️ Valhalla On Leveling ⚔️",
    country: "France",
    streak: 168,
    badgeBg: "from-blue-600 to-indigo-600",
    discordUrl: "https://discord.gg/C9RPgyX6A",
  },
  {
    id: "miracle",
    name: "La génération miracle",
    initial: "L",
    members: 25,
    maxMembers: 30,
    level: 61,
    xpCurrent: 3900,
    xpMax: 12300,
    tagline: "🔥 WE'RE COMING. NO PAIN, NO GAIN.",
    country: "France",
    streak: 142,
    badgeBg: "from-blue-500 to-cyan-500",
  },
  {
    id: "shadow_army",
    name: "Shadow Monarchs BD",
    initial: "S",
    members: 28,
    maxMembers: 30,
    level: 72,
    xpCurrent: 8200,
    xpMax: 15000,
    tagline: "👑 Arise! Strength from the depths of perseverance.",
    country: "Bangladesh",
    streak: 210,
    badgeBg: "from-purple-600 to-violet-800",
  },
];

export function GuildHubModal({ open, onClose, lang = "bn" }: Props) {
  const isBn = lang === "bn";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  if (!open) return null;

  return (
    <div className="modal modal-open backdrop-blur-2xl z-50">
      <div className="modal-box max-w-lg min-h-[580px] max-h-[92vh] flex flex-col rounded-3xl bg-[#070e1c] border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,140,255,0.25)] text-zinc-100 overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={() => {
              playSound("system-click");
              onClose();
            }}
            className="btn btn-sm btn-circle btn-ghost text-zinc-400 hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-bold text-white tracking-wide">
            {isBn ? "গিল্ড হাব" : "Guild Hub"}
          </h2>

          <div className="w-11" />
        </div>

        {/* Guild Creation Banner */}
        <div className="my-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-blue-950/40 via-[#0a1630] to-indigo-950/40 p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-[0_0_15px_rgba(0,140,255,0.4)]">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isBn ? "গিল্ড তৈরি করুন" : "Guild Creation"}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isBn
                  ? "এখনো কোনো গিল্ড নেই? তৈরি করে বন্ধুদের একত্র করুন।"
                  : "No guild yet? Create your own and bring your friends together."}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-zinc-500 shrink-0" />
        </div>

        {/* Search Bar */}
        <div className="relative my-2">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-cyan-400 z-10 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? "অনুসন্ধান..." : "Search..."}
            className="input input-bordered input-primary input-sm w-full bg-[#091326] pl-10 text-xs font-medium text-white placeholder-zinc-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 mb-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select select-bordered select-primary select-sm bg-[#091326] text-xs font-bold text-zinc-300"
          >
            <option value="all">{isBn ? "সব ধরন" : "Types: All"}</option>
            <option value="casual">{isBn ? "ক্যাজুয়াল" : "Casual"}</option>
            <option value="hardcore">{isBn ? "হার্ডকোর" : "Hardcore"}</option>
          </select>

          <div className="rounded-xl border border-cyan-500/30 bg-[#091326] px-3 py-1.5 text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isBn ? "বাংলাদেশ / বৈশ্বিক" : "Global"}</span>
          </div>
        </div>

        {/* Guilds List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {SAMPLE_GUILDS.filter(
            (g) =>
              g.name.toLowerCase().includes(search.toLowerCase()) ||
              g.tagline.toLowerCase().includes(search.toLowerCase())
          ).map((guild) => {
            const pct = Math.round((guild.xpCurrent / guild.xpMax) * 100);

            return (
              <div
                key={guild.id}
                className="rounded-2xl border border-cyan-500/25 bg-[#0a1428] p-4 shadow-sm hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr ${guild.badgeBg} text-white font-black text-lg shadow-[0_0_12px_rgba(0,140,255,0.3)]`}
                    >
                      {guild.initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{guild.name}</h4>
                        <span className="badge badge-warning badge-sm font-black text-[9px]">
                          {isBn ? "আমন্ত্রণ" : "Invite"}
                        </span>
                        <span className="text-zinc-500 text-xs">·</span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {guild.members} {isBn ? "সদস্য" : "members"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5 font-medium">
                        {guild.tagline}
                      </p>
                    </div>
                  </div>
                  <MoreVertical className="h-4 w-4 text-zinc-500 shrink-0" />
                </div>

                {guild.discordUrl && (
                  <div className="mt-2 text-[11px] text-blue-400 font-mono truncate flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>Serveur : {guild.discordUrl}</span>
                  </div>
                )}

                {/* Level & XP Bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-[11px] font-bold text-zinc-300 mb-1">
                    <span>Level {guild.level}</span>
                    <span className="text-blue-400 font-mono">
                      {(guild.xpCurrent / 1000).toFixed(1)}K / {(guild.xpMax / 1000).toFixed(1)}K XP
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-1.5"
                    value={pct}
                    max="100"
                  />
                </div>

                {/* Footer Country & Streak */}
                <div className="mt-3 flex items-center justify-between pt-1">
                  <span className="badge badge-neutral badge-sm text-[10px] text-zinc-300 font-semibold">
                    {guild.country}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Flame className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{guild.streak}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
