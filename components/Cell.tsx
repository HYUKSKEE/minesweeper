"use client";

import { memo } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import type { Cell as CellData, GameStatus } from "@/lib/minesweeper/types";
import { FlagIcon, MineIcon } from "./icons";

interface Props {
  cell: CellData;
  index: number;
  cols: number;
  status: GameStatus;
  exploded: boolean;
  tabbable: boolean;
  onReveal: (index: number) => void;
  onChord: (index: number) => void;
  onFlag: (index: number) => void;
}

// Full class names so Tailwind can see them.
const NUMBER_COLORS = [
  "",
  "text-n1",
  "text-n2",
  "text-n3",
  "text-n4",
  "text-n5",
  "text-n6",
  "text-n7",
  "text-n8",
];

function describe(cell: CellData, status: GameStatus, exploded: boolean): string {
  if (cell.state === "flagged") {
    return status === "lost" && !cell.mine ? "잘못 꽂은 깃발" : "깃발";
  }
  if (cell.state === "hidden") return "닫힌 칸";
  if (cell.mine) return exploded ? "터진 지뢰" : "지뢰";
  return cell.adjacent === 0 ? "빈 칸" : `주변 지뢰 ${cell.adjacent}개`;
}

export const Cell = memo(function Cell({
  cell,
  index,
  cols,
  status,
  exploded,
  tabbable,
  onReveal,
  onChord,
  onFlag,
}: Props) {
  const over = status === "won" || status === "lost";
  const press = useLongPress({
    onClick: () => {
      if (over) return;
      if (cell.state === "open") onChord(index);
      else onReveal(index);
    },
    onLongPress: () => onFlag(index),
    onContextMenu: () => onFlag(index),
  });

  const row = Math.floor(index / cols) + 1;
  const col = (index % cols) + 1;
  const wrongFlag = status === "lost" && cell.state === "flagged" && !cell.mine;

  let tone: string;
  if (cell.state === "open") {
    tone = exploded ? "bg-danger text-white" : "bg-tile-open";
  } else if (wrongFlag) {
    tone = "bg-tile text-danger ring-2 ring-inset ring-danger";
  } else {
    tone = over ? "bg-tile" : "bg-tile hover:bg-tile-hover active:bg-tile-open";
  }

  return (
    <button
      type="button"
      data-index={index}
      tabIndex={tabbable ? 0 : -1}
      aria-label={`${row}행 ${col}열, ${describe(cell, status, exploded)}`}
      aria-disabled={over || undefined}
      className={`flex size-(--cell) select-none items-center justify-center rounded-[22%] font-bold leading-none outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] touch-manipulation focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas ${tone}`}
      {...press}
    >
      {cell.state === "flagged" && <FlagIcon className="size-[58%] text-flag" />}
      {cell.state === "open" && cell.mine && <MineIcon className="size-[64%]" />}
      {cell.state === "open" && !cell.mine && cell.adjacent > 0 && (
        <span className={NUMBER_COLORS[cell.adjacent]}>{cell.adjacent}</span>
      )}
    </button>
  );
});
