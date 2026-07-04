"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB, type Oshi, type OshiStatus } from "@/lib/db";
import { getGenre } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

// 推し編集: 推しカラー(FR-12)・SNSリンク・記念日(FR-16a)・ステータス(FR-13)
// +箱推し対応(FR-10a): 所属箱・サブタイトル・情報テーブル(FR-12a)
export default function EditOshiPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [oshi, setOshi] = useState<Oshi | null>(null);
  const boxes = useLiveQuery(
    () => (hasIDB() ? db.oshis.where("kind").equals("box").toArray() : []),
    [],
  );

  useEffect(() => {
    if (hasIDB()) db.oshis.get(id).then((o) => setOshi(o ?? null));
  }, [id]);

  if (!oshi) return null;
  const set = (patch: Partial<Oshi>) => setOshi({ ...oshi, ...patch });
  const g = getGenre(oshi.genre);

  const save = async () => {
    await db.oshis.put({
      ...oshi,
      profile: (oshi.profile ?? []).filter((r) => r.label.trim() || r.value.trim()),
    });
    router.back();
  };

  const remove = async () => {
    if (!confirm(`「${oshi.name}」を削除しますか?記録も一緒に削除されます`)) return;
    await db.transaction("rw", db.oshis, db.records, db.events, async () => {
      // 箱を消してもメンバーは残す(所属だけ解除)
      await db.oshis.where("parentId").equals(id).modify({ parentId: undefined });
      await db.records.where("oshiId").equals(id).delete();
      await db.events.where("oshiId").equals(id).delete();
      await db.oshis.delete(id);
    });
    router.replace("/");
  };

  const input = "card mt-1.5 w-full px-4 py-3 outline-none";
  const label = "mt-4 block text-sm font-bold";

  return (
    <main>
      <PageHeader title="推しを編集" sub={oshi.name} />
      <div className="p-4 pb-8">
        <label className={label}>
          名前
          <input className={input} value={oshi.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className={label}>
          推しカラー
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="color"
              value={oshi.color}
              onChange={(e) => set({ color: e.target.value })}
              className="h-12 w-20 cursor-pointer rounded-lg"
            />
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              カードや推し歴の表示に使われます
            </span>
          </div>
        </label>
        <label className={label}>
          英字サブタイトル（ページ上部に飾り表示・任意）
          <input
            className={input}
            value={oshi.subtitle ?? ""}
            onChange={(e) => set({ subtitle: e.target.value })}
            placeholder="例: ISEGAHAMA BEYA"
          />
        </label>

        {oshi.kind === "solo" && (boxes?.length ?? 0) > 0 && (
          <div className={label}>
            所属する箱
            <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => set({ parentId: undefined })}
                className={`shrink-0 rounded-full px-4 py-2 text-sm ${!oshi.parentId ? "chip" : "card"}`}
              >
                なし
              </button>
              {boxes!
                .filter((b) => b.id !== id)
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => set({ parentId: b.id })}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm ${oshi.parentId === b.id ? "chip" : "card"}`}
                  >
                    📦 {b.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className={label}>
          {oshi.kind === "box" ? `${g.boxLabel}情報` : "プロフィール"}（項目は自由に追加できます）
          {(oshi.profile ?? []).map((row, i) => (
            <div key={i} className="mt-1.5 flex gap-2">
              <input
                className="card w-28 shrink-0 px-3 py-2.5 text-sm outline-none"
                value={row.label}
                placeholder="項目名"
                onChange={(e) => {
                  const p = [...(oshi.profile ?? [])];
                  p[i] = { ...p[i], label: e.target.value };
                  set({ profile: p });
                }}
              />
              <input
                className="card min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                value={row.value}
                placeholder="内容"
                onChange={(e) => {
                  const p = [...(oshi.profile ?? [])];
                  p[i] = { ...p[i], value: e.target.value };
                  set({ profile: p });
                }}
              />
              <button
                aria-label="行を削除"
                onClick={() => set({ profile: (oshi.profile ?? []).filter((_, j) => j !== i) })}
                className="shrink-0 px-1 text-sm"
                style={{ color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              set({ profile: [...(oshi.profile ?? []), { label: "", value: "" }] })
            }
            className="card mt-2 w-full py-2 text-sm"
          >
            ＋ 行を追加（例: 所在地・所属{g.memberLabel}数・出身地）
          </button>
        </div>

        <label className={label}>
          推し始めた日（推し歴の起点になります）
          <input type="date" className={input} value={oshi.oshiStartDate ?? ""} onChange={(e) => set({ oshiStartDate: e.target.value })} />
        </label>
        <label className={label}>
          ひとことメモ
          <input className={input} value={oshi.memo ?? ""} onChange={(e) => set({ memo: e.target.value })} placeholder="例: 世界一かっこいい" />
        </label>

        <h3 className="mt-6 font-bold">SNSリンク</h3>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          プロフィールURLを貼ると推しページにリンクカードが表示されます
        </p>
        {(
          [
            ["x", "X (Twitter)"],
            ["instagram", "Instagram"],
            ["youtube", "YouTube"],
            ["tiktok", "TikTok"],
          ] as const
        ).map(([key, name]) => (
          <label key={key} className={label}>
            {name}
            <input
              className={input}
              inputMode="url"
              placeholder="https://..."
              value={oshi.sns[key] ?? ""}
              onChange={(e) => set({ sns: { ...oshi.sns, [key]: e.target.value } })}
            />
          </label>
        ))}

        <h3 className="mt-6 font-bold">ステータス (FR-13)</h3>
        <div className="mt-2 flex gap-2">
          {(
            [
              ["active", "通常"],
              ["graduated", "🎓 卒業"],
              ["dormant", "💤 休眠"],
            ] as [OshiStatus, string][]
          ).map(([s, labelText]) => (
            <button
              key={s}
              onClick={() => set({ status: s })}
              className={`rounded-full px-4 py-2 text-sm ${oshi.status === s ? "chip" : "card"}`}
            >
              {labelText}
            </button>
          ))}
        </div>

        <button onClick={save} className="btn-accent mt-8 w-full py-3.5">
          保存する
        </button>
        <button onClick={remove} className="mt-3 w-full py-2 text-sm" style={{ color: "var(--muted)" }}>
          この推しを削除する
        </button>
      </div>
    </main>
  );
}
