"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { db, hasIDB, uid, type AltarPart, type Oshi } from "@/lib/db";
import { ALTAR_PARTS, getGenre } from "@/lib/genres";

// 祭壇モード v1 (FR-26a/26b/NFR-19d): 常設デコ祭壇(絵文字パーツ版)
// タップでパーツ追加→ドラッグで配置。鑑賞モードでUIを消して眺められる。
export default function AltarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [oshi, setOshi] = useState<Oshi | null>(null);
  const [parts, setParts] = useState<AltarPart[]>([]);
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
      }
    });
  }, [id]);

  const save = (next: AltarPart[]) => {
    setParts(next);
    db.oshis.update(id, { altar: { parts: next } });
  };

  if (!oshi) return null;
  const g = getGenre(oshi.genre);

  const addPart = (emoji: string) => {
    const part: AltarPart = {
      id: uid(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 45,
      size: 34,
    };
    save([...parts, part]);
    setSelected(part.id);
  };

  const updatePart = (pid: string, patch: Partial<AltarPart>) =>
    save(parts.map((p) => (p.id === pid ? { ...p, ...patch } : p)));

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

  return (
    <main className="fixed inset-0 z-[55] flex flex-col" style={{ background: "var(--bg)" }}>
      {/* 祭壇キャンバス */}
      <div
        ref={canvas}
        onPointerMove={onMove}
        onPointerUp={() => {
          if (drag.current?.moved) save(parts);
          drag.current = null;
        }}
        onPointerLeave={() => {
          if (drag.current?.moved) save(parts);
          drag.current = null;
        }}
        className="relative flex-1 touch-none select-none overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 120% 60% at 50% -10%, ${oshi.color}88, transparent 60%), linear-gradient(180deg, ${oshi.color}30 0%, var(--bg) 78%)`,
        }}
        onClick={() => setSelected(null)}
      >
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
            background: `radial-gradient(circle, ${oshi.color}66 0%, transparent 70%)`,
            animation: "altar-glow 4s ease-in-out infinite",
          }}
        />

        {/* ご神体: モノグラム台座 */}
        <div className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 text-center">
          <div
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full text-5xl font-black"
            style={{
              border: "3px solid #d9b64a",
              boxShadow: `0 0 30px ${oshi.color}aa, 0 0 0 7px rgba(217,182,74,0.25)`,
              background: `linear-gradient(160deg, ${oshi.color}cc, ${oshi.color}55)`,
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
        <div
          className="pointer-events-none absolute bottom-[18%] left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full opacity-40"
          style={{ background: oshi.color }}
        />
        <div
          className="pointer-events-none absolute bottom-[12%] left-1/2 h-3 w-[88%] -translate-x-1/2 rounded-full opacity-25"
          style={{ background: oshi.color }}
        />

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

      {/* パーツパレット(編集時のみ) */}
      {!viewMode && (
        <div className="border-t pb-[env(safe-area-inset-bottom)]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
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
                  save(parts.filter((p) => p.id !== sel.id));
                  setSelected(null);
                }}
                className="card px-3 py-1 text-sm"
                style={{ color: "var(--muted)" }}
              >
                削除
              </button>
            </div>
          )}
          <div className="flex gap-2 px-4 pt-2">
            {ALTAR_PARTS.map((grp, i) => (
              <button
                key={grp.group}
                onClick={() => setGroup(i)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${group === i ? "chip" : ""}`}
                style={group !== i ? { color: "var(--muted)" } : undefined}
              >
                {grp.group}
              </button>
            ))}
            <span className="ml-auto self-center text-[10px]" style={{ color: "var(--muted)" }}>
              タップで追加→ドラッグで移動
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
