"use client";

import { useCallback, useEffect, useState } from "react";
import { readBestTimes, writeBestTimes, type BestTimes } from "@/lib/storage";
import type { DifficultyId } from "@/lib/minesweeper/types";

/** Best (shortest) time per difficulty, persisted in localStorage. */
export function useBestTimes() {
  // Start empty so server and first client render match; load after mount.
  const [best, setBest] = useState<BestTimes>({});

  useEffect(() => {
    // localStorage may only be read after mount to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(readBestTimes());
  }, []);

  const record = useCallback((id: DifficultyId, seconds: number) => {
    const current = readBestTimes();
    const prev = current[id];
    if (prev !== undefined && prev <= seconds) return;
    const next = { ...current, [id]: seconds };
    writeBestTimes(next);
    setBest(next);
  }, []);

  return { best, record };
}
