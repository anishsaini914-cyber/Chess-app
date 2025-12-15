import React, { useEffect, useState } from 'react';
import TVButton from './TVButton';
import { GameSettings, ThemeType } from '../types';

interface SettingsProps {
  settings: GameSettings;
  updateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onBack }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const toggleMusic = () => {
    updateSettings({ ...settings, musicVolume: settings.musicVolume > 0 ? 0 : 0.5 });
  };

  const cycleTheme = () => {
    const themes: ThemeType[] = ['wood', 'midnight', 'glass', 'neon'];
    const currentIdx = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    updateSettings({ ...settings, theme: nextTheme });
  };

  const items = [
    { 
      label: "Music", 
      sub: settings.musicVolume > 0 ? 'ON' : 'OFF', 
      action: toggleMusic 
    },
    { 
      label: "Board Theme", 
      sub: settings.theme.toUpperCase(), 
      action: cycleTheme 
    },
    { 
      label: "Back to Menu", 
      sub: "",
      action: onBack 
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') setFocusedIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowDown') setFocusedIndex(prev => Math.min(items.length - 1, prev + 1));
      if (e.key === 'Enter') items[focusedIndex].action();
      if (e.key === 'Backspace' || e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, settings]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-950 p-6">
      <h2 className="text-4xl font-serif text-white mb-8">Configuration</h2>
      <div className="w-full max-w-lg space-y-4">
        {items.map((item, index) => (
          <TVButton
            key={index}
            label={item.label}
            subLabel={item.sub}
            onClick={item.action}
            isFocused={index === focusedIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default Settings;