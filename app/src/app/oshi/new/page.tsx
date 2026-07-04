"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { db, uid, type Genre } from "@/lib/db";
import { GENRES, GENRE_KEYS } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

// 推し登録 (FR-10 / NFR-14): 名前+ジャンルの2項目・3タップ以内で完了
export default function NewOshiPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [genre, setGenre] = useState<Genre | null>(null);

  const save = async () => {
    if (!name.trim() || !genre) return;
    const id = uid();
    await db.oshis.add({
      id,
      name: name.trim(),
      genre,
      color: GENRES[genre].defaultColor,
      status: "active",
      sns: {},
      createdAt: Date.now(),
      lastViewedAt: Date.now(),
    });
    router.replace(`/oshi/${id}`);
  };

  return (
    <main>
      <PageHeader title="推しを登録" sub="2つ入力するだけ✨" />
      <div className="space-y-6 p-4">
        <label className="block">
          <span className="text-sm font-bold">推しの名前</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 尊富士"
            className="card mt-2 w-full px-4 py-3 outline-none"
          />
        </label>
        <div>
          <span className="text-sm font-bold">ジャンル</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {GENRE_KEYS.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className="card flex flex-col items-center gap-1 p-3"
                style={
                  genre === g
                    ? { borderColor: "var(--accent)", background: "var(--accent-soft)" }
                    : undefined
                }
              >
                <span className="text-2xl">{GENRES[g].emoji}</span>
                <span className="text-xs font-bold">{GENRES[g].label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
            ジャンルに合わせて記録テンプレートなどが自動で最適化されます
          </p>
        </div>
        <button
          onClick={save}
          disabled={!name.trim() || !genre}
          className="btn-accent w-full py-3.5 disabled:opacity-40"
        >
          この推しをオシイレに入れる 🗄️
        </button>
      </div>
    </main>
  );
}
