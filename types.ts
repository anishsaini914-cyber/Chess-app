export enum AppScreen {
  MENU = 'MENU',
  GAME = 'GAME',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT'
}

export enum GameMode {
  PVP = 'PVP',
  PVC = 'PVC'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HACKER = 'HACKER'
}

export type ThemeType = 'wood' | 'midnight' | 'glass' | 'neon';

export interface GameSettings {
  musicVolume: number;
  showLegalMoves: boolean;
  theme: ThemeType;
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

// Minimal definition for chess.js interaction
export interface ChessInstance {
  moves(options?: { verbose: boolean }): any[];
  move(move: string | object): any;
  fen(): string;
  isGameOver(): boolean;
  isCheckmate(): boolean;
  isDraw(): boolean;
  turn(): 'w' | 'b';
  get(square: string): { type: string; color: 'w' | 'b' } | null;
  reset(): void;
  load(fen: string): void;
  undo(): any;
  history(options?: { verbose: boolean }): any[];
  board(): any[][];
}