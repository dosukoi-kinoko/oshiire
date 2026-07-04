"use client";

import { useEffect, useState } from "react";

type NewsItem = { title: string; link: string; pubDate: string; source: string };

// ニュースフィード (FR-18): サーバー側RSS取得APIを呼び出して表示
export function NewsList({ query, limit = 5 }: { query: string; limit?: number }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/news?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setItems(d.items))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [query]);

  if (error)
    return (
      <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
        ニュースを取得できませんでした（オフライン中かもしれません）
      </p>
    );
  if (!items)
    return (
      <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
        読み込み中…
      </p>
    );
  if (items.length === 0)
    return (
      <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
        関連ニュースが見つかりませんでした
      </p>
    );

  return (
    <ul className="mt-2 space-y-2.5">
      {items.slice(0, limit).map((n, i) => (
        <li key={i}>
          <a
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <p className="line-clamp-2 text-sm leading-snug">{n.title}</p>
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--muted)" }}>
              {n.source} ・ {n.pubDate}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}
