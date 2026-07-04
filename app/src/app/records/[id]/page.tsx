"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { GENRES } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

// 記録詳細の独立ページ (FR-11a): /records/[id]
export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const record = useLiveQuery(() => (hasIDB() ? db.records.get(id) : undefined), [id]);
  const oshi = useLiveQuery(
    () => (record && hasIDB() ? db.oshis.get(record.oshiId) : undefined),
    [record?.oshiId],
  );

  if (record === undefined) return null;
  if (!record)
    return (
      <main className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
        記録が見つかりません
      </main>
    );
  const g = oshi ? GENRES[oshi.genre] : null;

  const remove = async () => {
    if (!confirm("この記録を削除しますか?")) return;
    await db.records.delete(id);
    router.back();
  };

  return (
    <main>
      <PageHeader title={g?.recordLabel ?? "記録"} sub={oshi?.name} />
      <article className="card mx-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: oshi?.color }}>
            {record.date}
          </span>
          <span>
            {record.star && "⭐"}
            {record.heart && "♥️"}
          </span>
        </div>
        <h1 className="mt-2 text-xl font-black">{record.title}</h1>
        {record.body && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{record.body}</p>
        )}
      </article>
      <div className="flex items-center justify-between px-6 py-4">
        {oshi && (
          <Link href={`/oshi/${oshi.id}/records`} className="text-sm underline" style={{ color: "var(--muted)" }}>
            {oshi.name}の記録一覧へ
          </Link>
        )}
        <button onClick={remove} className="text-sm" style={{ color: "var(--muted)" }}>
          削除
        </button>
      </div>
    </main>
  );
}
