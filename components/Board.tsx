"use client";

import { useCallback, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import type { GameState } from "@/lib/minesweeper/types";
import { Cell } from "./Cell";

interface Props {
  state: GameState;
  onReveal: (index: number) => void;
  onChord: (index: number) => void;
  onFlag: (index: number) => void;
}

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

export function Board({ state, onReveal, onChord, onFlag }: Props) {
  const { rows, cols } = state.difficulty;
  const ref = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const tabIndex = focusIndex < rows * cols ? focusIndex : 0;

  const indexOf = (target: EventTarget) => {
    const el = (target as HTMLElement).closest<HTMLElement>("[data-index]");
    return el ? Number(el.dataset.index) : null;
  };

  const handleFocus = useCallback((e: FocusEvent) => {
    const i = indexOf(e.target);
    if (i !== null) setFocusIndex(i);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    const i = indexOf(e.target);
    if (i === null) return;

    const arrow = ARROWS[e.key];
    if (arrow) {
      e.preventDefault();
      const r = Math.min(rows - 1, Math.max(0, Math.floor(i / cols) + arrow[0]));
      const c = Math.min(cols - 1, Math.max(0, (i % cols) + arrow[1]));
      const next = r * cols + c;
      setFocusIndex(next);
      ref.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.focus();
    } else if (e.key.toLowerCase() === "f" || e.code === "KeyF") {
      e.preventDefault();
      if (state.status !== "won" && state.status !== "lost") onFlag(i);
    }
  };

  return (
    <div className="max-w-full overflow-x-auto rounded-2xl border border-line bg-surface p-3 shadow-sm">
      <div
        ref={ref}
        role="group"
        aria-label="지뢰찾기 보드"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => e.preventDefault()}
        style={
          {
            "--cols": cols,
            "--cell": "clamp(1.625rem, calc((min(100vw, 64rem) - 8rem) / var(--cols)), 2.5rem)",
            gridTemplateColumns: "repeat(var(--cols), var(--cell))",
            fontSize: "calc(var(--cell) * 0.56)",
          } as React.CSSProperties
        }
        className="mx-auto grid w-max select-none gap-[2px]"
      >
        {state.board.map((cell, i) => (
          <Cell
            key={i}
            cell={cell}
            index={i}
            cols={cols}
            status={state.status}
            exploded={state.explodedIndex === i}
            tabbable={i === tabIndex}
            onReveal={onReveal}
            onChord={onChord}
            onFlag={onFlag}
          />
        ))}
      </div>
    </div>
  );
}
