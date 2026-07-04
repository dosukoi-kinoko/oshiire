"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB, type Oshi } from "@/lib/db";
import { getGenre } from "@/lib/genres";

export function OshiCard({ oshi, small }: { oshi: Oshi; small?: boolean }) {
  const g = getGenre(oshi.genre);
  const isBox = oshi.kind === "box";
  const memberCount = useLiveQuery(
    () =>
      isBox && hasIDB()
        ? db.oshis.where("parentId").equals(oshi.id).count()
        : Promise.resolve(0),
    [oshi.id, isBox],
  );
  return (
    <Link
      href={`/oshi/${oshi.id}`}
      className={`card block overflow-hidden ${small ? "w-36 shrink-0" : ""}`}
    >
      <div
        className={`relative flex items-center justify-center ${small ? "h-20" : "h-28"}`}
        style={{
          background: `linear-gradient(135deg, ${oshi.color}55, ${oshi.color}14), var(--surface-2)`,
        }}
      >
        <span
          className={`flex items-center justify-center rounded-full font-black ${small ? "h-12 w-12 text-xl" : "h-16 w-16 text-2xl"}`}
          style={{
            border: "2px solid #d9b64a",
            color: "var(--text)",
            background: "var(--surface)",
            fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif',
          }}
        >
          {oshi.name.slice(0, 1)}
        </span>
        {isBox && (
          <span className="absolute left-2 top-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-bold text-white">
            📦 {g.boxLabel}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-bold">{oshi.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: oshi.color }}
          />
          <span className="truncate text-xs" style={{ color: "var(--muted)" }}>
            {g.label}
            {isBox && !!memberCount && `・${g.memberLabel}${memberCount}人`}
            {oshi.status === "graduated" && "・🎓卒業"}
            {oshi.status === "dormant" && "・💤休眠"}
          </span>
        </div>
      </div>
    </Link>
  );
}
