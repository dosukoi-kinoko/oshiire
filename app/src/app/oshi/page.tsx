"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { OshiCard } from "@/components/OshiCard";
import { GENRE_KEYS, getGenre } from "@/lib/genres";
import { useState } from "react";

// 推し一覧 (企画書§4): 五十音順・ジャンル別(自由入力ジャンル含む)・最近見た推し
export default function OshiListPage() {
  const [tab, setTab] = useState<string>("recent");
  const oshis = useLiveQuery(async () => {
    if (!hasIDB()) return [];
    if (tab === "name") return db.oshis.orderBy("name").toArray();
    if (tab === "recent")
      return db.oshis.orderBy("lastViewedAt").reverse().toArray();
    return db.oshis.where("genre").equals(tab).toArray();
  }, [tab]);
  // 使われているジャンル(プリセット順+カスタムジャンル)
  const usedGenres = useLiveQuery(async () => {
    if (!hasIDB()) return [] as string[];
    const all = (await db.oshis.orderBy("genre").uniqueKeys()) as string[];
    return [
      ...GENRE_KEYS.filter((k) => all.includes(k)),
      ...all.filter((k) => !GENRE_KEYS.includes(k as (typeof GENRE_KEYS)[number])),
    ];
  }, []);

  return (
    <main>
      <PageHeader
        title="推し一覧"
        back={false}
        action={
          <Link href="/oshi/new" className="btn-accent px-4 py-2 text-sm">
            ＋追加
          </Link>
        }
      />
      <div className="flex gap-2 overflow-x-auto px-4 pb-1">
        {[
          ["recent", "最近見た"],
          ["name", "五十音順"],
          ...(usedGenres ?? []).map((g) => [g, getGenre(g).label]),
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${tab === key ? "chip" : ""}`}
            style={tab !== key ? { color: "var(--muted)" } : undefined}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {oshis?.map((o) => <OshiCard key={o.id} oshi={o} />)}
      </div>
      {oshis?.length === 0 && (
        <p className="px-4 text-center text-sm" style={{ color: "var(--muted)" }}>
          該当する推しがいません
        </p>
      )}
    </main>
  );
}
