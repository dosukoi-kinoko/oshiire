"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { usePref, THEMES } from "@/lib/prefs";

// 設定 (企画書§4): テーマ・ニックネーム・データ管理
export default function SettingsPage() {
  const [theme, setTheme] = usePref("theme", "stylish");
  const [nickname, setNickname] = usePref("nickname", "");
  const counts = useLiveQuery(async () => {
    if (!hasIDB()) return { oshis: 0, records: 0, events: 0 };
    return {
      oshis: await db.oshis.count(),
      records: await db.records.count(),
      events: await db.events.count(),
    };
  }, []);

  // JSONエクスポート (FR-27)
  const exportJson = async () => {
    const data = {
      app: "oshiire",
      version: 1,
      exportedAt: new Date().toISOString(),
      oshis: await db.oshis.toArray(),
      records: await db.records.toArray(),
      events: await db.events.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `oshiire-backup-${data.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== "oshiire") throw new Error();
      await db.transaction("rw", db.oshis, db.records, db.events, async () => {
        await db.oshis.bulkPut(data.oshis ?? []);
        await db.records.bulkPut(data.records ?? []);
        await db.events.bulkPut(data.events ?? []);
      });
      alert("インポートが完了しました✨");
    } catch {
      alert("オシイレのバックアップファイルではないようです");
    }
  };

  return (
    <main>
      <PageHeader title="設定" back={false} />
      <div className="space-y-6 p-4">
        <section>
          <h2 className="text-sm font-bold">ニックネーム</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="呼ばれたい名前"
            className="card mt-2 w-full px-4 py-3 outline-none"
          />
        </section>

        <section>
          <h2 className="text-sm font-bold">テーマ (NFR-18)</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className="card p-3 text-center"
                style={theme === t.key ? { borderColor: "var(--accent)", background: "var(--accent-soft)" } : undefined}
              >
                <span
                  className="mx-auto block h-8 w-8 rounded-full border"
                  style={{
                    background:
                      t.key === "stylish"
                        ? "linear-gradient(135deg,#0d0d14 50%,#ff2d5b 50%)"
                        : t.key === "minimal"
                          ? "linear-gradient(135deg,#f6f6f3 50%,#1a1a1a 50%)"
                          : "linear-gradient(135deg,#ffb3d9,#c9b3ff,#b3d4ff)",
                  }}
                />
                <span className="mt-1.5 block text-[11px] font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold">データ管理 (FR-27)</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            推し{counts?.oshis ?? 0}人・記録{counts?.records ?? 0}件・予定{counts?.events ?? 0}件がこの端末に保存されています
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={exportJson} className="card flex-1 py-3 text-sm font-bold">
              📤 エクスポート
            </button>
            <label className="card flex-1 cursor-pointer py-3 text-center text-sm font-bold">
              📥 インポート
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold">ヘルプ</h2>
          <a href="/welcome" className="card mt-2 block w-full py-3 text-center text-sm font-bold">
            📖 チュートリアルをもう一度見る
          </a>
          <button
            onClick={async () => {
              if (!confirm("すべての推し・記録・予定を削除して、初回起動の状態に戻します。よろしいですか?")) return;
              if (!confirm("本当に削除しますか?この操作は元に戻せません(必要なら先にエクスポートしてください)")) return;
              await db.transaction("rw", db.oshis, db.records, db.events, db.settings, async () => {
                await db.oshis.clear();
                await db.records.clear();
                await db.events.clear();
                await db.settings.clear();
              });
              localStorage.clear();
              location.href = "/";
            }}
            className="card mt-2 block w-full py-3 text-center text-sm font-bold"
            style={{ color: "var(--muted)" }}
          >
            🗑️ すべてリセットして初回状態に戻す
          </button>
        </section>

        <p className="pt-4 text-center text-[11px]" style={{ color: "var(--muted)" }}>
          オシイレ 〜推し入れ〜 MVP (フェーズ1)
          <br />
          データはすべてこの端末の中に保存されています
        </p>
      </div>
    </main>
  );
}
