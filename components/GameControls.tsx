import React, { useEffect, useState } from 'react';

interface GameControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onExit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isActive: boolean; // Are we focusing controls?
  onFocusChange: (focused: boolean) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onUndo, onRedo, onExit, canUndo, canRedo, isActive, onFocusChange }) => {
  const [btnIndex, setBtnIndex] = useState(0); // 0: Undo, 1: Redo, 2: Exit

  useEffect(() => {
    if (!isActive) return;

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault(); 
      if (e.key === 'ArrowLeft') setBtnIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setBtnIndex(prev => Math.min(2, prev + 1));
      if (e.key === 'ArrowUp') onFocusChange(false); // Go back to board
      if (e.key === 'Enter') {
        if (btnIndex === 0 && canUndo) onUndo();
        if (btnIndex === 1 && canRedo) onRedo();
        if (btnIndex === 2) onExit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, btnIndex, canUndo, canRedo]);

  const buttons = [
    { label: "Undo", action: onUndo, disabled: !canUndo },
    { label: "Redo", action: onRedo, disabled: !canRedo }, // Placeholder if redo not fully implemented
    { label: "Exit", action: onExit, disabled: false, danger: true },
  ];

  return (
    <div className={`
      flex flex-row gap-3 w-full justify-center max-w-[600px] mx-auto mt-4
      transition-all duration-300
      ${isActive ? 'scale-105' : 'scale-100 opacity-90'}
    `}>
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={btn.action}
          disabled={btn.disabled}
          className={`
            flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-sm md:text-base
            transition-all duration-200 border-2
            ${isActive && btnIndex === idx 
              ? (btn.danger ? 'bg-red-600 border-white text-white shadow-lg' : 'bg-blue-600 border-white text-white shadow-lg')
              : (btn.danger ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700')
            }
            ${btn.disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default GameControls;