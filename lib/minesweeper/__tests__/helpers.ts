import { createBoard, withMines } from "../board";
import { createInitialState } from "../reducer";
import type { Difficulty, GameState } from "../types";

/** Builds a playing state from a layout where `*` is a mine and `.` is empty. */
export function stateFromLayout(layout: string[]): GameState {
  const rows = layout.length;
  const cols = layout[0].length;
  const mineIndices: number[] = [];
  layout.forEach((line, r) =>
    [...line].forEach((ch, c) => {
      if (ch === "*") mineIndices.push(r * cols + c);
    }),
  );
  const difficulty: Difficulty = {
    id: "beginner",
    label: "test",
    rows,
    cols,
    mines: mineIndices.length,
  };
  const base = createInitialState(difficulty);
  return {
    ...base,
    status: "playing",
    board: withMines(createBoard(rows, cols), rows, cols, mineIndices),
  };
}
