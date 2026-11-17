import type { Board, Cell } from "./types";

export type Rng = () => number;

/** Small deterministic PRNG so the reducer stays pure. Returns floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createBoard(rows: number, cols: number): Cell[] {
  return Array.from({ length: rows * cols }, () => ({
    mine: false,
    adjacent: 0,
    state: "hidden" as const,
  }));
}

/** Indices of the (up to 8) cells surrounding `index`. */
export function getNeighbors(index: number, rows: number, cols: number): number[] {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
    }
  }
  return result;
}

/** Returns a new board with mines at `mineIndices` and adjacency counts recomputed. */
export function withMines(
  board: Board,
  rows: number,
  cols: number,
  mineIndices: Iterable<number>,
): Cell[] {
  const mines = new Set(mineIndices);
  return board.map((cell, i) => {
    const isMine = mines.has(i);
    let adjacent = 0;
    if (!isMine) {
      for (const n of getNeighbors(i, rows, cols)) if (mines.has(n)) adjacent++;
    }
    return { ...cell, mine: isMine, adjacent };
  });
}

/**
 * Places `mineCount` mines, never on `safeIndex` or its 8 neighbors
 * (falls back to excluding only `safeIndex` if the board is too small).
 * The RNG is injected so the placement is testable.
 */
export function placeMines(
  board: Board,
  rows: number,
  cols: number,
  mineCount: number,
  safeIndex: number,
  rng: Rng,
): Cell[] {
  const total = rows * cols;
  if (mineCount > total - 1) throw new Error("Too many mines for this board");

  const excluded = new Set([safeIndex, ...getNeighbors(safeIndex, rows, cols)]);
  let candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!excluded.has(i)) candidates.push(i);
  if (candidates.length < mineCount) {
    candidates = [];
    for (let i = 0; i < total; i++) if (i !== safeIndex) candidates.push(i);
  }

  // Partial Fisher–Yates: the first `mineCount` entries are the chosen mines.
  for (let i = 0; i < mineCount; i++) {
    const j = i + Math.floor(rng() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return withMines(board, rows, cols, candidates.slice(0, mineCount));
}
