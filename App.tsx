import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import MainMenu from './components/MainMenu';
import Settings from './components/Settings';
import About from './components/About';
import ChessBoard from './components/ChessBoard';
import GameControls from './components/GameControls';
import { AppScreen, GameMode, Difficulty, GameSettings } from './types';
import { getHackerMove } from './lib/chessEngine';

const LOFI_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3";

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PVC);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  
  // Game State
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [controlsFocused, setControlsFocused] = useState(false);
  
  const [settings, setSettings] = useState<GameSettings>({
    musicVolume: 0.5,
    showLegalMoves: true,
    theme: 'wood'
  });

  const audioRef = useRef<HTMLAudioElement>(new Audio(LOFI_URL));

  // Music
  useEffect(() => {
    audioRef.current.loop = true;
    audioRef.current.volume = settings.musicVolume;
    if (settings.musicVolume > 0) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [settings.musicVolume]);

  const startGame = (mode: GameMode, diff?: Difficulty) => {
    setGameMode(mode);
    if (diff) setDifficulty(diff);
    setGame(new Chess());
    setRedoStack([]);
    setGameResult(null);
    setIsBotTurn(false);
    setControlsFocused(false);
    setScreen(AppScreen.GAME);
  };

  // Helper to clone game with full history
  const cloneGame = (sourceGame: Chess) => {
    const newGame = new Chess();
    // Load PGN to preserve history, fallback to FEN if PGN fails or empty (start of game)
    const pgn = sourceGame.pgn();
    if (pgn) {
      newGame.loadPgn(pgn);
    } else {
      // If no history, it's a new game or just FEN. 
      // If we just use FEN, we lose history, but if PGN is empty, history is empty anyway.
      newGame.load(sourceGame.fen());
    }
    return newGame;
  };

  const safeBotMove = async () => {
    if (game.isGameOver()) return;
    
    // Fixed Delay: 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // Optimization: Check if the game state is still valid for a bot move (user didn't reset)
    // We rely on the closure 'game' variable. If the component re-rendered with a new game,
    // this closure might be stale, but in this structure, effect re-runs on game change.
    // However, we should be careful.
    
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    let move: string | null = null;
    const currentFen = game.fen();

    try {
      if (difficulty === Difficulty.EASY) {
        move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      } else if (difficulty === Difficulty.MEDIUM) {
        move = getHackerMove(currentFen, 2); 
      } else if (difficulty === Difficulty.HACKER) {
        move = getHackerMove(currentFen, 3);
      }

      if (!move) move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

      const newGame = cloneGame(game);
      newGame.move(move);
      setGame(newGame);
      setIsBotTurn(false);
    } catch (e) {
      console.error(e);
      // Fallback
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const newGame = cloneGame(game);
      newGame.move(randomMove);
      setGame(newGame);
      setIsBotTurn(false);
    }
  };

  useEffect(() => {
    // Removed unused timer variable which was causing "Cannot find namespace 'NodeJS'" error
    if (gameMode === GameMode.PVC && isBotTurn && !gameResult) {
       // We call the async function but we don't await it in useEffect
       safeBotMove();
    }
    
    if (game.isGameOver()) {
      if (game.isCheckmate()) setGameResult(game.turn() === 'w' ? "Black Wins!" : "White Wins!");
      else if (game.isDraw()) setGameResult("Draw!");
      else setGameResult("Game Over");
    } else {
      setGameResult(null);
    }
  }, [isBotTurn, game, gameMode]);

  const handleMove = (from: string, to: string) => {
    const newGame = cloneGame(game);
    try {
      const move = newGame.move({ from, to, promotion: 'q' });
      if (move) {
        setGame(newGame);
        setRedoStack([]); // Clear redo stack on new move
        if (gameMode === GameMode.PVC) setIsBotTurn(true);
      }
    } catch {}
  };

  const handleUndo = () => {
    if (isBotTurn) return;

    const newGame = cloneGame(game);
    const newRedoStack = [...redoStack];

    // PVC: Undo 2 moves (Bot then User)
    const botMove = newGame.undo();
    const userMove = newGame.undo();
    
    if (botMove && userMove) {
        newRedoStack.push(botMove.san);
        newRedoStack.push(userMove.san);
        setGame(newGame);
        setRedoStack(newRedoStack);
    } else if (botMove && !userMove) {
        // Edge case: Bot made a move but history only had 1 move? 
        // This is invalid for normal play, but if it happens, we probably shouldn't break state.
    }
  };

  const handleRedo = () => {
    if (isBotTurn || redoStack.length === 0) return;

    const newGame = cloneGame(game);
    const newRedoStack = [...redoStack];

    // PVC Redo: User then Bot
    const userMoveSan = newRedoStack.pop();
    const botMoveSan = newRedoStack.pop();
    
    if (userMoveSan && botMoveSan) {
        try {
          newGame.move(userMoveSan);
          newGame.move(botMoveSan);
          setGame(newGame);
          setRedoStack(newRedoStack);
        } catch (e) {
            setRedoStack([]);
        }
    } else {
        setRedoStack([]);
    }
  };

  // Nav Logic
  useEffect(() => {
    if (screen !== AppScreen.GAME) return;
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && !controlsFocused && !isBotTurn) {
        setControlsFocused(true);
      }
    };
    window.addEventListener('keydown', handleDown);
    return () => window.removeEventListener('keydown', handleDown);
  }, [screen, controlsFocused, isBotTurn]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Escape')) {
        setScreen(AppScreen.MENU);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen]);

  // Determine Undo/Redo availability
  // Always PvC logic now: need at least 2 moves (User + Bot) to undo effectively
  const canUndo = game.history().length >= 2;
  const canRedo = redoStack.length >= 2;

  return (
    <div className="min-h-screen bg-tv-bg text-white font-sans overflow-hidden">
      <main className="h-full w-full">
        {screen === AppScreen.MENU && (
          <MainMenu 
            onStartGame={startGame} 
            onOpenSettings={() => setScreen(AppScreen.SETTINGS)} 
            onOpenAbout={() => setScreen(AppScreen.ABOUT)}
          />
        )}

        {screen === AppScreen.SETTINGS && (
          <Settings 
            settings={settings} 
            updateSettings={setSettings} 
            onBack={() => setScreen(AppScreen.MENU)}
          />
        )}

        {screen === AppScreen.ABOUT && (
          <About onBack={() => setScreen(AppScreen.MENU)} />
        )}

        {screen === AppScreen.GAME && (
          <div className="flex flex-col h-screen w-full relative">
            {/* Background specific to theme */}
            <div className={`absolute inset-0 -z-10 ${settings.theme === 'neon' ? 'bg-black' : (settings.theme === 'wood' ? 'bg-[#2a1d15]' : 'bg-slate-900')}`} />
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 w-full max-w-4xl mx-auto z-10">
              <button onClick={() => setScreen(AppScreen.MENU)} className="text-2xl font-bold opacity-50 hover:opacity-100">✕</button>
              <div className={`text-sm md:text-xl font-bold px-4 py-1 rounded-full border ${isBotTurn ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'}`}>
                {gameResult ? gameResult : (isBotTurn ? "THINKING..." : "YOUR TURN")}
              </div>
              <div className="w-8" /> {/* Spacer */}
            </div>

            {/* Board Area */}
            <div className="flex-grow flex items-center justify-center relative">
              <div className={`transition-all duration-300 ${controlsFocused ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}`}>
                <ChessBoard 
                  game={game} 
                  onMove={handleMove} 
                  playerColor="w" 
                  isBotTurn={isBotTurn}
                  isActive={!gameResult && !controlsFocused}
                  theme={settings.theme}
                />
              </div>
            </div>

            {/* Controls Area */}
            <div className="pb-6 px-4 z-20 w-full bg-gradient-to-t from-black/80 to-transparent">
               <GameControls 
                isActive={controlsFocused && !gameResult}
                onFocusChange={setControlsFocused}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onExit={() => setScreen(AppScreen.MENU)}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>

            {/* Game Over Modal */}
            {gameResult && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
                <div className="text-center p-8 bg-white/10 rounded-2xl border border-white/20 shadow-2xl">
                  <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">{gameResult}</h2>
                  <button 
                    autoFocus
                    onClick={() => setScreen(AppScreen.MENU)}
                    className="px-8 py-4 bg-white text-black hover:bg-blue-400 hover:text-white rounded-xl text-xl font-bold transition-transform hover:scale-105"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;