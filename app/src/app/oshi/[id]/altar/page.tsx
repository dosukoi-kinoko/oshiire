"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { db, hasIDB, uid, type AltarPart, type AltarStyle, type Oshi } from "@/lib/db";
import { ALTAR_PARTS, ALTAR_STYLES, getGenre } from "@/lib/genres";

// 祭壇モード v2 (FR-26a/26b/NFR-19d): 雛形3種(和/聖堂/祝祭)+デコパーツ5系統
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

  // 雛形ごとの背景 (FR-26a)
  const BG: Record<AltarStyle, string> = {
    wa: `radial-gradient(ellipse 120% 60% at 50% -10%, ${c}88, transparent 60%), linear-gradient(180deg, ${c}30 0%, var(--bg) 78%)`,
    chapel: `radial-gradient(ellipse 80% 50% at 50% 8%, #fff3 0%, transparent 55%), linear-gradient(180deg, #241a3ee6 0%, ${c}22 45%, var(--bg) 82%)`,
    fiesta: `repeating-conic-gradient(from -8deg at 50% 26%, ${c}3c 0deg 9deg, #f7c94b2e 9deg 18deg), linear-gradient(180deg, ${c}22 0%, var(--bg) 80%)`,
  };

  return (
    <main className="fixed inset-0 z-[55] flex flex-col" style={{ background: "var(--bg)" }}>
      {/* 祭壇キャンバス */}
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
        {/* ===== 雛形ごとの舞台装飾 ===== */}
        {style === "wa" && (
          <>
            {/* 注連縄と提灯 */}
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-[9%] h-1.5 rounded-full opacity-70"
              style={{ background: "linear-gradient(90deg, #d9b64a, #a8842f, #d9b64a)" }}
            />
            {["18%", "38%", "58%", "78%"].map((x) => (
              <span
                key={x}
                className="pointer-events-none absolute top-[9.5%] text-xs opacity-70"
                style={{ left: x, color: "#e9e2cf" }}
              >
                ⚡︎
              </span>
            ))}
            <span className="pointer-events-none absolute left-[7%] top-[12%] text-3xl" style={{ animation: "altar-float 4s ease-in-out infinite" }}>🏮</span>
            <span className="pointer-events-none absolute right-[7%] top-[12%] text-3xl" style={{ animation: "altar-float 4s ease-in-out infinite", animationDelay: "1.5s" }}>🏮</span>
          </>
        )}
        {style === "chapel" && (
          <>
            {/* ステンドグラスのアーチ窓 */}
            <div
              className="pointer-events-none absolute left-1/2 top-[26%] h-72 w-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-80"
              style={{
                borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px",
                border: "5px solid #d9b64a88",
                background: `repeating-conic-gradient(from 0deg at 50% 42%, ${c}77 0deg 18deg, #7a5cff55 18deg 36deg, #4aa8ff4d 36deg 54deg, #e585b055 54deg 72deg, #f2c48d55 72deg 90deg)`,
                boxShadow: `inset 0 0 60px #ffffff40, 0 0 40px ${c}55`,
              }}
            />
            <span className="pointer-events-none absolute left-[16%] top-[46%] text-2xl">🕯️</span>
            <span className="pointer-events-none absolute right-[16%] top-[46%] text-2xl">🕯️</span>
          </>
        )}
        {style === "fiesta" && (
          <>
            {/* パペルピカド(切り絵の旗) */}
            <div className="pointer-events-none absolute left-0 right-0 top-[7%] flex justify-center gap-1 opacity-85">
              {["#f26d78", "#f7c94b", "#4aa8ff", "#8fd0bd", "#e585b0", "#b9a7e6", "#f26d78", "#f7c94b"].map((fc, i) => (
                <span
                  key={i}
                  className="inline-block h-6 w-6"
                  style={{ background: fc, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />
              ))}
            </div>
            {/* マリーゴールドの花綱 */}
            <div className="pointer-events-none absolute left-0 right-0 top-[11%] text-center text-xl tracking-[0.6em] opacity-90">
              🌼🌺🌼🌺🌼
            </div>
            <span className="pointer-events-none absolute left-[10%] top-[50%] text-3xl" style={{ animation: "altar-float 3s ease-in-out infinite" }}>🪔</span>
            <span className="pointer-events-none absolute right-[10%] top-[50%] text-3xl" style={{ animation: "altar-float 3s ease-in-out infinite", animationDelay: "1s" }}>🪔</span>
          </>
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
            <p className="text-sm font-bold">⛩️ {oshi.name}の祭壇</p>
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
          className="pointer-events-none absolute left-1/2 top-[30%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${c}66 0%, transparent 70%)`,
            animation: "altar-glow 4s ease-in-out infinite",
          }}
        />

        {/* ご神体: モノグラム台座 */}
        <div className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 text-center">
          <div
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full text-5xl font-black"
            style={{
              border: "3px solid #d9b64a",
              boxShadow: `0 0 30px ${c}aa, 0 0 0 7px rgba(217,182,74,0.25)`,
              background: `linear-gradient(160deg, ${c}cc, ${c}55)`,
              color: "#fff",
              fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif',
            }}
          >
            {oshi.name.slice(0, 1)}
          </div>
          <p
            className="mt-3 text-lg font-black tracking-widest"
            style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}
          >
            {oshi.name}
          </p>
        </div>

        {/* 台座の段 */}
        <div className="pointer-events-none absolute bottom-[18%] left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full opacity-40" style={{ background: c }} />
        <div className="pointer-events-none absolute bottom-[12%] left-1/2 h-3 w-[88%] -translate-x-1/2 rounded-full opacity-25" style={{ background: c }} />

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
              filter: selected === p.id && !viewMode ? "drop-shadow(0 0 8px #d9b64a)" : undefined,
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
          {/* 雛形セレクター (FR-26a) */}
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
