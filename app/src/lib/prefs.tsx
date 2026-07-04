"use client";

import { useEffect, useState } from "react";

export type Theme = "stylish" | "minimal" | "pastel";
export type HomeLayout = "collage" | "grid" | "stream";

export const THEMES: { key: Theme; label: string }[] = [
  { key: "stylish", label: "スタイリッシュ" },
  { key: "minimal", label: "ミニマル" },
  { key: "pastel", label: "パステル" },
];

export const LAYOUTS: { key: HomeLayout; label: string; emoji: string }[] = [
  { key: "collage", label: "コラージュ", emoji: "🃏" },
  { key: "grid", label: "グリッド", emoji: "🔲" },
  { key: "stream", label: "ストリーム", emoji: "🌊" },
];

function read(key: string, fallback: string) {
  if (typeof localStorage === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

// localStorage連動の設定フック(テーマ・レイアウト・ニックネーム)
export function usePref(key: string, fallback: string) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
  }, [key, fallback]);
  const update = (v: string) => {
    setValue(v);
    localStorage.setItem(key, v);
    if (key === "theme") document.documentElement.dataset.theme = v;
  };
  return [value, update] as const;
}

// 初回描画前にテーマを適用してチラつきを防ぐ(layout.tsxのインラインscriptで使用)
export const themeInitScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
