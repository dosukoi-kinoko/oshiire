"use client";

import { useRouter } from "next/navigation";

// 独立ページ共通ヘッダー (FR-11a③): 単体で見て分かる「推し名+機能名」+戻る
export function PageHeader({
  title,
  sub,
  back = true,
  action,
}: {
  title: string;
  sub?: string;
  back?: boolean;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 flex items-center gap-2 px-4 py-3 backdrop-blur"
      style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)" }}>
      {back && (
        <button
          onClick={() => router.back()}
          aria-label="戻る"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        {sub && (
          <p className="truncate text-[11px]" style={{ color: "var(--muted)" }}>
            {sub}
          </p>
        )}
        <h1 className="truncate text-lg font-bold">{title}</h1>
      </div>
      {action}
    </header>
  );
}
