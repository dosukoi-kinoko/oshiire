"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { db, hasIDB, uid, type AltarPart, type AltarStyle, type Oshi } from "@/lib/db";
import { ALTAR_PARTS, ALTAR_STYLES, getGenre } from "@/lib/genres";

const GOLD = "linear-gradient(180deg, #f7e08a 0%, #d9a93f 40%, #9c7222 75%, #d9a93f 100%)";

// 祭壇モード v3 (FR-26a/26b/NFR-19d): 豪華絢爛な雛形3種(和/聖堂/祝祭)
export default function AltarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [oshi, setOshi] = useState<Oshi | null>(null);
  const [parts, setParts] = useState<AltarPart[]>([]);
  const [style, setStyle] = useState<AltarStyle>("wa");
  const [selected, setSelected] = useState<string | null>(null);
  const [group, setGroup] = useState(0);
  const [viewMode, setViewMode] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  useEffect(() => {
    if (!hasIDB()) return;
    db.oshis.get(id).then((o) => {
      if (o) {
        setOshi(o);
        setParts(o.altar?.parts ?? []);
        setStyle(o.altar?.style ?? "wa");
      }
    });
  }, [id]);

  const persist = (nextParts: AltarPart[], nextStyle: AltarStyle = style) => {
    setParts(nextParts);
    db.oshis.update(id, { altar: { style: nextStyle, parts: nextParts } });
  };

  if (!oshi) return null;
  const g = getGenre(oshi.genre);
  const c = oshi.color;

  const addPart = (emoji: string) => {
    const part: AltarPart = {
      id: uid(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 45,
      size: 34,
    };
    persist([...parts, part]);
    setSelected(part.id);
  };

  const updatePart = (pid: string, patch: Partial<AltarPart>) =>
    persist(parts.map((p) => (p.id === pid ? { ...p, ...patch } : p)));

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !canvas.current) return;
    const rect = canvas.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(96, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100));
    drag.current.moved = true;
    setParts((ps) =>
      ps.map((p) => (p.id === drag.current!.id ? { ...p, x, y } : p)),
    );
  };

  const sel = parts.find((p) => p.id === selected);

  // 雛形ごとの基調背景(派手に・参考: 神社の金彫刻/バロック聖堂/死者の日の祭壇)
  const BG: Record<AltarStyle, string> = {
    wa: `radial-gradient(ellipse 100% 45% at 50% 20%, ${c}55, transparent 65%), linear-gradient(180deg, #331111 0%, #571d1e 35%, #38151f 70%, #200c10 100%)`,
    chapel: `radial-gradient(ellipse 85% 50% at 50% 12%, #ffdf8e40 0%, transparent 60%), linear-gradient(180deg, #31163a 0%, #55203a 40%, #2b1030 75%, #180a1c 100%)`,
    fiesta: `repeating-conic-gradient(from -8deg at 50% 28%, #ff6d3a4d 0deg 9deg, #ffd93b40 9deg 18deg, #ff3a7a40 18deg 27deg, #3ad1ff33 27deg 36deg), linear-gradient(180deg, #4a1c52 0%, #7a2c40 55%, #2c1034 100%)`,
  };

  const PICADO = ["#ff4fa3", "#ffd93b", "#3ad1ff", "#7be28a", "#b98aff", "#ff7a3a", "#ff4fa3", "#ffd93b"];
  const ARCH = [
    { x: 50, y: 13 }, { x: 40, y: 14 }, { x: 60, y: 14 }, { x: 31, y: 17 }, { x: 69, y: 17 },
    { x: 25, y: 22 }, { x: 75, y: 22 }, { x: 21, y: 29 }, { x: 79, y: 29 }, { x: 19, y: 37 }, { x: 81, y: 37 },
  ];

  return (
    <main className="fixed inset-0 z-[55] flex flex-col" style={{ background: "var(--bg)" }}>
      <div
        ref={canvas}
        onPointerMove={onMove}
        onPointerUp={() => {
          if (drag.current?.moved) persist(parts);
          drag.current = null;
        }}
        onPointerLeave={() => {
          if (drag.current?.moved) persist(parts);
          drag.current = null;
        }}
        className="relative flex-1 touch-none select-none overflow-hidden"
        style={{ background: BG[style] }}
        onClick={() => setSelected(null)}
      >
        {/* ===== ⛩️ 和: 金彫刻の梁・瓔珞・紅白幕・金柱・赤絨毯 ===== */}
        {style === "wa" && (
          <div className="pointer-events-none absolute inset-0">
            {/* 金の梁(彫刻風の光沢) */}
            <div className="absolute left-0 right-0 top-0 h-12" style={{ background: GOLD, boxShadow: "0 4px 18px #00000088" }}>
              <div className="h-full w-full opacity-30" style={{ background: "repeating-linear-gradient(90deg, transparent 0 10px, #6b4a10 10px 13px, transparent 13px 26px, #fff3 26px 30px)" }} />
            </div>
            {/* 瓔珞(金の飾り紐) */}
            {["12%", "31%", "50%", "69%", "88%"].map((x, i) => (
              <div key={x} className="absolute top-12" style={{ left: x }}>
                <div className="mx-auto w-1 rounded-b" style={{ height: i % 2 ? 44 : 60, background: GOLD }} />
                <div className="mx-auto -mt-1 h-3 w-3 rotate-45" style={{ background: GOLD, boxShadow: "0 0 8px #f7e08a99" }} />
              </div>
            ))}
            {/* 紅白の幕(スカラップ) */}
            <div
              className="absolute left-0 right-0 top-12 h-10 opacity-90"
              style={{
                background:
                  "radial-gradient(circle 22px at 11px 0, #a8202f 98%, transparent), radial-gradient(circle 22px at 55px 0, #f4ecdc 98%, transparent)",
                backgroundSize: "88px 40px",
                backgroundRepeat: "repeat-x",
              }}
            />
            {/* 金柱 */}
            <div className="absolute bottom-0 left-0 top-12 w-5" style={{ background: GOLD, opacity: 0.85 }} />
            <div className="absolute bottom-0 right-0 top-12 w-5" style={{ background: GOLD, opacity: 0.85 }} />
            {/* 赤絨毯 */}
            <div
              className="absolute bottom-0 left-1/2 h-[34%] w-[64%] -translate-x-1/2 opacity-90"
              style={{
                clipPath: "polygon(28% 0, 72% 0, 100% 100%, 0 100%)",
                background: "linear-gradient(180deg, #a8202f, #7c1420)",
                boxShadow: "0 0 30px #a8202f66",
              }}
            />
            {/* 提灯と金龍の気配 */}
            <span className="absolute left-[8%] top-[16%] text-4xl" style={{ animation: "altar-float 4s ease-in-out infinite" }}>🏮</span>
            <span className="absolute right-[8%] top-[16%] text-4xl" style={{ animation: "altar-float 4s ease-in-out infinite", animationDelay: "1.5s" }}>🏮</span>
            <span className="absolute left-[10%] top-[48%] text-2xl">🪷</span>
            <span className="absolute right-[10%] top-[48%] text-2xl">🪷</span>
            <span className="absolute left-1/2 top-[3%] -translate-x-1/2 text-xl">🐉</span>
          </div>
        )}

        {/* ===== 🕊️ 聖堂: 黄金アーチ・大柱・シャンデリア・蝋燭の列 ===== */}
        {style === "chapel" && (
          <div className="pointer-events-none absolute inset-0">
            {/* 天からの光 */}
            <div className="absolute inset-0 opacity-50" style={{ background: `conic-gradient(from 178deg at 50% -8%, transparent 0deg, #ffdf8e33 8deg, transparent 16deg, #ffdf8e22 24deg, transparent 32deg, #ffdf8e33 40deg, transparent 48deg)` }} />
            {/* 黄金の大アーチ(二重) */}
            <div
              className="absolute left-1/2 top-[27%] h-[340px] w-64 -translate-x-1/2 -translate-y-1/2"
              style={{ borderRadius: "50% 50% 10px 10px / 42% 42% 10px 10px", background: GOLD, boxShadow: "0 0 40px #d9a93f88, 0 8px 30px #00000099" }}
            />
            <div
              className="absolute left-1/2 top-[27%] h-[316px] w-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
              style={{
                borderRadius: "50% 50% 8px 8px / 42% 42% 8px 8px",
                background: `repeating-conic-gradient(from 0deg at 50% 40%, ${c}88 0deg 16deg, #7a5cff66 16deg 32deg, #d43a6a66 32deg 48deg, #4aa8ff5c 48deg 64deg, #ffd93b5c 64deg 80deg)`,
                boxShadow: "inset 0 0 70px #ffffff4d",
              }}
            />
            {/* 大柱(左右2本ずつ) */}
            {[{ l: "3%" }, { l: "14%" }, { r: "14%" }, { r: "3%" }].map((p, i) => (
              <div key={i} className="absolute bottom-0 top-[6%] w-7" style={{ ...(("l" in p) ? { left: p.l } : { right: p.r }), background: GOLD, opacity: 0.9, boxShadow: "0 0 14px #00000066" }}>
                <div className="h-full w-full opacity-40" style={{ background: "repeating-linear-gradient(0deg, transparent 0 26px, #6b4a10 26px 30px)" }} />
              </div>
            ))}
            {/* シャンデリア */}
            {[{ x: "22%" }, { x: "78%" }].map((p, i) => (
              <div key={i} className="absolute top-0" style={{ left: p.x }}>
                <div className="mx-auto h-16 w-0.5" style={{ background: "#d9a93f" }} />
                <div className="h-6 w-6 -translate-x-1/2 rounded-full" style={{ marginLeft: 1, background: "radial-gradient(circle, #fff3c4, #ffd93b 55%, #d9a93f)", boxShadow: "0 0 34px 14px #ffd93b77", animation: "altar-glow 3s ease-in-out infinite", animationDelay: `${i}s` }} />
              </div>
            ))}
            {/* 蝋燭の列 */}
            <div className="absolute bottom-[20%] left-0 right-0 text-center text-xl tracking-[0.9em]" style={{ textShadow: "0 0 14px #ffd93b" }}>
              🕯️🕯️🕯️🕯️🕯️🕯️
            </div>
            <span className="absolute left-[8%] top-[52%] text-2xl">🌹</span>
            <span className="absolute right-[8%] top-[52%] text-2xl">🌹</span>
          </div>
        )}

        {/* ===== 🌼 祝祭: パペルピカドの壁・マリーゴールドのアーチ・段々祭壇 ===== */}
        {style === "fiesta" && (
          <div className="pointer-events-none absolute inset-0">
            {/* パペルピカドの壁(2段) */}
            {[0, 1].map((row) => (
              <div key={row} className="absolute left-0 right-0 flex justify-center gap-0.5" style={{ top: row === 0 ? "0%" : "7.5%" }}>
                {(row ? [...PICADO].reverse() : PICADO).map((fc, i) => (
                  <span
                    key={i}
                    className="inline-block h-12 w-12 opacity-95"
                    style={{
                      background: fc,
                      clipPath: "polygon(0 0, 100% 0, 100% 72%, 83% 100%, 66% 72%, 50% 100%, 33% 72%, 16% 100%, 0 72%)",
                      boxShadow: "0 2px 8px #00000055",
                    }}
                  />
                ))}
              </div>
            ))}
            {/* マリーゴールドのアーチ */}
            {ARCH.map((p, i) => (
              <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl" style={{ left: `${p.x}%`, top: `${p.y + 8}%`, animation: "altar-float 3.5s ease-in-out infinite", animationDelay: `${i * 0.25}s` }}>
                {i % 2 ? "🌺" : "🌼"}
              </span>
            ))}
            {/* 段々の祭壇(色布) */}
            {[
              { b: "22%", w: "56%", bg: "repeating-linear-gradient(90deg, #7a2ea0 0 14px, #2e7ac0 14px 28px, #d0345f 28px 42px)" },
              { b: "15%", w: "74%", bg: "repeating-linear-gradient(90deg, #d0345f 0 14px, #ffd93b 14px 28px, #2e9e6e 28px 42px)" },
              { b: "8%", w: "92%", bg: "repeating-linear-gradient(90deg, #2e7ac0 0 14px, #ff7a3a 14px 28px, #7a2ea0 28px 42px)" },
            ].map((s, i) => (
              <div key={i} className="absolute left-1/2 h-6 -translate-x-1/2 rounded" style={{ bottom: s.b, width: s.w, background: s.bg, boxShadow: "0 4px 12px #00000066" }} />
            ))}
            {/* 花と灯り */}
            <div className="absolute bottom-[4%] left-0 right-0 text-center text-xl tracking-[0.5em]">🌼🌺🌼🌺🌼🌺🌼</div>
            <span className="absolute left-[6%] top-[42%] text-3xl" style={{ animation: "altar-float 3s ease-in-out infinite" }}>🪔</span>
            <span className="absolute right-[6%] top-[42%] text-3xl" style={{ animation: "altar-float 3s ease-in-out infinite", animationDelay: "1s" }}>🪔</span>
            <span className="absolute left-[14%] top-[58%] text-2xl">🪅</span>
            <span className="absolute right-[14%] top-[58%] text-2xl">🪅</span>
          </div>
        )}

        {/* 上部バー(鑑賞モードでは非表示) */}
        {!viewMode && (
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.back();
              }}
              aria-label="戻る"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              ←
            </button>
            <p className="rounded-full bg-black/30 px-3 py-1 text-sm font-bold text-white">⛩️ {oshi.name}の祭壇</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewMode(true);
                setSelected(null);
              }}
              className="chip px-3 py-1.5 text-xs"
            >
              鑑賞✨
            </button>
          </div>
        )}
        {viewMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode(false);
            }}
            className="absolute right-4 top-4 z-10 rounded-full px-3 py-1.5 text-xs opacity-60"
            style={{ background: "var(--surface)" }}
          >
            編集に戻る
          </button>
        )}

        {/* 後光 */}
        <div
          className="pointer-events-none absolute left-1/2 top-[30%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle, #ffd93b55 0%, ${c}44 40%, transparent 70%)`,
            animation: "altar-glow 4s ease-in-out infinite",
          }}
        />

        {/* ご神体: モノグラム台座 */}
        <div className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 text-center">
          <div
            className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-5xl font-black"
            style={{
              border: "4px solid #f0cf6a",
              boxShadow: `0 0 36px ${c}cc, 0 0 0 8px #d9a93f55, 0 0 70px #ffd93b44`,
              background: `linear-gradient(160deg, ${c}dd, ${c}66)`,
              color: "#fff",
              textShadow: "0 2px 10px #00000088",
              fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif',
            }}
          >
            {oshi.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={oshi.photo} alt={oshi.name} className="h-full w-full object-cover" />
            ) : (
              oshi.name.slice(0, 1)
            )}
          </div>
          <p
            className="mt-3 text-lg font-black tracking-widest text-white"
            style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif', textShadow: "0 2px 12px #000000cc" }}
          >
            {oshi.name}
          </p>
        </div>

        {/* デコパーツ */}
        {parts.map((p) => (
          <button
            key={p.id}
            onClick={(e) => {
              e.stopPropagation();
              if (!viewMode && !drag.current?.moved) setSelected(p.id);
            }}
            onPointerDown={(e) => {
              if (viewMode) return;
              e.stopPropagation();
              (e.currentTarget.parentElement as HTMLElement)?.setPointerCapture?.(e.pointerId);
              drag.current = { id: p.id, moved: false };
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: p.size,
              filter: selected === p.id && !viewMode ? "drop-shadow(0 0 8px #f0cf6a)" : "drop-shadow(0 2px 4px #00000066)",
              animation: "altar-float 3.5s ease-in-out infinite",
              animationDelay: `${(p.x + p.y) % 3}s`,
            }}
          >
            {p.emoji}
          </button>
        ))}
      </div>

      {/* パレット(編集時のみ) */}
      {!viewMode && (
        <div className="border-t pb-[env(safe-area-inset-bottom)]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 border-b px-4 py-2" style={{ borderColor: "var(--border)" }}>
            <span className="text-[10px] font-bold" style={{ color: "var(--muted)" }}>
              雛形
            </span>
            {ALTAR_STYLES.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setStyle(s.key);
                  persist(parts, s.key);
                }}
                className={`rounded-full px-3 py-1 text-xs font-bold ${style === s.key ? "chip" : "card"}`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
            <span className="ml-auto text-[10px]" style={{ color: "var(--muted)" }}>
              {ALTAR_STYLES.find((s) => s.key === style)?.desc}
            </span>
          </div>

          {sel && (
            <div className="flex items-center justify-center gap-3 border-b px-4 py-2" style={{ borderColor: "var(--border)" }}>
              <span className="text-lg">{sel.emoji}</span>
              <button onClick={() => updatePart(sel.id, { size: Math.max(18, sel.size - 6) })} className="card px-3 py-1 text-sm">
                小さく
              </button>
              <button onClick={() => updatePart(sel.id, { size: Math.min(80, sel.size + 6) })} className="card px-3 py-1 text-sm">
                大きく
              </button>
              <button
                onClick={() => {
                  persist(parts.filter((p) => p.id !== sel.id));
                  setSelected(null);
                }}
                className="card px-3 py-1 text-sm"
                style={{ color: "var(--muted)" }}
              >
                削除
              </button>
            </div>
          )}
          <div className="flex gap-1 overflow-x-auto px-4 pt-2">
            {ALTAR_PARTS.map((grp, i) => (
              <button
                key={grp.group}
                onClick={() => setGroup(i)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${group === i ? "chip" : ""}`}
                style={group !== i ? { color: "var(--muted)" } : undefined}
              >
                {grp.group}
              </button>
            ))}
            <span className="ml-auto shrink-0 self-center text-[10px]" style={{ color: "var(--muted)" }}>
              タップで追加
            </span>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 py-2">
            {ALTAR_PARTS[group].emojis.map((e) => (
              <button
                key={e}
                onClick={() => addPart(e)}
                className="shrink-0 rounded-xl p-2 text-2xl active:scale-90"
                style={{ background: "var(--surface-2)" }}
              >
                {e}
              </button>
            ))}
          </div>
          <p className="pb-2 text-center text-[10px]" style={{ color: "var(--muted)" }}>
            {g.memberLabel === "力士" ? "御贔屓の益々の活躍を祈願🙏" : `${oshi.name}への愛を飾ろう💕`}
          </p>
        </div>
      )}
    </main>
  );
}
