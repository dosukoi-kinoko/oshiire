"use client";

import Link from "next/link";
import type { Oshi } from "@/lib/db";
import { GENRES } from "@/lib/genres";

export function OshiCard({ oshi, small }: { oshi: Oshi; small?: boolean }) {
  const g = GENRES[oshi.genre];
  return (
    <Link
      href={`/oshi/${oshi.id}`}
      className={`card block overflow-hidden ${small ? "w-36 shrink-0" : ""}`}
    >
      <div
        className={`flex items-center justify-center ${small ? "h-20" : "h-28"} text-4xl`}
        style={{
          background: `linear-gradient(135deg, ${oshi.color}33, ${oshi.color}0d), var(--surface-2)`,
        }}
      >
        {g.emoji}
      </div>
      <div className="p-3">
        <p className="truncate font-bold">{oshi.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: oshi.color }}
          />
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {g.label}
            {oshi.status === "graduated" && "・🎓卒業"}
            {oshi.status === "dormant" && "・💤休眠"}
          </span>
        </div>
      </div>
    </Link>
  );
}
