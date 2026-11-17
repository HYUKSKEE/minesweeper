import { isDifficultyId } from "./minesweeper/difficulty";
import type { DifficultyId } from "./minesweeper/types";

const BEST_KEY = "minesweeper:best-times";
const DIFFICULTY_KEY = "minesweeper:difficulty";

export type BestTimes = Partial<Record<DifficultyId, number>>;

/** Browser-only helpers. Call from effects / event handlers, never during render. */
export function readBestTimes(): BestTimes {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const result: BestTimes = {};
    if (parsed && typeof parsed === "object") {
      for (const [k, v] of Object.entries(parsed)) {
        if (isDifficultyId(k) && typeof v === "number" && Number.isFinite(v)) result[k] = v;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function writeBestTimes(times: BestTimes): void {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(times));
  } catch {
    /* storage unavailable (private mode, quota) – ignore */
  }
}

export function readDifficulty(): DifficultyId | null {
  try {
    const v = window.localStorage.getItem(DIFFICULTY_KEY);
    return isDifficultyId(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeDifficulty(id: DifficultyId): void {
  try {
    window.localStorage.setItem(DIFFICULTY_KEY, id);
  } catch {
    /* ignore */
  }
}
