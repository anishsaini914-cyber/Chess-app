import React, { useEffect } from 'react';
import TVButton from './TVButton';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Escape', 'Backspace'].includes(e.key)) {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-black text-white relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
      
      <div className="z-10 max-w-3xl w-full text-center p-8 md:p-12 border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          About Zenith
        </h1>
        
        <div className="space-y-6 text-base md:text-xl text-gray-300 font-sans leading-relaxed">
          <p>
            Zenith Chess is a next-generation chess platform designed to bridge the gap between
            mobile touchscreens and large-format TV displays.
          </p>
          <p>
            Featuring "God Mode" powered by Gemini AI and a robust offline engine.
          </p>
          
          <div className="py-8 my-8 border-y border-white/10">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Designed & Developed By</p>
            <p className="text-3xl md:text-5xl font-bold text-white">
              Anish Saini
            </p>
          </div>

          <div className="mt-8">
            <TVButton 
              label="Back to Menu" 
              onClick={onBack} 
              isFocused={true}
              className="mx-auto max-w-xs justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;