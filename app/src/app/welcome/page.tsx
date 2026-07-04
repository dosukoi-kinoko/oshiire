"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// チュートリアル (企画書§4): 初回起動時に自動表示・スワイプ対応・設定から再表示可
const SLIDES = [
  {
    emoji: "🗄️",
    title: "ようこそ、オシイレへ",
    body: "推し活のすべてをひとつに。\nSNSリンク・ニュース・記録・カレンダーを\nあなただけの推し活ページにまとめられます。",
  },
  {
    emoji: "📦",
    title: "「箱ごと」推せる",
    body: "相撲部屋・アイドルグループ・チームを\n「箱」としてまるごと登録。\n箱の中に力士やメンバーの\n個人ページを作れます。\n\n例: 伊勢ヶ濱部屋 → 尊富士",
  },
  {
    emoji: "📝",
    title: "記録が積み上がる",
    body: "観戦・参戦の思い出を1行から記録。\n⭐マークやチケットの当落🎫も残せて、\n過去の思い出も遡って登録できます。",
  },
  {
    emoji: "📅",
    title: "カレンダーとカウントダウン",
    body: "推しごとの色ラベルで予定を管理。\n次のイベントまでの日数が\nホームに自動で表示されます。",
  },
  {
    emoji: "🎨",
    title: "じぶん好みにきせかえ",
    body: "テーマは3種類、推しごとのテーマ色も\n自由自在。推しページを開いて\n色をタップするだけで変わります。",
  },
  {
    emoji: "🔒",
    title: "データはあなたの端末の中に",
    body: "登録もログインも不要。\nデータはすべてこの端末に保存されます。\n設定からいつでもバックアップできます。\n\nさっそく始めましょう!",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  const finish = () => {
    localStorage.setItem("tutorialDone", "1");
    router.replace("/");
  };

  const goTo = (i: number) => {
    scroller.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "start" });
  };

  return (
    <main className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--bg)", backgroundImage: "var(--bg-grad)" }}>
      <div className="flex justify-end p-4">
        <button onClick={finish} className="text-sm" style={{ color: "var(--muted)" }}>
          スキップ
        </button>
      </div>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          setPage(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {SLIDES.map((s, i) => (
          <section
            key={i}
            className="flex w-full shrink-0 snap-start flex-col items-center justify-center px-10 text-center"
          >
            <span className="text-7xl">{s.emoji}</span>
            <h2 className="mt-6 text-2xl font-black">{s.title}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {s.body}
            </p>
          </section>
        ))}
      </div>

      <div className="pb-10 pt-4">
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`スライド${i + 1}`}
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all"
              style={{
                width: page === i ? 20 : 8,
                background: page === i ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>
        <div className="px-8 pt-5">
          {page === SLIDES.length - 1 ? (
            <button onClick={finish} className="btn-accent w-full py-3.5">
              オシイレを始める ✨
            </button>
          ) : (
            <button onClick={() => goTo(page + 1)} className="btn-accent w-full py-3.5">
              次へ →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
