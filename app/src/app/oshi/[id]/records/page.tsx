"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { GENRES } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

// 記録一覧の独立ページ (FR-11a): /oshi/[id]/records
export default function OshiRecordsPage() {
  const { id } = useParams<{ id: string }>();
  const oshi = useLiveQuery(() => (hasIDB() ? db.oshis.get(id) : undefined), [id]);
  const records = useLiveQuery(
    () =>
      hasIDB()
        ? db.records.where("oshiId").equals(id).reverse().sortBy("date")
        : [],
    [id],
  );

  if (!oshi) return null;
  const g = GENRES[oshi.genre];

  return (
    <main>
      <PageHeader
        title={g.recordLabel}
        sub={oshi.name}
        action={
          <Link href={`/records/new?oshi=${id}`} className="btn-accent px-4 py-2 text-sm">
            ＋書く
          </Link>
        }
      />
      <div className="space-y-3 p-4">
        {records?.length === 0 && (
          <p className="pt-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            まだ記録がありません📝
            <br />
            過去の思い出も遡って登録できます
          </p>
        )}
        {records?.map((r) => (
          <Link key={r.id} href={`/records/${r.id}`} className="card block p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: oshi.color }}>
                {r.date}
              </span>
              <span className="text-sm">
                {r.star && "⭐"}
                {r.heart && "♥️"}
              </span>
            </div>
            <p className="mt-1 font-bold">{r.title}</p>
            {r.body && (
              <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--muted)" }}>
                {r.body}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
