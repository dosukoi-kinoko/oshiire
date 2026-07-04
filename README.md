# オシイレ 〜推し入れ〜

推し活に特化した「推しの情報をひとつにまとめる」PWAアプリ。
SNSリンク・ニュース・カレンダー・記録・グッズ管理を1つで完結。

## ドキュメント

| ドキュメント | 場所 |
|---|---|
| 要件定義書（最新・正） | [docs/requirements.md](docs/requirements.md) |
| 企画書 v1.01（原本） | [docs/企画書_v1.01.docx](docs/企画書_v1.01.docx) |
| アイデアバックログ（未採用の機能案） | [docs/ideas-backlog.md](docs/ideas-backlog.md) |

企画書と要件定義書で記述が異なる場合は**要件定義書を正**とします
（企画書レビューで発見された技術・コスト・法務上の問題18件の修正を反映済み。詳細は要件定義書 §2）。

## 技術スタック（確定）

- **フロントエンド**: Next.js (App Router) + TypeScript + Tailwind CSS
- **ホスティング**: Cloudflare Pages（無料・商用可）
- **BaaS**: Supabase（DB / 認証 / RLS）
- **ストレージ**: 端末内 (IndexedDB) + Cloudflare R2（プレミアムのみ）
- **決済**: Stripe

## セットアップ

実装フェーズ開始時に追記予定。環境変数は `.env.example` を参照（実キーはコミットしない）。
