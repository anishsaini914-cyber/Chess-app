import React, { useState, useEffect, useRef } from 'react';
import { ChessInstance, ThemeType } from '../types';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  game: ChessInstance;
  onMove: (from: string, to: string) => void;
  playerColor: 'w' | 'b';
  isBotTurn: boolean;
  isActive: boolean;
  theme: ThemeType;
}

const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const THEMES = {
  wood: {
    light: 'bg-[#ebd0a2]',
    dark: 'bg-[#9b683a]',
    highlight: 'bg-[#7ba944]',
    boardBorder: 'border-[#5c3a21]',
    pieceWhite: 'drop-shadow-[0_2px_1px_rgba(0,0,0,0.4)] text-[#fdf6e3] stroke-black',
    pieceBlack: 'drop-shadow-[0_2px_1px_rgba(255,255,255,0.2)] text-[#2d1b0e]'
  },
  midnight: {
    light: 'bg-slate-400',
    dark: 'bg-slate-700',
    highlight: 'bg-blue-500',
    boardBorder: 'border-slate-800',
    pieceWhite: 'text-white drop-shadow-md',
    pieceBlack: 'text-black drop-shadow-md'
  },
  glass: {
    light: 'bg-white/20 backdrop-blur-md',
    dark: 'bg-black/40 backdrop-blur-md',
    highlight: 'bg-white/40',
    boardBorder: 'border-white/10',
    pieceWhite: 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]',
    pieceBlack: 'text-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'
  },
  neon: {
    light: 'bg-[#1a1a1a]',
    dark: 'bg-[#0f0f0f]',
    highlight: 'bg-[#00ff9d] shadow-[0_0_15px_#00ff9d]',
    boardBorder: 'border-[#00ff9d] shadow-[0_0_20px_#00ff9d]',
    pieceWhite: 'text-[#00ff9d] drop-shadow-[0_0_5px_#00ff9d]',
    pieceBlack: 'text-[#ff00ff] drop-shadow-[0_0_5px_#ff00ff]'
  }
};

const ChessBoard: React.FC<ChessBoardProps> = ({ game, onMove, playerColor, isBotTurn, isActive, theme }) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ r: 6, c: 4 }); 
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  
  // Animation State
  const [displayGame, setDisplayGame] = useState<ChessInstance | null>(null);
  const [animatingPiece, setAnimatingPiece] = useState<{
    type: string, color: 'w'|'b', from: string, to: string, startRect: DOMRect, endRect: DOMRect
  } | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const squaresRef = useRef<{[key: string]: HTMLDivElement | null}>({});

  const currentTheme = THEMES[theme];

  // Initialize display game
  useEffect(() => {
    if (!displayGame && game) {
      setDisplayGame(new Chess(game.fen()));
    }
  }, [game]);

  // Sync props.game with displayGame via Animation
  useEffect(() => {
    if (!displayGame) return;
    if (game.fen() === displayGame.fen()) return;

    // Detect move
    const history = game.history({ verbose: true });
    const lastMove = history[history.length - 1];
    
    if (!lastMove) {
      setDisplayGame(new Chess(game.fen()));
      return;
    }

    // Capture coordinates before updating display
    const fromEl = squaresRef.current[lastMove.from];
    const toEl = squaresRef.current[lastMove.to];

    if (fromEl && toEl) {
      const startRect = fromEl.getBoundingClientRect();
      const endRect = toEl.getBoundingClientRect();
      const piece = { type: lastMove.piece, color: lastMove.color as 'w'|'b' };

      setAnimatingPiece({
        type: piece.type,
        color: piece.color,
        from: lastMove.from,
        to: lastMove.to,
        startRect,
        endRect
      });

      // After animation duration, snap to new state
      setTimeout(() => {
        setAnimatingPiece(null);
        setDisplayGame(new Chess(game.fen()));
      }, 400); // 400ms duration
    } else {
       setDisplayGame(new Chess(game.fen()));
    }

  }, [game]);

  // Handle D-Pad
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      if (isBotTurn || animatingPiece) return;

      switch (e.key) {
        case 'ArrowUp': setCursor(prev => ({ ...prev, r: Math.max(0, prev.r - 1) })); break;
        case 'ArrowDown': setCursor(prev => ({ ...prev, r: Math.min(7, prev.r + 1) })); break;
        case 'ArrowLeft': setCursor(prev => ({ ...prev, c: Math.max(0, prev.c - 1) })); break;
        case 'ArrowRight': setCursor(prev => ({ ...prev, c: Math.min(7, prev.c + 1) })); break;
        case 'Enter': handleSquareClick(ROWS[cursor.r] + COLS[cursor.c]); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, cursor, selectedSquare, isBotTurn, displayGame, animatingPiece]);

  const handleSquareClick = (square: string) => {
    if (isBotTurn || animatingPiece || !displayGame) return;

    if (selectedSquare && possibleMoves.includes(square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
    } else {
      const piece = displayGame.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = displayGame.moves({ verbose: true }) as any[];
        setPossibleMoves(moves.filter(m => m.from === square).map(m => m.to));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const getPieceIcon = (type: string) => {
    const icons: Record<string, string> = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' };
    return icons[type] || '';
  };

  const renderSquare = (rIdx: number, cIdx: number) => {
    if (!displayGame) return null;
    const col = COLS[cIdx];
    const row = ROWS[rIdx];
    const square = col + row;
    
    // Logic:
    // If animating, 'displayGame' is the OLD state.
    // So 'square' == 'from' has the piece. We MUST hide it so the ghost can be seen moving.
    // 'square' == 'to' is empty (or has capture). We do NOT hide it (captured piece stays until ghost lands).
    
    const isAnimatingFrom = animatingPiece?.from === square;
    
    const piece = displayGame.get(square);
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    const isCursor = isActive && cursor.r === rIdx && cursor.c === cIdx;
    const isLight = (rIdx + cIdx) % 2 === 0;

    let bgClass = isLight ? currentTheme.light : currentTheme.dark;
    if (isSelected) bgClass = currentTheme.highlight;

    return (
      <div
        key={square}
        ref={el => { squaresRef.current[square] = el; }}
        onClick={() => handleSquareClick(square)}
        className={`
          relative flex items-center justify-center cursor-pointer
          ${bgClass}
          ${isCursor ? 'ring-inset ring-4 ring-yellow-400 z-10' : ''}
        `}
      >
         {(cIdx === 0 && rIdx === 7) && <span className="absolute bottom-0.5 left-0.5 text-[0.6rem] font-bold opacity-50">{col}{row}</span>}
         
         {isPossibleMove && !piece && <div className="absolute w-1/3 h-1/3 bg-black/20 rounded-full" />}
         {isPossibleMove && piece && <div className="absolute inset-0 border-4 border-red-500/60 rounded-full animate-pulse" />}

         {piece && !isAnimatingFrom && (
           <span 
             className={`
               text-[9vmin] leading-none select-none
               ${piece.color === 'w' ? currentTheme.pieceWhite : currentTheme.pieceBlack}
               ${isSelected ? 'scale-110 -translate-y-1' : ''}
               transition-transform duration-200
             `}
           >
             {getPieceIcon(piece.type)}
           </span>
         )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2">
      <div 
        ref={boardRef}
        className={`
          relative grid grid-rows-8 w-[95vmin] h-[95vmin] md:w-[85vmin] md:h-[85vmin]
          border-[8px] rounded-lg shadow-2xl overflow-hidden
          ${currentTheme.boardBorder}
        `}
      >
        {ROWS.map((row, rIdx) => (
          <div key={row} className="grid grid-cols-8">
            {COLS.map((col, cIdx) => renderSquare(rIdx, cIdx))}
          </div>
        ))}

        {animatingPiece && boardRef.current && (
           <div 
             className="absolute pointer-events-none z-50"
             style={{
               top: 0, left: 0,
             }}
           >
              <AnimationWrapper 
                pieceIcon={getPieceIcon(animatingPiece.type)} 
                themeClass={animatingPiece.color === 'w' ? currentTheme.pieceWhite : currentTheme.pieceBlack}
                deltaX={animatingPiece.endRect.left - animatingPiece.startRect.left}
                deltaY={animatingPiece.endRect.top - animatingPiece.startRect.top}
                startLeft={animatingPiece.startRect.left - boardRef.current.getBoundingClientRect().left}
                startTop={animatingPiece.startRect.top - boardRef.current.getBoundingClientRect().top}
              />
           </div>
        )}
      </div>
    </div>
  );
};

const AnimationWrapper = ({ pieceIcon, themeClass, deltaX, deltaY, startLeft, startTop }: any) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    left: startLeft,
    top: startTop,
    transform: 'translate(0px, 0px)',
    fontSize: '9vmin',
    lineHeight: 1,
    zIndex: 100
  });

  useEffect(() => {
    // 2-frame delay to ensure browser paints initial position before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStyle(prev => ({
          ...prev,
          transform: `translate(${deltaX}px, ${deltaY}px)`,
          transition: 'transform 400ms cubic-bezier(0.25, 1, 0.5, 1)'
        }));
      });
    });
  }, [deltaX, deltaY]);

  return (
    <span className={`${themeClass} block`} style={style}>
      {pieceIcon}
    </span>
  );
};

export default ChessBoard;