import { describe, expect, it } from "vitest";
import { DIFFICULTIES } from "../difficulty";
import { createInitialState, reducer } from "../reducer";
import { stateFromLayout } from "./helpers";

describe("REVEAL", () => {
  it("첫 클릭은 지뢰를 배치하고 항상 안전하다", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = reducer(createInitialState(DIFFICULTIES.beginner), { type: "REVEAL", index: 40, seed });
      expect(s.status === "playing" || s.status === "won").toBe(true);
      expect(s.board[40].state).toBe("open");
      expect(s.board.filter((c) => c.mine)).toHaveLength(10);
    }
  });

  it("0인 칸을 열면 연쇄로 열린다", () => {
    const s = reducer(stateFromLayout(["....", "....", "...*"]), { type: "REVEAL", index: 0, seed: 1 });
    // 지뢰 주변 3칸(숫자 1)과 지뢰를 제외한 모든 칸이 열린다.
    expect(s.board.filter((c) => c.state === "open")).toHaveLength(11);
    expect(s.status).toBe("won");
  });

  it("숫자 칸을 열면 그 칸만 열린다", () => {
    const s = reducer(stateFromLayout(["*...", "....", "...."]), { type: "REVEAL", index: 1, seed: 1 });
    expect(s.board.filter((c) => c.state === "open")).toHaveLength(1);
    expect(s.status).toBe("playing");
  });

  it("깃발이 꽂힌 칸은 열리지 않는다", () => {
    let s = stateFromLayout(["*..", "...", "..."]);
    s = reducer(s, { type: "TOGGLE_FLAG", index: 4 });
    const after = reducer(s, { type: "REVEAL", index: 4, seed: 1 });
    expect(after).toBe(s);
  });
});

describe("승리/패배", () => {
  it("지뢰를 열면 패배하고 모든 지뢰가 공개된다", () => {
    let s = stateFromLayout(["*..", "...", "..*"]);
    s = reducer(s, { type: "TOGGLE_FLAG", index: 1 }); // 잘못된 깃발
    s = reducer(s, { type: "REVEAL", index: 0, seed: 1 });
    expect(s.status).toBe("lost");
    expect(s.explodedIndex).toBe(0);
    expect(s.board[8].state).toBe("open"); // 다른 지뢰 공개
    expect(s.board[1]).toMatchObject({ state: "flagged", mine: false }); // 잘못된 깃발 유지
  });

  it("올바르게 꽂은 깃발은 패배 후에도 유지된다", () => {
    let s = stateFromLayout(["*..", "...", "..*"]);
    s = reducer(s, { type: "TOGGLE_FLAG", index: 8 });
    s = reducer(s, { type: "REVEAL", index: 0, seed: 1 });
    expect(s.board[8].state).toBe("flagged");
  });

  it("지뢰가 아닌 칸을 모두 열면 승리하고 남은 지뢰에 깃발이 꽂힌다", () => {
    let s = stateFromLayout(["*.", ".."]);
    s = reducer(s, { type: "REVEAL", index: 1, seed: 1 });
    s = reducer(s, { type: "REVEAL", index: 2, seed: 1 });
    expect(s.status).toBe("playing");
    s = reducer(s, { type: "REVEAL", index: 3, seed: 1 });
    expect(s.status).toBe("won");
    expect(s.board[0].state).toBe("flagged");
    expect(s.flags).toBe(1);
  });

  it("게임이 끝나면 입력이 무시된다", () => {
    let s = stateFromLayout(["*..", "...", "..."]);
    s = reducer(s, { type: "REVEAL", index: 0, seed: 1 });
    expect(reducer(s, { type: "REVEAL", index: 5, seed: 1 })).toBe(s);
    expect(reducer(s, { type: "TOGGLE_FLAG", index: 5 })).toBe(s);
    expect(reducer(s, { type: "CHORD", index: 5 })).toBe(s);
    expect(reducer(s, { type: "TICK" })).toBe(s);
  });
});

describe("CHORD", () => {
  const layout = ["*...", "....", "....", "...*"];

  it("주변 깃발 수가 숫자와 같으면 나머지 주변 칸을 연다", () => {
    let s = stateFromLayout(layout);
    s = reducer(s, { type: "REVEAL", index: 5, seed: 1 }); // 숫자 1
    s = reducer(s, { type: "TOGGLE_FLAG", index: 0 });
    s = reducer(s, { type: "CHORD", index: 5 });
    for (const n of [1, 2, 4, 6, 8, 9, 10]) expect(s.board[n].state).toBe("open");
    expect(s.status).not.toBe("lost");
  });

  it("깃발 수가 부족하면 아무 일도 일어나지 않는다", () => {
    let s = stateFromLayout(layout);
    s = reducer(s, { type: "REVEAL", index: 5, seed: 1 });
    expect(reducer(s, { type: "CHORD", index: 5 })).toBe(s);
  });

  it("깃발 수가 넘쳐도 동작하지 않는다", () => {
    let s = stateFromLayout(layout);
    s = reducer(s, { type: "REVEAL", index: 5, seed: 1 });
    s = reducer(s, { type: "TOGGLE_FLAG", index: 0 });
    s = reducer(s, { type: "TOGGLE_FLAG", index: 1 });
    expect(reducer(s, { type: "CHORD", index: 5 })).toBe(s);
  });

  it("깃발을 잘못 꽂았다면 코드 열기로 지뢰를 밟아 패배한다", () => {
    let s = stateFromLayout(layout);
    s = reducer(s, { type: "REVEAL", index: 5, seed: 1 });
    s = reducer(s, { type: "TOGGLE_FLAG", index: 1 }); // 지뢰가 아닌 칸
    s = reducer(s, { type: "CHORD", index: 5 });
    expect(s.status).toBe("lost");
    expect(s.explodedIndex).toBe(0);
  });

  it("닫힌 칸이나 빈 칸(0)에는 동작하지 않는다", () => {
    const s = stateFromLayout(layout);
    expect(reducer(s, { type: "CHORD", index: 5 })).toBe(s);
  });
});

describe("플래그/타이머/새 게임", () => {
  it("깃발을 토글하면 깃발 수가 바뀐다", () => {
    let s = stateFromLayout(["*.."]);
    s = reducer(s, { type: "TOGGLE_FLAG", index: 1 });
    expect(s.flags).toBe(1);
    s = reducer(s, { type: "TOGGLE_FLAG", index: 1 });
    expect(s.flags).toBe(0);
  });

  it("TICK은 플레이 중에만 시간을 올린다", () => {
    const idle = createInitialState();
    expect(reducer(idle, { type: "TICK" }).elapsed).toBe(0);
    expect(reducer(stateFromLayout(["*.."]), { type: "TICK" }).elapsed).toBe(1);
  });

  it("NEW_GAME은 난이도를 바꾸고 타이머/깃발을 초기화한다", () => {
    let s = stateFromLayout(["*.."]);
    s = reducer(s, { type: "TICK" });
    s = reducer(s, { type: "TOGGLE_FLAG", index: 0 });
    const n = reducer(s, { type: "NEW_GAME", difficulty: DIFFICULTIES.expert });
    expect(n.elapsed).toBe(0);
    expect(n.flags).toBe(0);
    expect(n.status).toBe("idle");
    expect(n.board).toHaveLength(480);
  });
});
