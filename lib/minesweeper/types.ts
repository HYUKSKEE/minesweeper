export type CellState = "hidden" | "open" | "flagged";

export interface Cell {
  readonly mine: boolean;
  /** Number of mines in the 8 surrounding cells. */
  readonly adjacent: number;
  readonly state: CellState;
}

/** Flat, row-major list of cells (index = row * cols + col). */
export type Board = readonly Cell[];

export type DifficultyId = "beginner" | "intermediate" | "expert";

export interface Difficulty {
  readonly id: DifficultyId;
  readonly label: string;
  readonly rows: number;
  readonly cols: number;
  readonly mines: number;
}

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface GameState {
  readonly difficulty: Difficulty;
  readonly board: Board;
  readonly status: GameStatus;
  readonly flags: number;
  readonly elapsed: number;
  /** Count of opened non-mine cells, used for the win check. */
  readonly openedSafe: number;
  /** Index of the mine the player stepped on (lost games only). */
  readonly explodedIndex: number | null;
}

export type Action =
  /** `seed` feeds the mine-placement RNG; it is generated in the event handler. */
  | { type: "REVEAL"; index: number; seed: number }
  | { type: "TOGGLE_FLAG"; index: number }
  | { type: "CHORD"; index: number }
  | { type: "NEW_GAME"; difficulty?: Difficulty }
  | { type: "TICK" };
