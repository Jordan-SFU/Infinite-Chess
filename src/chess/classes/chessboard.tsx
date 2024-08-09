import cell from "./cell.tsx";
import chesspiece from "./chesspiece.tsx";
import colors from "../enums/colors.tsx";
import info from "./constants/pieces.js";

class chessboard {
    static cells: cell[][] = Array.from({ length: 8 }, (_, i) =>
        Array.from({ length: 8 }, (_, j) => new cell(i, j))
    );

    static getCell(x: number, y: number) {
        if (x < 0 || x >= 8 || y < 0 || y >= 8) {
            return null;
        }
        return chessboard.cells[x][y];
    }

    static setPiece(piece: chesspiece | null, x: number, y: number) {
        chessboard.getCell(x, y)!.setPiece(piece);
    }

    static getPiece(x: number, y: number) {
        return chessboard.getCell(x, y)!.getPiece();
    }

    static standardSetup() {
        // White pieces
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 0, y: 0 } },
            info['rook']), 0, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 1, y: 0 } },
            info['knight']), 1, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 2, y: 0 } },
            info['bishop']), 2, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 3, y: 0 } },
            info['queen']), 3, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 4, y: 0 } },
            info['king']), 4, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 5, y: 0 } },
            info['bishop']), 5, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 6, y: 0 } },
            info['knight']), 6, 0);
        chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: 7, y: 0 } },
            info['rook']), 7, 0);

        for (let i = 0; i < 8; i++) {
            chessboard.setPiece(new chesspiece({ color: colors.WHITE, position: { x: i, y: 1 } },
                info['pawn']), i, 1);
        }

        // Black pieces
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 0, y: 7 } },
            info['rook']), 0, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 1, y: 7 } },
            info['knight']), 1, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 2, y: 7 } },
            info['bishop']), 2, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 3, y: 7 } },
            info['queen']), 3, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 4, y: 7 } },
            info['king']), 4, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 5, y: 7 } },
            info['bishop']), 5, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 6, y: 7 } },
            info['knight']), 6, 7);
        chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: 7, y: 7 } },
            info['rook']), 7, 7);

        for (let i = 0; i < 8; i++) {
            chessboard.setPiece(new chesspiece({ color: colors.BLACK, position: { x: i, y: 6 } },
                { name: "Pawn", emoji: "♟", movement: [{ x: 0, y: -1 }], attack: [{ x: 1, y: -1 }], traits: [] }), i, 6);
        }
    }
}

export default chessboard;