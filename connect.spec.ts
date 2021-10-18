export enum Pawn {
  RED = 1,
  YELLOW = -1,
  EMPTY = 0
}

export enum Endgame {
  NOT_WIN,
  RED_WIN,
  YELLOW_WIN,
}

const NOT_IN_ARRAY: number = -1;

const COLUMNS: number = 7;

const ROWS: number = 6;

const BOARD_DIMENSION: number = COLUMNS * ROWS;

const FOUR_RED_PAWNS = 4;


const FOUR_YELLOW_PAWNS = -4;

const EMPTY_COLUMN = [0, 0, 0, 0, 0, 0];

const DIAGONAL_OFFSET_LEFT_TO_RIGHT: number = COLUMNS - 1;
const DIAGONAL_OFFSET_RIGHT_TO_LEFT: number = COLUMNS + 1;
const FIRST_DIAGONAL_PAWN_POSITION: number = 3;

const endLineToWin = (startLine: number) => FOUR_RED_PAWNS + startLine;

class Column {
  constructor(public readonly index: number) {
    if (index < 0 || index > 6) {
      throw new IllegalColumnIndexError();
    }
  }


}

class IllegalColumnIndexError {
}

const LINE_WIN_4_POSSIBILITIES = [0, 0, 0, 0];

type Line = number;


class Grid {
  private pawns: Pawn[] = Array.from({length: BOARD_DIMENSION}).map(() => Pawn.EMPTY);

  private static toOneDimension(column: number, row: number): number {
    return column + row * COLUMNS;
  }

  private static nextLineIndex(index: number): number {
    return index + COLUMNS;
  }

  full() {
    return this.pawns.reduce((acc, pawn) => acc && pawn !== Pawn.EMPTY, true);
  }

  getPawnAtPosition(column: number, row: number): Pawn {
    return this.pawns[Grid.toOneDimension(column, row)];
  }

  addPawn(pawn: Pawn, column: Column): Endgame {
    this.insertPawnInPawnsCollection(pawn, column.index);
    return this.endGameState(column);
  }

  printGrid() {
    return this.pawns;
  }

  private endGameState(column: Column): Endgame {
    const pawnIndex = this.getNewPawnIndex(column);

    let endgameState: Endgame = this.isColumnWin(column);
    if (endgameState !== Endgame.NOT_WIN) {
      return endgameState;
    }
    endgameState = this.isLineWin(column);
    if (endgameState !== Endgame.NOT_WIN) {
      return endgameState;
    }
    endgameState = this.isDiagonalLeftToRightWin();
    if (endgameState !== Endgame.NOT_WIN) {
      return endgameState;
    }
    return this.isDiagonalRightToLeftWin(pawnIndex);
  }

  private isColumnWin(playedColumn: Column): Endgame {
    const column: Pawn[] = this.getColumn(playedColumn);

    return [
        this.isFourColumn(column, 0),
        this.isFourColumn(column, 1),
        this.isFourColumn(column, 2)
      ].find((endgame: Endgame) => endgame !== Endgame.NOT_WIN)
      || Endgame.NOT_WIN;
  }

  private isLineWin(playedColumn: Column): Endgame {
    return this.getPossibilitiesSums(
      this.getLineIndex(playedColumn)).reduce((acc, val) => this.getEndgameState(acc, val),
      Endgame.NOT_WIN,
    );
  }

  private getLineIndex(playedColumn: Column): number {
    const column: Pawn[] = this.getColumn(playedColumn);
    let firstEmptyIndex = column.indexOf(Pawn.EMPTY);
    if (firstEmptyIndex === NOT_IN_ARRAY) firstEmptyIndex = COLUMNS;
    return (firstEmptyIndex - 1) * COLUMNS;
  }

  private isFourColumn(column: number[], startLine: number): Endgame {
    const val = column
      .slice(startLine, endLineToWin(startLine))
      .reduce((totalPawns, currentPawn) => totalPawns + currentPawn, 0);

    if (val === FOUR_RED_PAWNS) return Endgame.RED_WIN;
    if (val === FOUR_YELLOW_PAWNS) return Endgame.YELLOW_WIN;

    return Endgame.NOT_WIN;
  }

  private getEndgameState(previousState: Endgame, currentState: Endgame): Endgame {
    if (previousState !== Endgame.NOT_WIN) return previousState;

    if (currentState === FOUR_RED_PAWNS) return Endgame.RED_WIN;
    if (currentState === FOUR_YELLOW_PAWNS) return Endgame.YELLOW_WIN;
    return Endgame.NOT_WIN;
  }

  private getPossibilitiesSums(lineIndex: number): number[] {
    return LINE_WIN_4_POSSIBILITIES
      .map((_: number, index: number) => this.pawns
        .slice(index + lineIndex, index + FOUR_RED_PAWNS + lineIndex))
      .map(val => val.reduce((acc, val) => acc + val, 0));
  }

  private getColumn(playedColumn: Column): Pawn[] {
    return EMPTY_COLUMN.map((_, index: number) => this.pawns[index * COLUMNS + playedColumn.index]);
  }

  private insertPawnInPawnsCollection(pawn: Pawn, index: number): void {
    const NEXT_LINE_INDEX: number = Grid.nextLineIndex(index);

    if (this.pawns[index] === Pawn.EMPTY) {
      this.pawns[index] = pawn;
    } else if (NEXT_LINE_INDEX < BOARD_DIMENSION) {
      this.insertPawnInPawnsCollection(pawn, NEXT_LINE_INDEX);
    } else {
      throw new RangeError();
    }
  }


  private isDiagonalLeftToRightWin(): Endgame {


    for (let lineOffset = 0; lineOffset < 3; lineOffset++) {
      for (let columnOffset = 0; columnOffset < 4; columnOffset++) {
        const result: number = [0, 1, 2, 3].reduce((acc, index) =>
          acc + this.pawns[FIRST_DIAGONAL_PAWN_POSITION + columnOffset
          + index * DIAGONAL_OFFSET_LEFT_TO_RIGHT + lineOffset * COLUMNS], 0);

        if (result === FOUR_RED_PAWNS) return Endgame.RED_WIN;
        if (result === FOUR_YELLOW_PAWNS) return Endgame.YELLOW_WIN;
      }
    }
    return Endgame.NOT_WIN;
  }


  private isDiagonalRightToLeftWin(pawnIndex: Line): Endgame {

    // if (
    //   pawnIndex === 0 ||
    //   pawnIndex === 1 ||
    //   pawnIndex === 8 ||
    //   pawnIndex === 32
    //
    // ) {
      return this.isDiagonalRightToLeftWinNew(pawnIndex)
    // }
    // for (let lineOffset = 0; lineOffset < 3; lineOffset++) {
    //   for (let columnOffset = 0; columnOffset < 4; columnOffset++) {
    //     const result: number = [0, 1, 2, 3].reduce((acc, index) =>
    //       acc + this.pawns[columnOffset + index * DIAGONAL_OFFSET_RIGHT_TO_LEFT + lineOffset * COLUMNS], 0);
    //
    //     if (result === FOUR_RED_PAWNS) return Endgame.RED_WIN;
    //     if (result === FOUR_YELLOW_PAWNS) return Endgame.YELLOW_WIN;
    //   }
    // }
    // return Endgame.NOT_WIN;
  }

  private isDiagonalRightToLeftWinNew(pawnIndex: number): Endgame {



    const endgames = this.getEndgameTestCases(pawnIndex)
      .map(array => array.reduce((acc, index) => acc + this.pawns[index], 0));

    if (endgames.includes(FOUR_RED_PAWNS)) return Endgame.RED_WIN;
    if (endgames.includes(FOUR_YELLOW_PAWNS)) return Endgame.YELLOW_WIN;

    return Endgame.NOT_WIN;
  }

  private getEndgameTestCases(pawnIndex: number) {
    console.log(pawnIndex);
    return [
      [pawnIndex, pawnIndex+8, pawnIndex+16, pawnIndex+24],
      [pawnIndex-8, pawnIndex+0, pawnIndex+8, pawnIndex+16],
      [pawnIndex-16, pawnIndex-8, pawnIndex+0, pawnIndex+8],
      [pawnIndex-24, pawnIndex-16, pawnIndex-8, pawnIndex+0]
    ].filter(this.allIndexesInBoard);
  }

  private allIndexesInBoard(pawnIndexes: number[]): boolean {
    return Math.min(...pawnIndexes) >= 0 && Math.max(...pawnIndexes) < BOARD_DIMENSION;
  }

  private getPawnIndex(column: Column): number {

    return this.getLineIndex(column)+column.index;
  }

  getNewPawnIndex(column: Column):number {
    const filteredColumn = this.pawns.filter(this.isNotEmptyInColumn(column))
    return this.computeIndex(filteredColumn.length-1, column.index);
  }

  private computeIndex(line: number, column: number) {
    return line * COLUMNS + column;
  }

  private isNotEmptyInColumn(column: Column): (pawn: Pawn, index: number) => boolean {
    return (pawn: Pawn, index: number) => (index - column.index) % COLUMNS === 0 && pawn !== Pawn.EMPTY;
  }
}

describe('test connect 4', () => {
  let grid: Grid;
  beforeEach(() => {
    grid = new Grid();
  });
  describe('basics rules', () => {
    it('should have an empty grid', () => {
      expect(grid.full()).toEqual(false);
    });
    it('should get Red pawn at position column 0 ', () => {
      grid.addPawn(Pawn.RED, new Column(0));
      expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED);
    });
    it('should get Yellow at position column 0', () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.YELLOW)
    });
    it('should get Red at position column 0 and yellow at position 7', () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(0));
      expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED)
      expect(grid.getPawnAtPosition(0, 1)).toEqual(Pawn.YELLOW)
    });
    it('should add pawn Red,Yellow,Red: 1 at position column 1', () => {
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(1));
      expect(grid.getPawnAtPosition(1, 0)).toEqual(Pawn.RED)
      expect(grid.getPawnAtPosition(1, 1)).toEqual(Pawn.YELLOW)
      expect(grid.getPawnAtPosition(1, 2)).toEqual(Pawn.RED)
    });
    it('should not add pawn when column 0 full', () => {
      expect(() => {
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.YELLOW, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.YELLOW, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
      }).toThrow(RangeError);
    });
    it('should not add pawn in column 7 ', () => {
      expect(() => grid.addPawn(Pawn.RED, new Column(7))).toThrow(IllegalColumnIndexError);
    });
    it('should not add pawn in column -1 ', () => {
      expect(() => grid.addPawn(Pawn.RED, new Column(-1))).toThrow(IllegalColumnIndexError);
    });
  });

  describe('For Column Win', () => {
    it('should be win when we add a red pawn in column 0 and the 3 pawn under it are red', () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

      expect(endgame).toEqual(Endgame.RED_WIN);
    });
    it('should be not win when we add a red pawn in column 0 and the 2 pawn under it are red', () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

      expect(endgame).toEqual(Endgame.NOT_WIN);
    });
    it('should be win when column 0 state move from C[Y R R R] to C[Y R R R +R]', () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

      expect(endgame).toEqual(Endgame.RED_WIN);
    });
    it('should be win when column 6 state move from C[R Y Y Y] to C[R Y Y Y +Y]', () => {
      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.YELLOW, new Column(6));
      grid.addPawn(Pawn.YELLOW, new Column(6));
      grid.addPawn(Pawn.YELLOW, new Column(6));

      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(6));

      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    });
  });
  describe('For Line Win', () => {
    it('should be win when line 0 state move from L[Y Y Y] to L[Y Y Y +Y]', () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(3));

      expect(grid.printGrid()).toEqual([
        -1, -1, -1, -1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    });
    it('should be not win when line 0 state move from L[Y Y Y] to L[Y Y Y +R]', () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(3));

      expect(endgame).toEqual(Endgame.NOT_WIN);
    });
    it('should be yellow win when line 0 state move from L[R . Y Y Y] to L[R . Y Y Y +Y]', () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));

      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(5));

      expect(grid.printGrid()).toEqual([
        1, 0, -1, -1, -1, -1, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    });

    it(`should be yellow win when add a Yellow pawn in line 1
        board state from :
        ...
        | Y Y Y . . . . |
        | Y Y Y R . . . |
        to
        ...
        | Y Y Y Y . . . |
        | Y Y Y R . . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(3));

      expect(grid.printGrid()).toEqual([
        -1, -1, -1, 1, 0, 0, 0,
        -1, -1, -1, -1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    });

    it(`should be Red win when add a Red pawn in line 1
          board state from :
          ...
          | R R R . . . . |
          | R R R Y . . . |
          to
          ...
          | R R R R . . . |
          | R R R Y . . . |`, () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(3));

      expect(grid.printGrid()).toEqual([
        1, 1, 1, -1, 0, 0, 0,
        1, 1, 1, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
  });
  describe('For diag left to right', () => {


    it(`should be Red win for diagonal when add a Red pawn in column 0
          board state from :
          ...
          | . . . . . . . |
          | Y R . . . . . |
          | Y Y R . . . . |
          | Y R R R . . . |
          to
          ...
          | R . . . . . . |
          | Y R . . . . . |
          | Y Y R . . . . |
          | Y R R R . . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));

      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

      expect(grid.printGrid()).toEqual([
        -1, 1, 1, 1, 0, 0, 0,
        -1, -1, 1, 0, 0, 0, 0,
        -1, 1, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a Red pawn in column 1
          board state from :
          ...
          | . . . . . . . |
          | . Y R . . . . |
          | . Y Y R . . . |
          | . Y R R R . . |
          to
          ...
          | . R . . . . . |
          | . Y R . . . . |
          | . Y Y R . . . |
          | . Y R R R . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));

      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(1));

      expect(grid.printGrid()).toEqual([
        0, -1, 1, 1, 1, 0, 0,
        0, -1, -1, 1, 0, 0, 0,
        0, -1, 1, 0, 0, 0, 0,
        0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a Red pawn in column 6
          board state from :
          ...
          | . . . R . . . |
          | . . . Y R . . |
          | . . . Y Y R . |
          | . . . Y R R . |
          to
          ...
          | . . . R . . . |
          | . . . Y R . . |
          | . . . Y Y R . |
          | . . . Y R R R |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));


      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));

      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));

      grid.addPawn(Pawn.RED, new Column(3));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(6));

      expect(grid.printGrid()).toEqual([
        0, 0, 0, -1, 1, 1, 1,
        0, 0, 0, -1, -1, 1, 0,
        0, 0, 0, -1, 1, 0, 0,
        0, 0, 0, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a Red pawn in column 0 with 5 lines
          board state from :
          ...
          | . . . . . . . |
          | R R . . . . . |
          | Y Y R . . . . |
          | Y Y R R . . . |
          | Y R R Y Y . . |
          to
          ...
          | R . . . . . . |
          | R R . . . . . |
          | Y Y R . . . . |
          | Y Y R R . . . |
          | Y R R Y Y . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));

      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));

      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

      expect(grid.printGrid()).toEqual([
        -1, 1, 1, -1, -1, 0, 0,
        -1, -1, 1, 1, 0, 0, 0,
        -1, -1, 1, 0, 0, 0, 0,
        1, 1, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a Red pawn in column 3 with 5 lines
          board state from :
          ...
          | . . . R . . . |
          | . . . R R . . |
          | . . . R Y R . |
          | . . . Y Y R . |
          | . . . Y R R Y |
          | . . . R R Y Y |
          to
          ...
          | . . . R . . . |
          | . . . R R . . |
          | . . . R Y R . |
          | . . . Y Y R R |
          | . . . Y R R Y |
          | . . . R R Y Y |`, () => {
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(6));

      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(6));

      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));

      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));

      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));

      grid.addPawn(Pawn.RED, new Column(3));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(6));

      expect(grid.printGrid()).toEqual([
        0, 0, 0, 1, 1, -1, -1,
        0, 0, 0, -1, 1, 1, -1,
        0, 0, 0, -1, -1, 1, 1,
        0, 0, 0, 1, -1, 1, 0,
        0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 1, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a Red pawn in column 3 with 5 lines
          board state from :
          ...
          | Y . . . . . .|
          | R R . . . . .|
          | R Y R . . . .|
          | Y Y R . . . .|
          | Y R R Y R . .|
          | R R Y R Y Y .|
          to
          ...
          | Y . . . . . .|
          | R R . . . . .|
          | R Y R . . . .|
          | Y Y R R . . .|
          | Y R R Y R . .|
          | R R Y R Y Y .|`, () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(5));


      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));

      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));


      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));

      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));

      grid.addPawn(Pawn.YELLOW, new Column(0));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(3));

      expect(grid.printGrid()).toEqual([
        1, 1, -1, 1, -1, -1, 0,
        -1, 1, 1, -1, 1, 0, 0,
        -1, -1, 1, 1, 0, 0, 0,
        1, -1, 1, 0, 0, 0, 0,
        1, 1, 0, 0, 0, 0, 0,
        -1, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Yellow win for diagonal when add a Yellow pawn in column 3 with 5 lines
          board state from :
          ...
          | R . . . . . .|
          | R Y . . . . .|
          | R Y Y . . . .|
          | Y Y R . . . .|
          | Y R R Y Y . .|
          | R R Y R Y R .|
          to
          ...
          | R . . . . . .|
          | R Y . . . . .|
          | R Y Y . . . .|
          | Y Y R Y . . .|
          | Y R R Y Y . .|
          | R R Y R Y R .|`, () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));


      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(4));

      grid.addPawn(Pawn.YELLOW, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.RED, new Column(2));


      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.YELLOW, new Column(1));

      grid.addPawn(Pawn.RED, new Column(0));

      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(3));

      expect(grid.printGrid()).toEqual([
        1, 1, -1, 1, -1, 1, 0,
        -1, 1, 1, -1, -1, 0, 0,
        -1, -1, 1, -1, 0, 0, 0,
        1, -1, -1, 0, 0, 0, 0,
        1, -1, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    })
  });

  describe('For diag right to left', () => {
    it(`should be Red win for diagonal when add a Red pawn in column 6
          board state from :
          ...
          | . . . . . . . |
          | . . . . . R Y |
          | . . . . R Y Y |
          | . . . R R R Y |
          to
          ...
          | . . . . . . R |
          | . . . . . R Y |
          | . . . . R Y Y |
          | . . . R R R Y |`, () => {
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(6));

      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(6));

      grid.addPawn(Pawn.RED, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(6));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(6));

      expect(grid.printGrid()).toEqual([
        0, 0, 0, 1, 1, 1, -1,
        0, 0, 0, 0, 1, -1, -1,
        0, 0, 0, 0, 0, 1, -1,
        0, 0, 0, 0, 0, 0, 1,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })

    it(`should be Red win for diagonal when add a Red pawn in column 5
          board state from :
          ...
          | . . . . . . . |
          | . . . . R Y . |
          | . . . R Y Y . |
          | . . R R R Y . |
          to
          ...
          | . . . . . R . |
          | . . . . R Y . |
          | . . . R Y Y . |
          | . . R R R Y . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));

      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.RED, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.RED, new Column(4));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(5));

      expect(grid.printGrid()).toEqual([
        0, 0, 1, 1, 1, -1, 0,
        0, 0, 0, 1, -1, -1, 0,
        0, 0, 0, 0, 1, -1, 0,
        0, 0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a Red pawn in column 6 in last line
          board state from :
          ...
         | . . . . . . . |
         | . . . . . R Y |
         | . . . . R Y Y |
         | . . . R R R Y |
         | . . . Y Y R R |
         | . . . R R Y Y |
          to
          ...
         | . . . . . . R |
         | . . . . . R Y |
         | . . . . R Y Y |
         | . . . R R R Y |
         | . . . Y Y R R |
         | . . . R R Y Y |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(6));
      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(3));

      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.RED, new Column(5));
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(6));
      grid.addPawn(Pawn.RED, new Column(5));
      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(6));
      grid.addPawn(Pawn.YELLOW, new Column(5));
      grid.addPawn(Pawn.RED, new Column(4));

      grid.addPawn(Pawn.YELLOW, new Column(6));
      grid.addPawn(Pawn.RED, new Column(5));

      const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(6));

      expect(grid.printGrid()).toEqual([
        0, 0, 0, 1, 1, -1, -1,
        0, 0, 0, -1, -1, 1, 1,
        0, 0, 0, 1, 1, 1, -1,
        0, 0, 0, 0, 1, -1, -1,
        0, 0, 0, 0, 0, 1, -1,
        0, 0, 0, 0, 0, 0, 1,
      ]);
      expect(endgame).toEqual(Endgame.RED_WIN);
    })
    it(`should be Red win for diagonal when add a YELLOW pawn in column 3 in last line
          board state from :
          ...
         | . . . . . . . |
         | . . Y R . . . |
         | . Y Y Y . . . |
         | Y R R Y . . . |
         | Y Y R R . . . |
         | R R Y Y . . . |
          to
          ...
         | . . . Y . . . |
         | . . Y R . . . |
         | . Y Y Y . . . |
         | Y R R Y . . . |
         | Y Y R R . . . |
         | R R Y Y . . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(0));

      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(0));

      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.YELLOW, new Column(0));

      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(1));

      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(3));

      expect(grid.printGrid()).toEqual([
        1, 1, -1, -1, 0, 0, 0,
        -1, -1, 1, 1, 0, 0, 0,
        -1, 1, 1, -1, 0, 0, 0,
        0, -1, -1, -1, 0, 0, 0,
        0, 0, -1, 1, 0, 0, 0,
        0, 0, 0, -1, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    })
    it(`should be Red win for diagonal when add a YELLOW pawn in column3 0 in last line
          board state from :
          ...
         | . . . . . . . |
         | . . . . . . . |
         | . . . Y . . . |
         | . . Y Y . . . |
         | . Y R R . . . |
         | . R Y Y . . . |
          to
          ...
         | . . . . . . . |
         | . . . . . . . |
         | . . . Y . . . |
         | . . Y Y . . . |
         | . Y R R . . . |
         | Y R Y Y . . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));
      grid.addPawn(Pawn.RED, new Column(1));

      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(1));

      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      grid.addPawn(Pawn.YELLOW, new Column(3));


      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(0));

      expect(grid.printGrid()).toEqual([
        -1, 1, -1, -1, 0, 0, 0,
        0, -1, 1, 1, 0, 0, 0,
        0, 0, -1, -1, 0, 0, 0,
        0, 0, 0, -1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    })
    it(`should be Red win for diagonal when add a YELLOW pawn in column 1 in last line
          board state from :
          ...
         | . . . . . . . |
         | . . . . . . . |
         | . . . . Y . . |
         | . . . Y Y . . |
         | . . Y R R . . |
         | . . R Y Y . . |
          to
          ...
         | . . . . . . . |
         | . . . . . . . |
         | . . . . Y . . |
         | . . . Y Y . . |
         | . . Y R R . . |
         | . Y R Y Y . . |`, () => {
      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));

      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(3));

      grid.addPawn(Pawn.YELLOW, new Column(4));


      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(1));

      expect(grid.printGrid()).toEqual([
        0, -1, 1, -1, -1, 0, 0,
        0, 0, -1, 1, 1, 0, 0,
        0, 0, 0, -1, -1, 0, 0,
        0, 0, 0, 0, -1, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    })
    it(`should be Red win for diagonal when add a YELLOW pawn in column 4 in 4th line
          board state from :
          ...
         | . . . . . . . |
         | . . . . . . . |
         | . . . Y R . . |
         | . . Y Y Y . . |
         | . Y R R R . . |
         | R R R Y Y . . |
          to
          ...
         | . . . . . . . |
         | . . . . Y . . |
         | . . . Y R . . |
         | . . Y Y Y . . |
         | . Y R R R . . |
         | R R R Y Y . . |`, () => {

      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.RED, new Column(1));
      grid.addPawn(Pawn.RED, new Column(0));

      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.RED, new Column(3));
      grid.addPawn(Pawn.RED, new Column(2));
      grid.addPawn(Pawn.YELLOW, new Column(1));

      grid.addPawn(Pawn.YELLOW, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(3));
      grid.addPawn(Pawn.YELLOW, new Column(2));

      grid.addPawn(Pawn.RED, new Column(4));
      grid.addPawn(Pawn.YELLOW, new Column(3));




      const endgame: Endgame = grid.addPawn(Pawn.YELLOW, new Column(4));

      expect(grid.printGrid()).toEqual([
        1, 1, 1, -1, -1, 0, 0,
        0, -1, 1, 1, 1, 0, 0,
        0, 0, -1, -1, -1, 0, 0,
        0, 0, 0, -1, 1, 0, 0,
        0, 0, 0, 0, -1, 0, 0,
        0, 0, 0, 0, 0, 0, 0
      ]);
      expect(endgame).toEqual(Endgame.YELLOW_WIN);
    });

  });

  describe('getPawnIndex', () => {
    it('should return index 0 for add pawn on line 0  column 0 ', () => {
      grid.addPawn(Pawn.RED, new Column(0));
      expect(grid.getNewPawnIndex(new Column(0))).toEqual(0);
    });
    it('should return index 6 for add pawn on line 0  column 6 ', () => {
      grid.addPawn(Pawn.RED, new Column(6));
      expect(grid.getNewPawnIndex(new Column(6))).toEqual(6);
    });
    it(`should return index 0for add pawn on line 1  column 0
    `, () => {
      grid.addPawn(Pawn.RED, new Column(0));
      grid.addPawn(Pawn.RED, new Column(0));
      expect(grid.getNewPawnIndex(new Column(0))).toEqual(7);
    });
    it(`should return index 42 for add pawn on line 6  column 6
    `, () => {
      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.RED, new Column(6));
      grid.addPawn(Pawn.RED, new Column(6));
      expect(grid.getNewPawnIndex(new Column(6))).toEqual(41);
    });
  });

  // TODO: Reduce cardinality by getting pawn y position to test only the 4 max y positions.
  // TODO : copy  the isDiagonalLeftToRightWin  and in the function delete for and test the four solution and harcoding the loop
  // TODO: GetDiagonalsCardinalities from position.
  // TODO: Core / Generic : prints (contrat d'interface ?).
  // TODO: Game loop
});
