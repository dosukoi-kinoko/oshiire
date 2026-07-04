import type { Genre } from "./db";

// ジャンル別プリセット (FR-10): 表示順はメジャー順(定義順がそのまま並び順になる)
// boxLabel/memberLabel: 箱推し階層の呼び名 (FR-10a)
export const GENRES: Record<
  Genre,
  {
    label: string;
    emoji: string;
    recordLabel: string; // 記録のジャンル別テンプレート名 (FR-17)
    starLabel: string;
    defaultColor: string;
    ticket: boolean; // チケット文化の有無 (FR-16b)
    boxLabel: string; // 箱の呼び名
    memberLabel: string; // 箱の中の個人の呼び名
  }
> = {
  idol: {
    label: "アイドル",
    emoji: "🎤",
    recordLabel: "参戦記録",
    starLabel: "神対応",
    defaultColor: "#ff6fb0",
    ticket: true,
    boxLabel: "グループ",
    memberLabel: "メンバー",
  },
  music: {
    label: "音楽",
    emoji: "🎸",
    recordLabel: "ライブ記録",
    starLabel: "最高",
    defaultColor: "#ff8c42",
    ticket: true,
    boxLabel: "バンド・グループ",
    memberLabel: "メンバー",
  },
  actor: {
    label: "俳優・声優",
    emoji: "🎭",
    recordLabel: "観劇記録",
    starLabel: "感動",
    defaultColor: "#7a5cff",
    ticket: true,
    boxLabel: "劇団・ユニット",
    memberLabel: "メンバー",
  },
  sports: {
    label: "スポーツ",
    emoji: "⚽",
    recordLabel: "観戦記録",
    starLabel: "勝利",
    defaultColor: "#2f9e6e",
    ticket: true,
    boxLabel: "チーム",
    memberLabel: "選手",
  },
  sumo: {
    label: "大相撲",
    emoji: "🏔️",
    recordLabel: "観戦記録",
    starLabel: "白星",
    defaultColor: "#1f6f50",
    ticket: true,
    boxLabel: "部屋",
    memberLabel: "力士",
  },
  other: {
    label: "その他",
    emoji: "✨",
    recordLabel: "推し活記録",
    starLabel: "よき",
    defaultColor: "#4aa8ff",
    ticket: false,
    boxLabel: "グループ",
    memberLabel: "メンバー",
  },
};

export const GENRE_KEYS = Object.keys(GENRES) as Genre[];

// 推しページのテーマ色スウォッチ (FR-12a): サンプルHTML準拠の6色
export const SWATCHES = [
  "#2b4a8b", // 紺
  "#a02040", // 臙脂
  "#1f6f50", // 緑
  "#6b4fa0", // 紫
  "#22222a", // 黒
  "#c9a227", // 金
];
