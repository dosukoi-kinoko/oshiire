import type { Genre } from "./db";

// ジャンル別プリセット (FR-10): 登録時の入力補助と機能の最適化
export const GENRES: Record<
  Genre,
  {
    label: string;
    emoji: string;
    recordLabel: string; // 記録のジャンル別テンプレート名 (FR-17)
    starLabel: string;
    defaultColor: string;
    ticket: boolean; // チケット文化の有無 (FR-16b)
  }
> = {
  sumo: {
    label: "大相撲",
    emoji: "🏔️",
    recordLabel: "観戦記録",
    starLabel: "白星",
    defaultColor: "#8b5a2b",
    ticket: true,
  },
  idol: {
    label: "アイドル",
    emoji: "🎤",
    recordLabel: "参戦記録",
    starLabel: "神対応",
    defaultColor: "#ff6fb0",
    ticket: true,
  },
  sports: {
    label: "スポーツ",
    emoji: "⚽",
    recordLabel: "観戦記録",
    starLabel: "勝利",
    defaultColor: "#2f9e6e",
    ticket: true,
  },
  actor: {
    label: "俳優・声優",
    emoji: "🎭",
    recordLabel: "観劇記録",
    starLabel: "感動",
    defaultColor: "#7a5cff",
    ticket: true,
  },
  music: {
    label: "音楽",
    emoji: "🎸",
    recordLabel: "ライブ記録",
    starLabel: "最高",
    defaultColor: "#ff8c42",
    ticket: true,
  },
  other: {
    label: "その他",
    emoji: "✨",
    recordLabel: "推し活記録",
    starLabel: "よき",
    defaultColor: "#4aa8ff",
    ticket: false,
  },
};

export const GENRE_KEYS = Object.keys(GENRES) as Genre[];
