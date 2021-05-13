export enum Pawn {
    RED = 1,
    YELLOW = -1,
    EMPTY = 0
}

const COLUMNS: number = 7;

let ROWS: number = 6;

class Grid {
    private pawns: Pawn[] = Array.from({length: COLUMNS * ROWS}).map(() => Pawn.EMPTY);

    full() {
        return this.pawns.reduce((acc, pawn) => acc && pawn !== Pawn.EMPTY, true);
    }

    getPawnAtPosition(column: number): Pawn {
        return this.pawns[column];
    }

    setPawnAtPosition(pawn: Pawn, column: number): void {
        if (this.pawns[column] === Pawn.EMPTY) {
            this.pawns[column] = pawn;
        } else {
            this.pawns[column + COLUMNS] = pawn;
        }
    }

    addPawn(pawn: Pawn, column: number): void {
        this.setPawnAtPosition(pawn, column);
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
        expect(grid.getPawnAtPosition(0)).toEqual(Pawn.RED);
    });
    it('should get Yellow at position column 0', () => {
        grid.addPawn(Pawn.YELLOW, 0);
        expect(grid.getPawnAtPosition(0)).toEqual(Pawn.YELLOW)
    });
    it('should get Red at position column 0 and yellow at position 7', () => {
        grid.addPawn(Pawn.RED, 0);
        grid.addPawn(Pawn.YELLOW, 0);
        expect(grid.getPawnAtPosition(0)).toEqual(Pawn.RED)
        expect(grid.getPawnAtPosition(7)).toEqual(Pawn.YELLOW)
    });
});
