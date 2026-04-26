import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@i18n";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import type { TileStatus } from "@utils/types";
import { Board } from "./Board";

describe("Board", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 6 rows and 30 cells", () => {
    render(<Board guesses={[]} current="" gameOver={false} />);

    expect(screen.getAllByRole("row").length).toBe(6);
    expect(screen.getAllByRole("gridcell").length).toBe(30);
  });

  it("renders rows and cells based on a custom round config", () => {
    render(
      <Board
        guesses={[]}
        current=""
        gameOver={false}
        roundConfig={{ maxGuesses: 4, lettersPerRow: 4 }}
      />,
    );

    expect(screen.getAllByRole("row").length).toBe(4);
    expect(screen.getAllByRole("gridcell").length).toBe(16);
  });

  it("shows a played guess and the current typing row", () => {
    const correct: TileStatus[] = [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ];

    render(
      <Board
        guesses={[{ word: "APPLE", statuses: correct }]}
        current="BR"
        gameOver={false}
      />,
    );

    expect(
      screen.getByRole("gridcell", {
        name: `A, ${i18n.t("play.gameplay.tile.statuses.correct")}`,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("gridcell", {
        name: `B, ${i18n.t("play.gameplay.tile.statuses.tbd")}`,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("gridcell", {
        name: `R, ${i18n.t("play.gameplay.tile.statuses.tbd")}`,
      }),
    ).toBeTruthy();
  });

  it("hides typing cells when game is over", () => {
    const absent: TileStatus[] = [
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ];

    render(
      <Board
        guesses={[{ word: "HOUSE", statuses: absent }]}
        current="ZZ"
        gameOver={true}
      />,
    );

    expect(
      screen.queryByRole("gridcell", {
        name: `Z, ${i18n.t("play.gameplay.tile.statuses.tbd")}`,
      }),
    ).toBeNull();
  });

  it("keeps revealed status colors after the game ends", () => {
    const mixed: TileStatus[] = [
      "correct",
      "present",
      "absent",
      "correct",
      "present",
    ];

    render(
      <Board
        guesses={[{ word: "HOUSE", statuses: mixed }]}
        current=""
        gameOver={true}
      />,
    );

    expect(
      screen.getByRole("gridcell", {
        name: `H, ${i18n.t("play.gameplay.tile.statuses.correct")}`,
      }).className,
    ).toContain("bg-green-700");
    expect(
      screen.getByRole("gridcell", {
        name: `O, ${i18n.t("play.gameplay.tile.statuses.present")}`,
      }).className,
    ).toContain("bg-yellow-500");
  });

  it("adds the entry animation class when enabled", () => {
    render(<Board guesses={[]} current="" gameOver={false} animateEntry />);

    expect(screen.getByRole("grid").className).toContain(
      "board-entry-animation",
    );
  });

  it("renders the board inside a capped-width container without scroll by default", () => {
    render(<Board guesses={[]} current="" gameOver={false} />);

    const scrollContainer = screen.getByTestId("board-scroll-container");
    expect(scrollContainer.className).toContain("max-w-full");
    expect(scrollContainer.className).not.toContain("overflow-x-auto");
  });

  it("adds horizontal scroll classes when enabled", () => {
    render(
      <Board
        guesses={[]}
        current=""
        gameOver={false}
        enableHorizontalScroll={true}
      />,
    );

    const scrollContainer = screen.getByTestId("board-scroll-container");
    expect(scrollContainer.className).toContain("overflow-x-auto");
    expect(scrollContainer.className).toContain("overscroll-x-contain");
  });

  it("adds staggered tile entry animation when enabled", () => {
    render(<Board guesses={[]} current="" gameOver={false} animateTileEntry />);

    const cells = screen.getAllByRole("gridcell");

    expect(cells[0].className).toContain("tile-entry-animation");
    expect(cells[0].style.animationDelay).toBe("0ms");
    expect(cells[1].style.animationDelay).toBe("16ms");
  });

  it("renders a green combo flash beside the board", () => {
    render(
      <Board
        guesses={[]}
        current=""
        gameOver={false}
        comboFlash={{ count: 3, tone: "correct", pulse: 1 }}
      />,
    );

    const combo = screen.getByText("x3");
    expect(combo.className).toContain("combo-flash-animation");
    expect(combo.className).toContain("text-green-800");
  });

  it("renders a yellow combo flash beside the board", () => {
    render(
      <Board
        guesses={[]}
        current=""
        gameOver={false}
        comboFlash={{ count: 2, tone: "present", pulse: 1 }}
      />,
    );

    const combo = screen.getByText("x2");
    expect(combo.className).toContain("combo-flash-animation");
    expect(combo.className).toContain("text-yellow-900");
  });

  it("highlights only the current active tile", () => {
    render(<Board guesses={[]} current="AB" gameOver={false} />);

    const cells = screen.getAllByRole("gridcell");

    expect(
      cells[2].querySelector(".tile-active-border-animation"),
    ).toBeTruthy();
    expect(cells[0].querySelector(".tile-active-border-animation")).toBeNull();
    expect(cells[1].querySelector(".tile-active-border-animation")).toBeNull();
  });

  it("uses a provided active tile index for the current row", () => {
    render(
      <Board guesses={[]} current="AB" gameOver={false} activeTileIndex={0} />,
    );

    const cells = screen.getAllByRole("gridcell");
    expect(
      cells[0].querySelector(".tile-active-border-animation"),
    ).toBeTruthy();
    expect(cells[1].querySelector(".tile-active-border-animation")).toBeNull();
    expect(cells[2].querySelector(".tile-active-border-animation")).toBeNull();
  });

  it("calls onTileSelect when clicking a tile in the active row", () => {
    const onTileSelect = vi.fn();
    render(
      <Board
        guesses={[]}
        current="AB"
        gameOver={false}
        onTileSelect={onTileSelect}
      />,
    );

    fireEvent.click(screen.getAllByRole("gridcell")[1]);
    expect(onTileSelect).toHaveBeenCalledWith(1);
  });

  it("shows animated indicator only on the current row", () => {
    const correct: TileStatus[] = [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ];

    render(
      <Board
        guesses={[{ word: "APPLE", statuses: correct }]}
        current="AB"
        gameOver={false}
      />,
    );

    const rows = screen.getAllByRole("row");

    expect(
      rows[1].querySelector(".row-active-indicator-animation"),
    ).toBeTruthy();
    expect(rows[0].querySelector(".row-active-indicator-animation")).toBeNull();
    expect(rows[2].querySelector(".row-active-indicator-animation")).toBeNull();
  });

  it("scales past rows to 0.95 and active row to 1.05 with transition", () => {
    const correct: TileStatus[] = [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ];

    render(
      <Board
        guesses={[{ word: "APPLE", statuses: correct }]}
        current="AB"
        gameOver={false}
      />,
    );

    const rows = screen.getAllByRole("row");

    expect(rows[0].className).toContain("scale-[0.95]");
    expect(rows[1].className).toContain("scale-[1.05]");
    expect(rows[1].className).toContain("transition-[scale]");
  });

  it("shows the gray hollow-circle bonus marker with tooltip for marked rows", () => {
    const absent: TileStatus[] = [
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ];

    render(
      <Board
        guesses={[
          { word: "CRANE", statuses: absent },
          { word: "ZZZZZ", statuses: absent },
        ]}
        current=""
        gameOver={false}
        normalDictionaryBonusRowFlags={[true, false]}
      />,
    );

    const tooltip = i18n.t("play.gameplay.normalDictionaryBonusTooltip", {
      bonus: NORMAL_DICTIONARY_ROW_BONUS,
    });
    const marker = screen.getByRole("img", {
      name: tooltip,
    });

    expect(marker.getAttribute("title")).toBe(tooltip);
    expect(marker.querySelector("span")?.className).toContain(
      "border-neutral-400",
    );
    expect(
      screen.getAllByRole("img", {
        name: tooltip,
      }),
    ).toHaveLength(1);
  });
});
