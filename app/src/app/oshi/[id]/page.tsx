"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { GENRES } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";
import { NewsList } from "@/components/NewsList";

// 推しページ=ハブ (FR-11): 全要素をサマリー表示し、各セクションから独立ページへ (FR-11a)
export default function OshiHubPage() {
  const { id } = useParams<{ id: string }>();
  const oshi = useLiveQuery(
    () => (hasIDB() ? db.oshis.get(id) : undefined),
    [id],
  );
  const records = useLiveQuery(
    () =>
      hasIDB()
        ? db.records.where("oshiId").equals(id).reverse().sortBy("date")
        : [],
    [id],
  );
  const events = useLiveQuery(
    () =>
      hasIDB()
        ? db.events
            .where("oshiId")
            .equals(id)
            .and((e) => e.date >= new Date().toISOString().slice(0, 10))
            .sortBy("date")
        : [],
    [id],
  );

  // 「最近見た推し」更新
  useEffect(() => {
    if (hasIDB()) db.oshis.update(id, { lastViewedAt: Date.now() });
  }, [id]);

  if (oshi === undefined) return null;
  if (!oshi)
    return (
      <main className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
        推しが見つかりません
      </main>
    );

  const g = GENRES[oshi.genre];
  const days = oshi.oshiStartDate
    ? Math.floor(
        (Date.now() - new Date(oshi.oshiStartDate).getTime()) / 86400000,
      ) + 1
    : null;
  const latest = (records ?? []).slice(0, 3);
  const nextEvent = events?.[0];

  return (
    <main>
      <PageHeader
        title={oshi.name}
        sub={`${g.emoji} ${g.label}${oshi.status === "graduated" ? "・🎓卒業" : ""}`}
        action={
          <Link
            href={`/oshi/${id}/edit`}
            className="rounded-full px-3 py-1.5 text-xs"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            編集
          </Link>
        }
      />

      {/* プロフィール */}
      <section
        className="mx-4 rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${oshi.color}40, ${oshi.color}10), var(--surface)`,
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl">{g.emoji}</span>
          <div>
            <h2 className="text-xl font-black">{oshi.name}</h2>
            {days !== null && (
              <p className="text-sm font-bold" style={{ color: oshi.color }}>
                推し歴 {days.toLocaleString()}日目
              </p>
            )}
          </div>
        </div>
        {oshi.memo && <p className="mt-3 text-sm">{oshi.memo}</p>}
        {/* SNSリンクカード (穴3の再定義) */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["x", "𝕏", oshi.sns.x],
              ["instagram", "📷 Instagram", oshi.sns.instagram],
              ["youtube", "▶️ YouTube", oshi.sns.youtube],
              ["tiktok", "🎵 TikTok", oshi.sns.tiktok],
            ] as const
          ).map(
            ([key, label, url]) =>
              url && (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-3.5 py-1.5 text-xs font-bold"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {label}
                </a>
              ),
          )}
          {!oshi.sns.x && !oshi.sns.youtube && !oshi.sns.instagram && !oshi.sns.tiktok && (
            <Link href={`/oshi/${id}/edit`} className="text-xs underline" style={{ color: "var(--muted)" }}>
              SNSリンクを設定する
            </Link>
          )}
        </div>
      </section>

      {/* 直近イベント */}
      {nextEvent && (
        <SectionLink href="/calendar" title="次のイベント" emoji="⏳">
          <p className="text-sm font-bold">{nextEvent.title}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {nextEvent.date}
          </p>
        </SectionLink>
      )}

      {/* 記録サマリー → 独立ページ */}
      <SectionLink
        href={`/oshi/${id}/records`}
        title={g.recordLabel}
        emoji="📝"
        count={records?.length}
      >
        {latest.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            まだ記録がありません。最初の{g.recordLabel}を書きましょう
          </p>
        ) : (
          <ul className="space-y-1.5">
            {latest.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {r.date.slice(5)}
                </span>
                <span className="truncate">{r.title}</span>
                {r.star && <span>⭐</span>}
                {r.heart && <span>♥️</span>}
              </li>
            ))}
          </ul>
        )}
      </SectionLink>

      {/* ニュース (FR-18) */}
      <section className="card mx-4 mt-3 p-4">
        <h3 className="flex items-center gap-2 font-bold">
          <span>📰</span> ニュース
        </h3>
        <NewsList query={oshi.name} limit={5} />
      </section>

      <div className="px-4 py-5">
        <Link
          href={`/records/new?oshi=${id}`}
          className="btn-accent block w-full py-3.5 text-center"
        >
          ＋ {g.recordLabel}を書く
        </Link>
      </div>
    </main>
  );
}

function SectionLink({
  href,
  title,
  emoji,
  count,
  children,
}: {
  href: string;
  title: string;
  emoji: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="card mx-4 mt-3 block p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold">
          <span>{emoji}</span> {title}
          {typeof count === "number" && (
            <span className="chip px-2 py-0.5 text-xs">{count}</span>
          )}
        </h3>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          もっと見る →
        </span>
      </div>
      {children}
    </Link>
  );
}
