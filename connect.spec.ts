export enum Pawn {
    RED = 1,
    YELLOW = -1,
    EMPTY = 0
}

class Grid {
    private line: Pawn[] = Array.from({length:7}).map(()=>Pawn.EMPTY);

    full() {
        return this.line.reduce((acc,pawn)=>acc && pawn!==Pawn.EMPTY,true);
    }

    getPawnAtPosition(column: number, line: number) {
        return this.line[column];
    }

    addPawn(pawn: Pawn, column: number) {
        this.line[column] = pawn;
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
    it('should get  Red pawn at position column 0, line 0 ', () => {
        grid.addPawn(Pawn.RED, 0);
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED);
    });
    it('should get Yellow at position column 0, line 0', () => {
        grid.addPawn(Pawn.YELLOW, 0);
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.YELLOW)
    });

});
