"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { GENRES, SWATCHES } from "@/lib/genres";
import { NewsList } from "@/components/NewsList";
import { OshiCard } from "@/components/OshiCard";

// 推しページ=ハブ (FR-11/FR-11a/FR-12a): サンプルHTML準拠のヒーローデザイン+箱推し階層
export default function OshiHubPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const oshi = useLiveQuery(() => (hasIDB() ? db.oshis.get(id) : undefined), [id]);
  const parent = useLiveQuery(
    () => (oshi?.parentId && hasIDB() ? db.oshis.get(oshi.parentId) : undefined),
    [oshi?.parentId],
  );
  const members = useLiveQuery(
    () =>
      hasIDB() ? db.oshis.where("parentId").equals(id).toArray() : [],
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
  const isBox = oshi.kind === "box";
  const days = oshi.oshiStartDate
    ? Math.floor((Date.now() - new Date(oshi.oshiStartDate).getTime()) / 86400000) + 1
    : null;
  const latest = (records ?? []).slice(0, 3);
  const nextEvent = events?.[0];
  const snsLinks = (
    [
      ["𝕏", "X (Twitter)", oshi.sns.x],
      ["📷", "Instagram", oshi.sns.instagram],
      ["▶️", "YouTube", oshi.sns.youtube],
      ["🎵", "TikTok", oshi.sns.tiktok],
    ] as const
  ).filter(([, , url]) => !!url);

  return (
    <main>
      {/* ヒーロー (FR-12a): グラデーション+円形モノグラム */}
      <section
        className="relative pb-6 pt-3 text-center text-white"
        style={{
          background: `linear-gradient(180deg, ${oshi.color} 0%, ${oshi.color}cc 55%, transparent 100%)`,
        }}
      >
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            aria-label="戻る"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-lg"
          >
            ←
          </button>
          <Link
            href={`/oshi/${id}/edit`}
            className="rounded-full bg-black/20 px-3 py-1.5 text-xs"
          >
            編集
          </Link>
        </div>

        {parent && (
          <Link
            href={`/oshi/${parent.id}`}
            className="mt-1 inline-block rounded-full bg-black/25 px-3 py-1 text-[11px]"
          >
            📦 {parent.name} 所属
          </Link>
        )}

        <div
          className="mx-auto mt-3 flex h-28 w-28 items-center justify-center rounded-full text-5xl font-black"
          style={{
            border: "3px solid #d9b64a",
            boxShadow: "0 0 0 6px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.25)",
            background: "rgba(255,255,255,0.08)",
            fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif',
          }}
        >
          {oshi.name.slice(0, 1)}
        </div>

        {oshi.subtitle && (
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.35em] opacity-80">
            {oshi.subtitle}
          </p>
        )}
        <h1
          className="mt-1 px-4 text-3xl font-black tracking-wider"
          style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}
        >
          {oshi.name}
        </h1>
        <p className="mt-1.5 text-xs opacity-80">
          — {g.emoji} {isBox ? `${g.label}・${g.boxLabel}` : g.label}
          {days !== null && ` ／ 推し歴 ${days.toLocaleString()}日目`} —
        </p>
      </section>

      {/* テーマ色スウォッチ (FR-12a): タップで即変更 */}
      <div className="flex items-center gap-2.5 overflow-x-auto px-4 py-3">
        <span className="shrink-0 text-xs font-bold" style={{ color: "var(--muted)" }}>
          テーマ色
        </span>
        {[...new Set([...SWATCHES, oshi.color])].map((c) => (
          <button
            key={c}
            aria-label={`テーマ色 ${c}`}
            onClick={() => db.oshis.update(id, { color: c })}
            className="h-8 w-8 shrink-0 rounded-full"
            style={{
              background: c,
              border: "2px solid var(--surface)",
              outline: oshi.color === c ? "2px solid var(--text)" : "1px solid var(--border)",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>

      {/* 情報テーブル (FR-12a) */}
      {(oshi.profile?.length ?? 0) > 0 && (
        <section className="card mx-4 mt-1 overflow-hidden">
          <h3 className="border-b px-4 pb-2 pt-3 text-sm font-bold" style={{ borderColor: "var(--border)" }}>
            {isBox ? `${g.boxLabel}情報` : "プロフィール"}
          </h3>
          <dl>
            {oshi.profile!.map((row, i) => (
              <div
                key={i}
                className="flex border-b px-4 py-2.5 text-sm last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <dt className="w-28 shrink-0" style={{ color: "var(--muted)" }}>
                  {row.label}
                </dt>
                <dd className="min-w-0 flex-1 font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 箱の場合: メンバー一覧 (FR-10a) */}
      {isBox && (
        <section className="mx-4 mt-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold">
              👥 {g.memberLabel}
              <span className="chip ml-2 px-2 py-0.5 text-xs">{members?.length ?? 0}</span>
            </h3>
            <Link href={`/oshi/new?box=${id}`} className="chip px-3 py-1 text-xs">
              ＋ {g.memberLabel}を追加
            </Link>
          </div>
          {(members?.length ?? 0) === 0 ? (
            <p className="card p-4 text-center text-xs" style={{ color: "var(--muted)" }}>
              まだ{g.memberLabel}がいません。
              <br />
              推しの{g.memberLabel}の個人ページを作りましょう✨
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {members!.map((m) => (
                <OshiCard key={m.id} oshi={m} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 直近イベント */}
      {nextEvent && (
        <SectionLink href="/calendar" title="次のイベント" emoji="⏳">
          <p className="text-sm font-bold">{nextEvent.title}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {nextEvent.date}
          </p>
        </SectionLink>
      )}

      {/* 記録サマリー → 独立ページ (FR-11a) */}
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

      {/* SNS小窓 (穴3の再定義: リンクカード) */}
      {snsLinks.length > 0 && (
        <section className="mx-4 mt-3">
          <h3 className="mb-2 text-sm font-bold tracking-widest" style={{ color: "var(--muted)" }}>
            SNS 小窓
          </h3>
          <div className="space-y-2">
            {snsLinks.map(([icon, label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="card block overflow-hidden"
              >
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5"
                  style={{ borderTop: `3px solid ${oshi.color}` }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ background: oshi.color }}
                  >
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      {oshi.name} {label}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: "var(--muted)" }}>
                      {url!.replace(/^https?:\/\//, "")}
                    </p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: oshi.color }}>
                    開く ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

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
