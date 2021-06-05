export enum Pawn {
    RED = 1,
    YELLOW = -1,
    EMPTY = 0
}

const COLUMNS: number = 7;

const ROWS: number = 6;

const BOARD_DIMENSION: number = COLUMNS * ROWS;

class Column {
    constructor(public readonly index: number) {
        if (index < 0 || index > 6) {
            throw new IllegalColumnIndexError();
        }
    }
}

class IllegalColumnIndexError {}

class Grid {
    private pawns: Pawn[] = Array.from({length: BOARD_DIMENSION}).map(() => Pawn.EMPTY);

    private static toOneDimension(column: number, row: number) {
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

    addPawn(pawn: Pawn, column: number): void {
        this.insertPawnInPawnsCollection(pawn, column)
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
}

describe('test connect 4', () => {
    let grid: Grid;
    beforeEach(() => {
        grid = new Grid();
    });
    it('should have an empty grid', () => {
        expect(grid.full()).toEqual(false);
    });
    it('should get Red pawn at position column 0 ', () => {
        grid.addPawn(Pawn.RED, 0);
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED);
    });
    it('should get Yellow at position column 0', () => {
        grid.addPawn(Pawn.YELLOW, 0);
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.YELLOW)
    });
    it('should get Red at position column 0 and yellow at position 7', () => {
        grid.addPawn(Pawn.RED, 0);
        grid.addPawn(Pawn.YELLOW, 0);
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
        try {
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.YELLOW, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.YELLOW, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
        } catch (e) {
            expect(e).toBeInstanceOf(RangeError);
        }

    });
    it('should not add pawn in column 7 ', () => {
        expect(() => grid.addPawn(Pawn.RED, new Column(7))).toThrow(IllegalColumnIndexError);
    });
    it('should not add pawn in column -1 ', () => {
        expect(() => grid.addPawn(Pawn.RED, new Column(-1))).toThrow(IllegalColumnIndexError);
    });
    // TODO: fills the columns and manage edge cases!
    // TODO: Test victory conditions
    // TODO: Core / Generic : prints (contrat d'interface ?).
});
