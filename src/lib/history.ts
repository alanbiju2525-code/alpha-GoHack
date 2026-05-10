import type { ScanResult } from "./analysis";

export type ScanKind = "link" | "website" | "qr" | "file" | "message";

export interface HistoryEntry {
  id: string;
  kind: ScanKind;
  target: string;
  trustScore: number;
  severity: ScanResult["severity"];
  at: number;
}

const KEY = "alpha-ai-history-v1";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "at">) {
  if (typeof window === "undefined") return;
  const list = getHistory();
  list.unshift({ ...entry, id: crypto.randomUUID(), at: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  window.dispatchEvent(new Event("alpha-history"));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("alpha-history"));
}
