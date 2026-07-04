import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { PwaSetup } from "@/components/PwaSetup";
import { themeInitScript } from "@/lib/prefs";

export const metadata: Metadata = {
  title: "オシイレ 〜推し入れ〜",
  description: "推し活のすべてをひとつに。SNS・記録・カレンダー・グッズ管理まで、あなただけの推し活ページ。",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0d0d14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-theme="stylish">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <div className="mx-auto max-w-md min-h-dvh pb-24">{children}</div>
        <BottomNav />
        <PwaSetup />
      </body>
    </html>
  );
}
