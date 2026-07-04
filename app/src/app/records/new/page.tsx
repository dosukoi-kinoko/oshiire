"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB, uid } from "@/lib/db";
import { getGenre } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

export default function NewRecordPage() {
  return (
    <Suspense>
      <NewRecordForm />
    </Suspense>
  );
}

// 記録作成 (FR-17): 過去日付の遡り登録可・⭐♥マーク
function NewRecordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const oshis = useLiveQuery(
    () => (hasIDB() ? db.oshis.orderBy("lastViewedAt").reverse().toArray() : []),
    [],
  );
  const [oshiId, setOshiId] = useState(params.get("oshi") ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [star, setStar] = useState(false);
  const [heart, setHeart] = useState(false);

  const selected = oshis?.find((o) => o.id === oshiId);
  const g = selected ? getGenre(selected.genre) : null;

  const save = async () => {
    if (!oshiId || !title.trim()) return;
    const id = uid();
    await db.records.add({
      id,
      oshiId,
      date,
      title: title.trim(),
      body: body.trim(),
      star,
      heart,
      createdAt: Date.now(),
    });
    router.replace(`/records/${id}`);
  };

  return (
    <main>
      <PageHeader title={g ? `${g.recordLabel}を書く` : "記録を書く"} sub={selected?.name} />
      <div className="space-y-4 p-4">
        {!params.get("oshi") && (
          <div>
            <span className="text-sm font-bold">どの推し?</span>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {oshis?.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOshiId(o.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm ${oshiId === o.id ? "chip" : "card"}`}
                >
                  {getGenre(o.genre).emoji} {o.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="block text-sm font-bold">
          日付
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="card mt-1.5 w-full px-4 py-3 outline-none" />
        </label>
        <label className="block text-sm font-bold">
          タイトル
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 春場所 千秋楽!" className="card mt-1.5 w-full px-4 py-3 outline-none" />
        </label>
        <label className="block text-sm font-bold">
          本文（1行でもOK）
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="今日の推し、最高でした…" className="card mt-1.5 w-full px-4 py-3 outline-none" />
        </label>
        <div className="flex gap-2">
          <button onClick={() => setStar(!star)} className={`flex-1 rounded-xl py-3 ${star ? "chip" : "card"}`}>
            ⭐ {g?.starLabel ?? "特別な日"}
          </button>
          <button onClick={() => setHeart(!heart)} className={`flex-1 rounded-xl py-3 ${heart ? "chip" : "card"}`}>
            ♥️ お気に入り
          </button>
        </div>
        <button onClick={save} disabled={!oshiId || !title.trim()} className="btn-accent w-full py-3.5 disabled:opacity-40">
          記録する 📝
        </button>
      </div>
    </main>
  );
}
