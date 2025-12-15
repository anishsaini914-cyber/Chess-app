import { Chess } from 'chess.js';

// Enhanced Piece Weights
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (Midgame/Endgame hybrid)
const PST = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,   0,  5,  5,  5,  5,  0, -5],
    [0,    0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

const evaluateBoard = (game: any): number => {
  let score = 0;
  const board = game.board();

  // Iterate 8x8
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let value = PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES];
        
        // Position score
        const pst = PST[piece.type as keyof typeof PST];
        const pstScore = piece.color === 'w' ? pst[r][c] : pst[7-r][c];
        
        value += pstScore;

        if (piece.color === 'w') score += value;
        else score -= value;
      }
    }
  }
  return score;
};

// Revised Minimax using Standard Minimax (White Max, Black Min)
const minimaxStandard = (game: any, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) {
      // If White turn and mated, score is -Infinity. If Black turn and mated, score is +Infinity.
      // game.turn() gives the player to move.
      return game.turn() === 'w' ? -99999 : 99999;
    }
    if (game.isDraw()) return 0;
    return evaluateBoard(game); // + for White, - for Black
  }

  const moves = game.moves();
  // Optimization: Capture moves first
  moves.sort((a: string, b: string) => (a.includes('x') ? -1 : 1));

  if (isMaximizing) { // White
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimaxStandard(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else { // Black
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimaxStandard(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getHackerMove = (fen: string, depth: number = 3): string | null => {
  const game = new Chess(fen);
  const possibleMoves = game.moves();
  if (possibleMoves.length === 0) return null;

  // Shuffle for randomness if scores are equal
  possibleMoves.sort(() => Math.random() - 0.5);

  let bestMove = null;
  const turn = game.turn();
  const isWhite = turn === 'w'; // If White, maximize. If Black, minimize.
  
  // Use Depth 3 for standard "Hacker" to ensure it returns within 4-5s on mobile.
  // Depth 4 can take 10s+ on slower devices without Web Workers.
  const SEARCH_DEPTH = depth;

  let bestVal = isWhite ? -Infinity : Infinity;

  for (const move of possibleMoves) {
    game.move(move);
    // Call minimax. Next turn is !isWhite.
    const val = minimaxStandard(game, SEARCH_DEPTH - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite) {
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
    } else {
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
  }

  return bestMove || possibleMoves[0];
};