import React, { useEffect, useState } from 'react';
import TVButton from './TVButton';
import { GameMode, Difficulty } from '../types';

interface MainMenuProps {
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenSettings, onOpenAbout }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const menuItems = [
    { label: "VS EASY", sub: "Warmup", action: () => onStartGame(GameMode.PVC, Difficulty.EASY) },
    { label: "VS MEDIUM", sub: "Casual", action: () => onStartGame(GameMode.PVC, Difficulty.MEDIUM) },
    { label: "VS HACKER", sub: "EXTREME AI", action: () => onStartGame(GameMode.PVC, Difficulty.HACKER) },
    { label: "SETTINGS", sub: "Theme & Audio", action: onOpenSettings },
    { label: "ABOUT", sub: "Credits", action: onOpenAbout }
  ];

  // Grid Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Determine columns based on window width approximation or just assume 2 for TV
      const isMobile = window.innerWidth < 768;
      const cols = isMobile ? 1 : 2;

      switch (e.key) {
        case 'ArrowUp':
          if (focusedIndex >= cols) setFocusedIndex(prev => prev - cols);
          break;
        case 'ArrowDown':
          if (focusedIndex + cols < menuItems.length) setFocusedIndex(prev => prev + cols);
          break;
        case 'ArrowLeft':
          if (focusedIndex % cols !== 0) setFocusedIndex(prev => prev - 1);
          break;
        case 'ArrowRight':
          if (focusedIndex % cols !== cols - 1 && focusedIndex + 1 < menuItems.length) setFocusedIndex(prev => prev + 1);
          break;
        case 'Enter':
          menuItems[focusedIndex].action();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 relative overflow-hidden bg-tv-bg">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 to-black -z-10" />
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-fast" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="z-10 text-center mb-8 md:mb-12">
        <h1 className="text-5xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
          ZENITH
        </h1>
        <div className="text-sm md:text-xl text-blue-400 tracking-[0.4em] font-light uppercase mt-2">
          Chess Reimagined
        </div>
      </div>

      <div className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 px-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
        {menuItems.map((item, index) => (
          <TVButton
            key={index}
            label={item.label}
            subLabel={item.sub}
            onClick={item.action}
            isFocused={index === focusedIndex}
          />
        ))}
      </div>

      <div className="hidden md:flex mt-8 text-gray-500 text-xs font-mono gap-4">
        <span>[ARROWS] NAVIGATE</span>
        <span>[ENTER] SELECT</span>
      </div>
    </div>
  );
};

export default MainMenu;