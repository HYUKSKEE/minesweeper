import { getNeighbors, mulberry32, placeMines, createBoard } from "./board";
import { DIFFICULTIES } from "./difficulty";
import type { Action, Board, Cell, Difficulty, GameState } from "./types";

export const MAX_TIME = 999;

export function createInitialState(
  difficulty: Difficulty = DIFFICULTIES.beginner,
): GameState {
  return {
    difficulty,
    board: createBoard(difficulty.rows, difficulty.cols),
    status: "idle",
    flags: 0,
    elapsed: 0,
    openedSafe: 0,
    explodedIndex: null,
  };
}

/**
 * Opens `starts` (skipping flagged / already-open cells) and flood-fills
 * through zero cells with an explicit stack. Resolves win / loss.
 */
function openCells(state: GameState, board: Board, starts: number[]): GameState {
  const { rows, cols, mines } = state.difficulty;
  const next: Cell[] = [...board];
  const stack = [...starts];
  let opened = 0;
  let exploded: number | null = null;

  while (stack.length > 0) {
    const i = stack.pop()!;
    const cell = next[i];
    if (cell.state !== "hidden") continue;
    next[i] = { ...cell, state: "open" };
    if (cell.mine) {
      exploded = i;
      continue;
    }
    opened++;
    if (cell.adjacent === 0) {
      for (const n of getNeighbors(i, rows, cols)) {
        if (next[n].state === "hidden") stack.push(n);
      }
    }
  }

  if (exploded !== null) {
    // Reveal every unflagged mine; correctly flagged mines and wrong flags stay as-is.
    const revealed = next.map((c) =>
      c.mine && c.state === "hidden" ? { ...c, state: "open" as const } : c,
    );
    return {
      ...state,
      board: revealed,
      status: "lost",
      explodedIndex: exploded,
      openedSafe: state.openedSafe + opened,
    };
  }

  const openedSafe = state.openedSafe + opened;
  if (openedSafe === rows * cols - mines) {
    const won = next.map((c) =>
      c.mine && c.state === "hidden" ? { ...c, state: "flagged" as const } : c,
    );
    return { ...state, board: won, status: "won", flags: mines, openedSafe };
  }

  return { ...state, board: next, status: "playing", openedSafe };
}

const isOver = (s: GameState) => s.status === "won" || s.status === "lost";

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "REVEAL": {
      if (isOver(state)) return state;
      const cell = state.board[action.index];
      if (!cell || cell.state !== "hidden") return state;
      let board = state.board;
      if (state.status === "idle") {
        const { rows, cols, mines } = state.difficulty;
        board = placeMines(board, rows, cols, mines, action.index, mulberry32(action.seed));
      }
      return openCells(state, board, [action.index]);
    }

    case "TOGGLE_FLAG": {
      if (isOver(state)) return state;
      const cell = state.board[action.index];
      if (!cell || cell.state === "open") return state;
      const flagged = cell.state === "hidden";
      const board = [...state.board];
      board[action.index] = { ...cell, state: flagged ? "flagged" : "hidden" };
      return { ...state, board, flags: state.flags + (flagged ? 1 : -1) };
    }

    case "CHORD": {
      if (state.status !== "playing") return state;
      const cell = state.board[action.index];
      if (!cell || cell.state !== "open" || cell.adjacent === 0) return state;
      const { rows, cols } = state.difficulty;
      const neighbors = getNeighbors(action.index, rows, cols);
      const flagCount = neighbors.filter((n) => state.board[n].state === "flagged").length;
      if (flagCount !== cell.adjacent) return state;
      const targets = neighbors.filter((n) => state.board[n].state === "hidden");
      if (targets.length === 0) return state;
      return openCells(state, state.board, targets);
    }

    case "NEW_GAME":
      return createInitialState(action.difficulty ?? state.difficulty);

    case "TICK":
      if (state.status !== "playing" || state.elapsed >= MAX_TIME) return state;
      return { ...state, elapsed: state.elapsed + 1 };
  }
}
