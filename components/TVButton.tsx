import React, { useEffect, useRef } from 'react';

interface TVButtonProps {
  label: string;
  subLabel?: string;
  onClick: () => void;
  isFocused: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const TVButton: React.FC<TVButtonProps> = ({ label, subLabel, onClick, isFocused, className = '', icon }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocused && btnRef.current) {
      btnRef.current.focus();
      btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isFocused]);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={`
        relative w-full py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-between group
        ${isFocused 
          ? 'bg-white text-black scale-[1.02] shadow-[0_0_25px_rgba(255,255,255,0.4)] z-10 border-2 border-transparent' 
          : 'bg-white/10 text-white border-2 border-white/5 hover:bg-white/20'
        }
        ${className}
      `}
    >
      <div className="flex flex-col items-start text-left">
        <span className={`text-lg md:text-xl font-bold uppercase tracking-wider ${isFocused ? 'text-black' : 'text-gray-100'}`}>
          {label}
        </span>
        {subLabel && (
          <span className={`text-xs md:text-sm font-medium ${isFocused ? 'text-gray-600' : 'text-gray-400'}`}>
            {subLabel}
          </span>
        )}
      </div>
      
      {icon && <span className="text-2xl">{icon}</span>}
      
      {/* Selection Indicator Dot */}
      <div className={`w-3 h-3 rounded-full transition-colors ${isFocused ? 'bg-blue-500' : 'bg-transparent'}`} />
    </button>
  );
};

export default TVButton;