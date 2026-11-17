import { describe, expect, it } from "vitest";
import { createBoard, getNeighbors, mulberry32, placeMines } from "../board";
import { DIFFICULTY_LIST } from "../difficulty";

describe("placeMines", () => {
  for (const d of DIFFICULTY_LIST) {
    it(`${d.label}: 지뢰 수가 설정과 일치한다`, () => {
      for (let seed = 1; seed <= 20; seed++) {
        const board = placeMines(createBoard(d.rows, d.cols), d.rows, d.cols, d.mines, 0, mulberry32(seed));
        expect(board.filter((c) => c.mine)).toHaveLength(d.mines);
      }
    });

    it(`${d.label}: 첫 클릭 칸과 주변 8칸에는 지뢰가 없다`, () => {
      const total = d.rows * d.cols;
      for (const safe of [0, d.cols - 1, total - 1, Math.floor(total / 2)]) {
        for (let seed = 1; seed <= 30; seed++) {
          const board = placeMines(createBoard(d.rows, d.cols), d.rows, d.cols, d.mines, safe, mulberry32(seed));
          expect(board[safe].mine).toBe(false);
          for (const n of getNeighbors(safe, d.rows, d.cols)) expect(board[n].mine).toBe(false);
        }
      }
    });
  }

  it("주입한 난수 생성기가 같으면 같은 배치가 나온다", () => {
    const make = () => placeMines(createBoard(9, 9), 9, 9, 10, 40, mulberry32(7));
    expect(make()).toEqual(make());
  });

  it("인접 지뢰 수를 올바르게 계산한다", () => {
    const board = placeMines(createBoard(9, 9), 9, 9, 10, 40, mulberry32(3));
    board.forEach((cell, i) => {
      if (cell.mine) return;
      const expected = getNeighbors(i, 9, 9).filter((n) => board[n].mine).length;
      expect(cell.adjacent).toBe(expected);
    });
  });
});

describe("getNeighbors", () => {
  it("모서리는 3칸, 가장자리는 5칸, 안쪽은 8칸", () => {
    expect(getNeighbors(0, 5, 5)).toHaveLength(3);
    expect(getNeighbors(2, 5, 5)).toHaveLength(5);
    expect(getNeighbors(12, 5, 5)).toHaveLength(8);
  });
});
