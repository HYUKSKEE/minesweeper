import type { GameStatus } from "@/lib/minesweeper/types";
import { MineIcon } from "./icons";

interface Props {
  minesLeft: number;
  elapsed: number;
  status: GameStatus;
  onNewGame: () => void;
}

const MESSAGES: Record<GameStatus, string> = {
  idle: "칸을 눌러 시작하세요",
  playing: "진행 중",
  won: "승리! 모든 지뢰를 찾았어요",
  lost: "지뢰를 밟았어요",
};

const pad = (n: number) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");

export function StatusBar({ minesLeft, elapsed, status, onNewGame }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2" aria-label={`남은 지뢰 ${minesLeft}개`} role="status">
          <MineIcon className="size-5 text-muted" />
          <span className="font-mono text-2xl font-semibold tabular-nums">{pad(minesLeft)}</span>
        </div>
        <button
          type="button"
          onClick={onNewGame}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-on-accent transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
        >
          새 게임
        </button>
        <div className="flex items-center gap-2" aria-label={`경과 시간 ${elapsed}초`} role="timer">
          <span className="text-xs font-medium text-muted">TIME</span>
          <span className="font-mono text-2xl font-semibold tabular-nums">{pad(elapsed)}</span>
        </div>
      </div>
      <p
        aria-live="polite"
        className={`mt-2 h-5 text-center text-sm ${
          status === "won" ? "font-semibold text-accent" : status === "lost" ? "font-semibold text-danger" : "text-muted"
        }`}
      >
        {MESSAGES[status]}
      </p>
    </div>
  );
}
