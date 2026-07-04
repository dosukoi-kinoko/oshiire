import Dexie, { type EntityTable } from "dexie";

// ローカルファースト設計 (FR-01): 未ログインでも全機能が使える。
// クラウド同期(Supabase)導入時は各テーブルに syncedAt を足して差分同期する。

export type Genre =
  | "sumo"
  | "idol"
  | "sports"
  | "actor"
  | "music"
  | "other";

export type OshiStatus = "active" | "graduated" | "dormant";
export type OshiKind = "box" | "solo"; // 箱推し階層 (FR-10a)

// 祭壇デコ (FR-26a v1): 絵文字パーツの配置(x,yは%)
export interface AltarPart {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface Oshi {
  id: string;
  name: string;
  kind: OshiKind; // 箱(部屋・グループ) or 個人
  parentId?: string; // 個人が所属する箱のid (FR-10a)
  genre: Genre | (string & {}); // プリセット or 自由入力ジャンル (FR-10)
  altar?: { parts: AltarPart[] }; // 常設祭壇 (FR-26a)
  color: string; // 推しカラー (FR-12)
  subtitle?: string; // 英字サブタイトル "ISEGAHAMA BEYA" (FR-12a)
  profile?: { label: string; value: string }[]; // 情報テーブル (FR-12a)
  status: OshiStatus;
  oshiStartDate?: string; // 推し始めた日 (FR-16a)
  birthday?: string; // MM-DD
  memo?: string;
  sns: { x?: string; instagram?: string; youtube?: string; tiktok?: string };
  createdAt: number;
  lastViewedAt: number; // 「最近見た推し」用
}

export interface OshiRecord {
  id: string;
  oshiId: string;
  date: string; // YYYY-MM-DD
  title: string;
  body: string;
  star: boolean; // ⭐ 結果・白星 (FR-17)
  heart: boolean; // ♥ お気に入り
  createdAt: number;
}

export type TicketStatus = "none" | "applied" | "won" | "lost";

export interface OshiEvent {
  id: string;
  oshiId: string;
  date: string; // YYYY-MM-DD
  title: string;
  ticket: TicketStatus; // 当落記録 (FR-16b)
  createdAt: number;
}

export interface Setting {
  key: string;
  value: string;
}

export const db = new Dexie("oshiire") as Dexie & {
  oshis: EntityTable<Oshi, "id">;
  records: EntityTable<OshiRecord, "id">;
  events: EntityTable<OshiEvent, "id">;
  settings: EntityTable<Setting, "key">;
};

db.version(1).stores({
  oshis: "id, name, genre, status, lastViewedAt",
  records: "id, oshiId, date, createdAt",
  events: "id, oshiId, date",
  settings: "key",
});

// v2: 箱推し階層 (FR-10a)。既存データは「個人」として引き継ぐ
db.version(2)
  .stores({
    oshis: "id, name, genre, status, lastViewedAt, kind, parentId",
    records: "id, oshiId, date, createdAt",
    events: "id, oshiId, date",
    settings: "key",
  })
  .upgrade((tx) =>
    tx
      .table("oshis")
      .toCollection()
      .modify((o) => {
        if (!o.kind) o.kind = "solo";
      }),
  );

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const hasIDB = () => typeof indexedDB !== "undefined";
