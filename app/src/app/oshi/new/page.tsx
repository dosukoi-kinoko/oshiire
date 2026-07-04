"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, hasIDB, uid, type OshiKind } from "@/lib/db";
import { GENRES, GENRE_KEYS, getGenre } from "@/lib/genres";
import { PageHeader } from "@/components/PageHeader";

export default function NewOshiPage() {
  return (
    <Suspense>
      <NewOshiForm />
    </Suspense>
  );
}

// 推し登録 (FR-10/FR-10a): 箱推し(部屋・グループ)と個人の2種類
function NewOshiForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fromBoxId = params.get("box"); // 箱ページの「メンバーを追加」から来た場合

  const fromBox = useLiveQuery(
    () => (fromBoxId && hasIDB() ? db.oshis.get(fromBoxId) : undefined),
    [fromBoxId],
  );
  const boxes = useLiveQuery(
    () => (hasIDB() ? db.oshis.where("kind").equals("box").toArray() : []),
    [],
  );

  const [kind, setKind] = useState<OshiKind | null>(fromBoxId ? "solo" : null);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customGenre, setCustomGenre] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(
    fromBoxId ?? undefined,
  );

  const effGenre = fromBox
    ? fromBox.genre
    : customMode
      ? customGenre.trim() || null
      : genre;

  const save = async () => {
    if (!name.trim() || !effGenre || !kind) return;
    const id = uid();
    await db.oshis.add({
      id,
      name: name.trim(),
      kind,
      parentId: kind === "solo" ? parentId : undefined,
      genre: effGenre,
      color:
        (parentId && boxes?.find((b) => b.id === parentId)?.color) ||
        getGenre(effGenre).defaultColor,
      status: "active",
      sns: {},
      createdAt: Date.now(),
      lastViewedAt: Date.now(),
    });
    router.replace(`/oshi/${id}`);
  };

  // ステップ1: 箱推し or 個人 (箱ページ経由ならスキップ)
  if (!kind) {
    return (
      <main>
        <PageHeader title="推しを登録" sub="まずは推し方を選んでね" />
        <div className="space-y-3 p-4">
          <button
            onClick={() => setKind("box")}
            className="card block w-full p-5 text-left"
          >
            <span className="text-3xl">🎁</span>
            <p className="mt-2 font-bold">箱ごと推す</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              部屋・グループ・チームをまるごと登録。
              あとから中に力士・メンバーの個人ページを追加できます
              <br />
              例: アイドルグループ・相撲部屋・劇団・チーム
            </p>
          </button>
          <button
            onClick={() => setKind("solo")}
            className="card block w-full p-5 text-left"
          >
            <span className="text-3xl">👤</span>
            <p className="mt-2 font-bold">個人を推す</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              力士・メンバー・選手など、ひとりを登録。
              所属する箱(部屋・グループ)にあとから入れることもできます
            </p>
          </button>
        </div>
      </main>
    );
  }

  const g = effGenre ? getGenre(effGenre) : null;

  return (
    <main>
      <PageHeader
        title={
          fromBox
            ? `${getGenre(fromBox.genre).memberLabel}を追加`
            : kind === "box"
              ? "箱を登録"
              : "個人を登録"
        }
        sub={fromBox ? `🎁 ${fromBox.name}` : "2つ入力するだけ✨"}
      />
      <div className="space-y-6 p-4">
        <label className="block">
          <span className="text-sm font-bold">
            {kind === "box" ? "箱の名前(部屋・グループ名)" : "推しの名前"}
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "box" ? "推しのグループ・部屋・チーム名" : "推しの名前"}
            className="card mt-2 w-full px-4 py-3 outline-none"
          />
        </label>

        {!fromBox && (
          <div>
            <span className="text-sm font-bold">ジャンル</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {GENRE_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setGenre(key);
                    setCustomMode(false);
                  }}
                  className="card flex flex-col items-center gap-1 p-3"
                  style={
                    !customMode && genre === key
                      ? { borderColor: "var(--accent)", background: "var(--accent-soft)" }
                      : undefined
                  }
                >
                  <span className="text-2xl">{GENRES[key].emoji}</span>
                  <span className="text-xs font-bold">{GENRES[key].label}</span>
                </button>
              ))}
              {/* 自由入力ジャンル (FR-10) */}
              <button
                onClick={() => setCustomMode(true)}
                className="card flex flex-col items-center gap-1 p-3"
                style={
                  customMode
                    ? { borderColor: "var(--accent)", background: "var(--accent-soft)" }
                    : undefined
                }
              >
                <span className="text-2xl">✏️</span>
                <span className="text-xs font-bold">自分で入力</span>
              </button>
            </div>
            {customMode && (
              <input
                autoFocus
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="例: VTuber、鉄道、宝塚..."
                className="card mt-2 w-full px-4 py-3 outline-none"
              />
            )}
          </div>
        )}

        {/* 個人の場合: 所属する箱を選べる (FR-10a) */}
        {kind === "solo" && !fromBox && (boxes?.length ?? 0) > 0 && (
          <div>
            <span className="text-sm font-bold">所属する箱(任意)</span>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setParentId(undefined)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm ${!parentId ? "chip" : "card"}`}
              >
                なし
              </button>
              {boxes?.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setParentId(b.id);
                    setGenre(b.genre);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm ${parentId === b.id ? "chip" : "card"}`}
                >
                  🎁 {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={save}
          disabled={!name.trim() || !effGenre}
          className="btn-accent w-full py-3.5 disabled:opacity-40"
        >
          {kind === "box"
            ? `この${g?.boxLabel ?? "箱"}をオシイレに入れる 🎁`
            : "この推しをオシイレに入れる 🗄️"}
        </button>
        {!fromBox && (
          <button
            onClick={() => setKind(null)}
            className="w-full text-center text-sm"
            style={{ color: "var(--muted)" }}
          >
            ← 推し方の選択に戻る
          </button>
        )}
      </div>
    </main>
  );
}
