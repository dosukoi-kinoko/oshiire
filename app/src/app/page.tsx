"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { OshiCard } from "@/components/OshiCard";
import { usePref, LAYOUTS, type HomeLayout } from "@/lib/prefs";
import { getGenre } from "@/lib/genres";
import type { Oshi } from "@/lib/db";

export default function Home() {
  const router = useRouter();
  const [nickname] = usePref("nickname", "");
  const [layout, setLayout] = usePref("layout", "grid");

  // 初回起動時はチュートリアルへ (企画書§4)
  useEffect(() => {
    if (!localStorage.getItem("tutorialDone")) router.replace("/welcome");
  }, [router]);

  // ホームは箱+単独の推しだけ表示(メンバーは箱ページから)
  const oshis = useLiveQuery(
    () =>
      hasIDB()
        ? db.oshis
            .orderBy("lastViewedAt")
            .reverse()
            .filter((o) => !o.parentId)
            .toArray()
        : [],
    [],
  );
  const events = useLiveQuery(
    () =>
      hasIDB()
        ? db.events
            .where("date")
            .aboveOrEqual(new Date().toISOString().slice(0, 10))
            .sortBy("date")
        : [],
    [],
  );
  const next = events?.[0];
  const daysTo = next
    ? Math.ceil(
        (new Date(next.date).getTime() - new Date().setHours(0, 0, 0, 0)) /
          86400000,
      )
    : null;

  return (
    <main className="px-4 pt-6">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        おかえり{nickname ? `、${nickname}さん` : "なさい"} ✨
      </p>
      <h1 className="mt-1 text-2xl font-black tracking-wide">
        {nickname ? `${nickname}さんの` : "わたしの"}推し活
      </h1>

      {/* 直近イベントカウントダウン (FR-22) */}
      {next && (
        <Link
          href="/calendar"
          className="card mt-4 flex items-center gap-3 p-4"
        >
          <span className="text-3xl">⏳</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{next.title}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {next.date}
            </p>
          </div>
          <span className="chip px-3 py-1 text-sm">
            {daysTo === 0 ? "今日🎉" : `あと${daysTo}日`}
          </span>
        </Link>
      )}

      {/* レイアウト切替 (NFR-19): 文字ラベル付きでわかりやすく */}
      {oshis && oshis.length > 0 && (
        <div className="mt-5">
          <h2 className="font-bold">マイ推し</h2>
          <div className="mt-2 flex gap-1.5">
            {LAYOUTS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLayout(l.key)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${layout === l.key ? "chip" : "card"}`}
                style={layout !== l.key ? { color: "var(--muted)" } : undefined}
              >
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {oshis === undefined ? null : oshis.length === 0 ? (
        <EmptyState />
      ) : (
        <OshiCollection oshis={oshis} layout={layout as HomeLayout} />
      )}
    </main>
  );
}

// 空状態 (企画書§4)
function EmptyState() {
  return (
    <div className="card mt-6 flex flex-col items-center p-8 text-center">
      <span className="text-5xl">🗄️</span>
      <h2 className="mt-3 text-lg font-bold">オシイレへようこそ!</h2>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        推しを登録して、あなただけの
        <br />
        推し活ページを作りましょう
      </p>
      <Link href="/oshi/new" className="btn-accent mt-5 px-8 py-3">
        最初の推しを登録する
      </Link>
    </div>
  );
}

function OshiCollection({
  oshis,
  layout,
}: {
  oshis: Oshi[];
  layout: HomeLayout;
}) {
  if (layout === "stream") {
    const genres = [...new Set(oshis.map((o) => o.genre))];
    return (
      <div className="mt-3 space-y-4">
        {genres.map((genre) => (
          <section key={genre}>
            <h3 className="mb-2 text-sm font-bold" style={{ color: "var(--muted)" }}>
              {getGenre(genre).emoji} {getGenre(genre).label}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {oshis
                .filter((o) => o.genre === genre)
                .map((o) => (
                  <OshiCard key={o.id} oshi={o} small />
                ))}
            </div>
          </section>
        ))}
        <AddButton />
      </div>
    );
  }
  return (
    <>
      <div className={`mt-3 grid grid-cols-2 gap-3 ${layout === "collage" ? "collage" : ""}`}>
        {oshis.map((o) => (
          <OshiCard key={o.id} oshi={o} />
        ))}
      </div>
      <AddButton />
    </>
  );
}

function AddButton() {
  return (
    <div className="mt-5 text-center">
      <Link href="/oshi/new" className="btn-accent inline-block px-6 py-2.5 text-sm">
        ＋ 推しを追加
      </Link>
    </div>
  );
}
