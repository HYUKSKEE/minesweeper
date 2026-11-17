"use client";

import { useEffect, type Dispatch } from "react";
import type { Action, GameStatus } from "@/lib/minesweeper/types";

/** Dispatches TICK once per second while the game is in progress. */
export function useTimer(status: GameStatus, dispatch: Dispatch<Action>) {
  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(id);
  }, [status, dispatch]);
}
