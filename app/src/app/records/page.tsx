"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { GENRES } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

// 記録タイムライン (企画書§4「記録画面」): 全推し横断
export default function RecordsTimelinePage() {
  const records = useLiveQuery(
    () => (hasIDB() ? db.records.orderBy("date").reverse().toArray() : []),
    [],
  );
  const oshis = useLiveQuery(() => (hasIDB() ? db.oshis.toArray() : []), []);
  const byId = new Map(oshis?.map((o) => [o.id, o]) ?? []);

  return (
    <main>
      <PageHeader
        title="推し活タイムライン"
        back={false}
        action={
          <Link href="/records/new" className="btn-accent px-4 py-2 text-sm">
            ＋書く
          </Link>
        }
      />
      <div className="space-y-3 p-4">
        {records?.length === 0 && (
          <p className="pt-10 text-center text-sm" style={{ color: "var(--muted)" }}>
            記録はまだありません📝
            <br />
            推し活の思い出を積み上げていきましょう
          </p>
        )}
        {records?.map((r) => {
          const o = byId.get(r.oshiId);
          return (
            <Link key={r.id} href={`/records/${r.id}`} className="card block p-4">
              <div className="flex items-center gap-2 text-xs">
                <span style={{ color: "var(--muted)" }}>{r.date}</span>
                {o && (
                  <span className="chip px-2 py-0.5">
                    {GENRES[o.genre].emoji} {o.name}
                  </span>
                )}
                <span className="ml-auto">
                  {r.star && "⭐"}
                  {r.heart && "♥️"}
                </span>
              </div>
              <p className="mt-1.5 font-bold">{r.title}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
