import { DIFFICULTY_LIST } from "@/lib/minesweeper/difficulty";
import type { BestTimes } from "@/lib/storage";
import type { Difficulty, DifficultyId } from "@/lib/minesweeper/types";

interface Props {
  current: DifficultyId;
  best: BestTimes;
  onSelect: (difficulty: Difficulty) => void;
}

export function DifficultySelector({ current, best, onSelect }: Props) {
  return (
    <div role="group" aria-label="난이도" className="grid w-full grid-cols-3 gap-2">
      {DIFFICULTY_LIST.map((d) => {
        const active = d.id === current;
        const time = best[d.id];
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center rounded-xl border px-2 py-2 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active
                ? "border-accent bg-accent/10"
                : "border-line bg-surface hover:border-accent/60"
            }`}
          >
            <span className="text-sm font-semibold">{d.label}</span>
            <span className="text-[11px] text-muted">
              {d.cols}×{d.rows} · 💣{d.mines}
            </span>
            <span className="mt-1 font-mono text-xs tabular-nums">
              <span className="text-muted">최고 </span>
              {time === undefined ? "—" : `${time}초`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
