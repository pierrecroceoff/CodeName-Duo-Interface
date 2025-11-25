import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, ShieldAlert } from 'lucide-react';
import { Player } from '../types';

interface TransitionProps {
  nextPlayerId: Player;
  nextPlayerName: string;
  onUnlock: () => void;
}

export const Transition: React.FC<TransitionProps> = ({ nextPlayerId, nextPlayerName, onUnlock }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartScan = () => {
    setScanning(true);
  };

  useEffect(() => {
    if (!scanning) return;

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onUnlock, 200);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [scanning, onUnlock]);

  const playerColor = nextPlayerId === 'P1' ? 'text-emerald-400' : 'text-cyan-400';
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      {/* Decorative scan lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="scan-line"></div>
      </div>

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl relative z-10 animate-fade-in-up">
        <ShieldAlert className={`w-16 h-16 mx-auto mb-6 ${playerColor} animate-pulse`} />
        
        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest font-mono">
          Accès Restreint
        </h2>
        
        <p className="text-slate-400 mb-8 text-lg">
          Veuillez remettre le terminal à l'agent :<br/>
          <span className={`text-2xl font-bold uppercase ${playerColor} block mt-2`}>{nextPlayerName}</span>
        </p>

        <div className="relative h-64 flex items-center justify-center mb-8">
          <button
            onMouseDown={handleStartScan}
            onTouchStart={handleStartScan}
            disabled={scanning}
            className={`
              relative w-32 h-32 rounded-full border-2 
              flex items-center justify-center
              transition-all duration-300
              ${scanning ? 'scale-110 border-transparent' : 'border-slate-600 hover:border-white scale-100'}
            `}
          >
             {/* Progress Ring */}
             {scanning && (
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle
                   cx="64" cy="64" r="62"
                   stroke="currentColor"
                   strokeWidth="4"
                   fill="transparent"
                   className={`${playerColor}`}
                   strokeDasharray={390}
                   strokeDashoffset={390 - (390 * progress) / 100}
                   strokeLinecap="round"
                 />
               </svg>
             )}
             
            <Fingerprint className={`w-16 h-16 ${scanning ? 'text-white' : 'text-slate-500'}`} />
          </button>
          
          {scanning && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
               <Scan className="w-48 h-48 text-white opacity-50 animate-spin-slow" />
             </div>
          )}
        </div>

        <div className="text-sm font-mono text-slate-500">
          {scanning ? `IDENTIFICATION... ${progress}%` : "MAINTENIR POUR SCANNER"}
        </div>
      </div>
    </div>
  );
};