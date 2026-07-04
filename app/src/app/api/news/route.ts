import { NextRequest, NextResponse } from "next/server";

// ニュースフィード (FR-18 / 穴15): Google News RSSをサーバー側で取得してCORSを回避。
// 30分キャッシュ。失敗時は副系統(Bing News RSS)へフォールバック。

const CACHE_SECONDS = 1800;

function parseRss(xml: string) {
  const items: { title: string; link: string; pubDate: string; source: string }[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const b of blocks.slice(0, 10)) {
    const pick = (tag: string) => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return (m?.[1] ?? "")
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    };
    const pubDate = pick("pubDate");
    items.push({
      title: pick("title"),
      link: pick("link"),
      pubDate: pubDate ? new Date(pubDate).toLocaleDateString("ja-JP") : "",
      source: pick("source") || "Google News",
    });
  }
  return items;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ items: [] });

  const sources = [
    `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ja&gl=JP&ceid=JP:ja`,
    `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        next: { revalidate: CACHE_SECONDS },
        headers: { "user-agent": "Mozilla/5.0 (oshiire-app)" },
      });
      if (!res.ok) continue;
      const items = parseRss(await res.text());
      if (items.length > 0) {
        return NextResponse.json(
          { items },
          { headers: { "cache-control": `public, s-maxage=${CACHE_SECONDS}` } },
        );
      }
    } catch {
      // 次のソースへフォールバック
    }
  }
  return NextResponse.json({ items: [] });
}
