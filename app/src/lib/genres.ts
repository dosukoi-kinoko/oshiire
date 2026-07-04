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
    emoji: "🎬",
    recordLabel: "観賞記録",
    starLabel: "感動",
    defaultColor: "#7a5cff",
    ticket: true,
    boxLabel: "事務所・ユニット",
    memberLabel: "メンバー",
  },
  stage: {
    label: "舞台",
    emoji: "🎭",
    recordLabel: "観劇記録",
    starLabel: "スタオベ",
    defaultColor: "#b0486e",
    ticket: true,
    boxLabel: "劇団・カンパニー",
    memberLabel: "キャスト",
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

export type GenreInfo = (typeof GENRES)[Genre];

// 自由入力ジャンル対応 (FR-10): プリセットになければ汎用プリセットを返す
export function getGenre(g: string): GenreInfo {
  return (
    (GENRES as Record<string, GenreInfo>)[g] ?? {
      label: g,
      emoji: "💖",
      recordLabel: "推し活記録",
      starLabel: "よき",
      defaultColor: "#e585b0",
      ticket: true,
      boxLabel: "グループ",
      memberLabel: "メンバー",
    }
  );
}

// 推しページのテーマ色スウォッチ (FR-12a): アプリテーマと調和する配色に切替(穴26の思想)
export const SWATCHES_BY_THEME: Record<string, string[]> = {
  // ファッション誌風: 深く鮮やかな色(サンプルHTML準拠)
  stylish: ["#2b4a8b", "#a02040", "#1f6f50", "#6b4fa0", "#22222a", "#c9a227"],
  // クール大人: 彩度を抑えた上品トーン
  minimal: ["#3f4a5a", "#8a4b55", "#4a6b5d", "#6a5a7a", "#2a2a2a", "#a08a4f"],
  // 夢かわいい: パステルと調和する淡色
  pastel: ["#e79fc4", "#b9a7e6", "#8fd0bd", "#94bfe9", "#f2c48d", "#f0a8a0"],
};

export function getSwatches(theme: string): string[] {
  return SWATCHES_BY_THEME[theme] ?? SWATCHES_BY_THEME.stylish;
}

// 祭壇の雛形3種 (FR-26a・オーナー指定): 和風/聖堂/祝祭
export const ALTAR_STYLES = [
  { key: "wa", label: "和", emoji: "⛩️", desc: "厳かな日本風" },
  { key: "chapel", label: "聖堂", emoji: "🕊️", desc: "ステンドグラス風" },
  { key: "fiesta", label: "祝祭", emoji: "🌼", desc: "キラキラギラギラ" },
] as const;

// 祭壇デコパーツ (FR-26a/NFR-19d): 5系統に拡充
export const ALTAR_PARTS: { group: string; emojis: string[] }[] = [
  { group: "キラキラ", emojis: ["✨", "⭐", "🌟", "💫", "🌠", "💎", "🔮", "🪩", "🎇", "🫧"] },
  { group: "おごそか", emojis: ["🕯️", "⛩️", "🏮", "🌕", "🪷", "🍶", "🌿", "🎋", "🍵", "📿", "🪭"] },
  { group: "ラブリー", emojis: ["🎀", "💐", "🌸", "💝", "🩷", "🌷", "🦢", "🍡", "🧸", "🍓", "🌈"] },
  { group: "聖堂", emojis: ["🕊️", "🔔", "🌹", "👼", "🎼", "🥀", "🤍", "⚜️"] },
  { group: "祝祭", emojis: ["🌼", "🌺", "🪅", "🎊", "🪔", "🦚", "☀️", "💃", "🍋", "🥁"] },
];
