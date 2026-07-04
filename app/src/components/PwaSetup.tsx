"use client";

import { useEffect } from "react";

// SW登録+ストレージ永続化要求 (NFR-13 / 穴19対策の第一歩)
export function PwaSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);
  return null;
}
