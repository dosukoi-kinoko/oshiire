"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "ホーム", emoji: "🏠" },
  { href: "/calendar", label: "カレンダー", emoji: "📅" },
  { href: "/oshi", label: "推し", emoji: "🗄️", center: true },
  { href: "/records", label: "記録", emoji: "📝" },
  { href: "/settings", label: "設定", emoji: "⚙️" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t px-2 pb-[env(safe-area-inset-bottom)]"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <ul className="flex items-end justify-around">
        {TABS.map((t) => {
          const active =
            t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                  t.center ? "-mt-4" : ""
                }`}
                style={{ color: active ? "var(--accent)" : "var(--muted)" }}
              >
                <span
                  className={
                    t.center
                      ? "flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-lg"
                      : "text-xl"
                  }
                  style={
                    t.center
                      ? { background: "var(--accent-soft)", border: "2px solid var(--accent)" }
                      : undefined
                  }
                >
                  {t.emoji}
                </span>
                <span className={active ? "font-bold" : ""}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
