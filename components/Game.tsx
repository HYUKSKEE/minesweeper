"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useBestTimes } from "@/hooks/useBestTimes";
import { useTimer } from "@/hooks/useTimer";
import { DIFFICULTIES } from "@/lib/minesweeper/difficulty";
import { createInitialState, reducer } from "@/lib/minesweeper/reducer";
import type { Difficulty } from "@/lib/minesweeper/types";
import { readDifficulty, writeDifficulty } from "@/lib/storage";
import { Board } from "./Board";
import { DifficultySelector } from "./DifficultySelector";
import { StatusBar } from "./StatusBar";

export function Game() {
  const [state, dispatch] = useReducer(reducer, DIFFICULTIES.beginner, createInitialState);
  const { best, record } = useBestTimes();
  const { status, elapsed, flags, difficulty } = state;

  useTimer(status, dispatch);

  // Restore the last chosen difficulty after mount (avoids hydration mismatch).
  useEffect(() => {
    const saved = readDifficulty();
    if (saved && saved !== DIFFICULTIES.beginner.id) {
      dispatch({ type: "NEW_GAME", difficulty: DIFFICULTIES[saved] });
    }
  }, []);

  useEffect(() => {
    if (status === "won") record(difficulty.id, elapsed);
  }, [status, difficulty.id, elapsed, record]);

  // Randomness is created here, in event handlers only – never during render.
  const onReveal = useCallback(
    (index: number) =>
      dispatch({ type: "REVEAL", index, seed: Math.floor(Math.random() * 2 ** 32) }),
    [],
  );
  const onChord = useCallback((index: number) => dispatch({ type: "CHORD", index }), []);
  const onFlag = useCallback((index: number) => dispatch({ type: "TOGGLE_FLAG", index }), []);
  const onNewGame = useCallback(() => dispatch({ type: "NEW_GAME" }), []);
  const onSelect = useCallback((d: Difficulty) => {
    writeDifficulty(d.id);
    dispatch({ type: "NEW_GAME", difficulty: d });
  }, []);

  return (
    <div className="flex w-full max-w-full flex-col items-center gap-4">
      <div className="w-full max-w-md">
        <DifficultySelector current={difficulty.id} best={best} onSelect={onSelect} />
      </div>
      <div className="w-full max-w-md">
        <StatusBar
          minesLeft={difficulty.mines - flags}
          elapsed={elapsed}
          status={status}
          onNewGame={onNewGame}
        />
      </div>
      <Board state={state} onReveal={onReveal} onChord={onChord} onFlag={onFlag} />
      <p className="max-w-md text-center text-xs text-muted">
        좌클릭 열기 · 우클릭 깃발 · 숫자 클릭 코드 열기 · 모바일은 길게 눌러 깃발 · 방향키 이동, F 깃발
      </p>
    </div>
  );
}
