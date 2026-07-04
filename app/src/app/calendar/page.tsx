"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB, uid, type TicketStatus } from "@/lib/db";
import { getGenre } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

const TICKET: Record<TicketStatus, string> = {
  none: "",
  applied: "🎫申込中",
  won: "🎫当選🎉",
  lost: "🎫ご縁待ち",
};

// 推しカレンダー (FR-16) + チケット当落 (FR-16b)
export default function CalendarPage() {
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10));
  const [adding, setAdding] = useState(false);

  const monthStr = `${ym.y}-${String(ym.m + 1).padStart(2, "0")}`;
  const events = useLiveQuery(
    () =>
      hasIDB()
        ? db.events.where("date").startsWith(monthStr).sortBy("date")
        : [],
    [monthStr],
  );
  const oshis = useLiveQuery(() => (hasIDB() ? db.oshis.toArray() : []), []);
  const byId = new Map(oshis?.map((o) => [o.id, o]) ?? []);

  const first = new Date(ym.y, ym.m, 1);
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(first.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${monthStr}-${String(i + 1).padStart(2, "0")}`),
  ];
  const eventDates = new Map<string, string[]>();
  events?.forEach((e) => {
    const colors = eventDates.get(e.date) ?? [];
    colors.push(byId.get(e.oshiId)?.color ?? "var(--accent)");
    eventDates.set(e.date, colors);
  });
  const dayEvents = events?.filter((e) => e.date === selected) ?? [];

  const move = (d: number) => {
    const m = ym.m + d;
    setYm({ y: ym.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  return (
    <main>
      <PageHeader title="推しカレンダー" back={false} />
      <div className="card mx-4 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => move(-1)} className="px-3 py-1 text-lg">←</button>
          <span className="font-bold">{ym.y}年{ym.m + 1}月</span>
          <button onClick={() => move(1)} className="px-3 py-1 text-lg">→</button>
        </div>
        <div className="mt-3 grid grid-cols-7 text-center text-[11px]" style={{ color: "var(--muted)" }}>
          {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1">
          {cells.map((date, i) => (
            <button
              key={i}
              disabled={!date}
              onClick={() => date && setSelected(date)}
              className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm"
              style={
                date === selected
                  ? { background: "var(--accent)", color: "#fff", fontWeight: 700 }
                  : undefined
              }
            >
              {date ? Number(date.slice(8)) : ""}
              {date && eventDates.has(date) && (
                <span className="absolute bottom-0.5 flex gap-0.5">
                  {eventDates.get(date)!.slice(0, 3).map((c, j) => (
                    <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                  ))}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{selected.replace(/-/g, "/")}</h2>
          <button onClick={() => setAdding(true)} className="btn-accent px-4 py-1.5 text-sm">
            ＋予定
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {dayEvents.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>予定はありません</p>
          )}
          {dayEvents.map((e) => {
            const o = byId.get(e.oshiId);
            return (
              <div key={e.id} className="card flex items-center gap-3 p-3.5">
                <span className="h-8 w-1.5 rounded-full" style={{ background: o?.color ?? "var(--accent)" }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{e.title}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {o ? `${getGenre(o.genre).emoji} ${o.name}` : ""} {TICKET[e.ticket]}
                  </p>
                </div>
                <TicketToggle event={e} />
                <button
                  onClick={async () => {
                    if (confirm("この予定を削除しますか?")) await db.events.delete(e.id);
                  }}
                  className="text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  削除
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {adding && (
        <AddEventSheet
          date={selected}
          onClose={() => setAdding(false)}
        />
      )}
    </main>
  );
}

// 当落ステータスをタップで循環 (FR-16b: 最小実装)
function TicketToggle({ event }: { event: { id: string; ticket: TicketStatus } }) {
  const order: TicketStatus[] = ["none", "applied", "won", "lost"];
  return (
    <button
      onClick={() =>
        db.events.update(event.id, {
          ticket: order[(order.indexOf(event.ticket) + 1) % order.length],
        })
      }
      className="chip px-2.5 py-1 text-[11px]"
    >
      {event.ticket === "none" ? "🎫" : TICKET[event.ticket]}
    </button>
  );
}

function AddEventSheet({ date, onClose }: { date: string; onClose: () => void }) {
  const oshis = useLiveQuery(
    () => (hasIDB() ? db.oshis.orderBy("lastViewedAt").reverse().toArray() : []),
    [],
  );
  const [title, setTitle] = useState("");
  const [oshiId, setOshiId] = useState("");

  const save = async () => {
    if (!title.trim() || !oshiId) return;
    await db.events.add({
      id: uid(),
      oshiId,
      date,
      title: title.trim(),
      ticket: "none",
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl p-5 pb-10"
        style={{ background: "var(--bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold">{date.replace(/-/g, "/")} の予定を追加</h3>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 春場所 初日"
          className="card mt-3 w-full px-4 py-3 outline-none"
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {oshis?.map((o) => (
            <button
              key={o.id}
              onClick={() => setOshiId(o.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm ${oshiId === o.id ? "chip" : "card"}`}
            >
              {getGenre(o.genre).emoji} {o.name}
            </button>
          ))}
        </div>
        <button onClick={save} disabled={!title.trim() || !oshiId} className="btn-accent mt-4 w-full py-3 disabled:opacity-40">
          追加する
        </button>
      </div>
    </div>
  );
}
