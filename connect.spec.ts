export enum Pawn {
    RED = 1,
    YELLOW = -1,
    EMPTY = 0
}

const COLUMNS: number = 7;

const ROWS: number = 6;

class Grid {
    private pawns: Pawn[] = Array.from({length: COLUMNS * ROWS}).map(() => Pawn.EMPTY);

    full() {
        return this.pawns.reduce((acc, pawn) => acc && pawn !== Pawn.EMPTY, true);
    }

    getPawnAtPosition(column: number, row: number): Pawn {
        return this.pawns[Grid.toOneDimension(column, row)];
    }

    private static toOneDimension(column: number, row: number) {
        return column + row * COLUMNS;
    }

    private insertPawnInPawnsCollection(pawn: Pawn, index: number): void {
        if (this.pawns[index] === Pawn.EMPTY) {
            this.pawns[index] = pawn;
        } else {
            this.insertPawnInPawnsCollection(pawn, Grid.nextLine(index));
        }
    }

    private static nextLine(index: number) {
        return index + COLUMNS;
    }

    addPawn(pawn: Pawn, column: number): void {
        this.insertPawnInPawnsCollection(pawn, column)
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
        expect(grid.getPawnAtPosition(0,0)).toEqual(Pawn.RED);
    });
    it('should get Yellow at position column 0', () => {
        grid.addPawn(Pawn.YELLOW, 0);
        expect(grid.getPawnAtPosition(0,0)).toEqual(Pawn.YELLOW)
    });
    it('should get Red at position column 0 and yellow at position 7', () => {
        grid.addPawn(Pawn.RED, 0);
        grid.addPawn(Pawn.YELLOW, 0);
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED)
        expect(grid.getPawnAtPosition(0, 1)).toEqual(Pawn.YELLOW)
    });
    it('should add pawn Red,Yellow,Red: 1 at position column 1', () => {
        grid.addPawn(Pawn.RED, 1);
        grid.addPawn(Pawn.YELLOW, 1);
        grid.addPawn(Pawn.RED, 1);
        expect(grid.getPawnAtPosition(1,0)).toEqual(Pawn.RED)
        expect(grid.getPawnAtPosition(1,1)).toEqual(Pawn.YELLOW)
        expect(grid.getPawnAtPosition(1,2)).toEqual(Pawn.RED)
    });
});
