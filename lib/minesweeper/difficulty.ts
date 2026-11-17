import type { Difficulty, DifficultyId } from "./types";

export const DIFFICULTIES: Record<DifficultyId, Difficulty> = {
  beginner: { id: "beginner", label: "초급", rows: 9, cols: 9, mines: 10 },
  intermediate: { id: "intermediate", label: "중급", rows: 16, cols: 16, mines: 40 },
  expert: { id: "expert", label: "고급", rows: 16, cols: 30, mines: 99 },
};

export const DIFFICULTY_LIST: readonly Difficulty[] = [
  DIFFICULTIES.beginner,
  DIFFICULTIES.intermediate,
  DIFFICULTIES.expert,
];

export const DEFAULT_DIFFICULTY: DifficultyId = "beginner";

export function isDifficultyId(value: unknown): value is DifficultyId {
  return typeof value === "string" && value in DIFFICULTIES;
}
