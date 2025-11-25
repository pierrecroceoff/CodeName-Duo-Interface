import React from 'react';
import { CardData, CardType, GamePhase } from '../types';
import { Lock, Skull, CheckCircle, Clock } from 'lucide-react';

interface CardProps {
  card: CardData;
  phase: GamePhase;
  viewerType: CardType; // What the current player SEES (their key)
  onClick: () => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, phase, viewerType, onClick, disabled }) => {
  const isRevealed = card.revealed;
  
  // LOGIC FOR RENDERING COLORS
  // If we are in CLUE phase (Giver), we see the 'viewerType' (our Key) overlaid on the card.
  // If we are in GUESS phase (Partner), we see Dark if hidden, or the True Identity if revealed.
  
  let bgColor = "bg-slate-800";
  let textColor = "text-slate-300";
  let borderColor = "border-slate-700";
  let opacity = "opacity-100";
  let Icon = null;

  if (phase === GamePhase.CLUE || phase === GamePhase.GAME_OVER || phase === GamePhase.VICTORY) {
    // Giver Mode (or End Game): Show the Key
    if (viewerType === CardType.GREEN) {
      borderColor = "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      textColor = "text-emerald-400";
      // If revealed, dim it to show it's done
      if (isRevealed) {
        bgColor = "bg-emerald-900/30";
        opacity = "opacity-50";
        Icon = CheckCircle;
      }
    } else if (viewerType === CardType.BLACK) {
      borderColor = "border-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.2)]";
      textColor = "text-rose-500";
      if (isRevealed) {
          bgColor = "bg-rose-900/30";
          Icon = Skull; // Should never happen unless game over
      }
    } else {
      // Beige
      borderColor = "border-amber-700/50";
      textColor = "text-amber-600";
      if (isRevealed) {
        bgColor = "bg-amber-900/20";
        opacity = "opacity-40";
        Icon = Clock;
      }
    }
  } else {
    // Guess Mode: Hide unless revealed
    if (isRevealed) {
        // When revealed, we show what it truly was for the PREVIOUS Giver (the logic that triggered the reveal)
        // However, in Duo, a revealed card is publicly known. 
        // We usually show it as Green (Agent Found) or Beige (Time Lost). 
        // We can check if it was an Objective Agent.
        
        // Let's rely on the actual underlying types to decide how to render a REVEALED card in GUESS mode.
        // If it counts towards victory (Objective), show Green.
        // If it was neutral or bad-for-giver-but-picked-anyway (rare), show Beige?
        
        // Simplification for UX: 
        // If it is an "Objective Agent", it glows Green.
        // If it is a neutral/time-waster, it glows Beige.
        // If it is an assassin, it glows Red (Game Over).

        const isGreenObj = (card.p1Type === CardType.GREEN && card.p2Type === CardType.GREEN) ||
                           (card.p1Type === CardType.GREEN && card.p2Type === CardType.BEIGE) || 
                           (card.p1Type === CardType.BEIGE && card.p2Type === CardType.GREEN);
        
        const isAssassin = card.p1Type === CardType.BLACK || card.p2Type === CardType.BLACK; 
        // Note: A revealed assassin ends game, so this state is static usually.

        if (isGreenObj) {
            bgColor = "bg-emerald-500";
            textColor = "text-emerald-950 font-bold";
            borderColor = "border-emerald-400";
            Icon = CheckCircle;
        } else if (isAssassin) {
             bgColor = "bg-rose-600";
             textColor = "text-white font-bold";
             borderColor = "border-rose-500";
             Icon = Skull;
        } else {
            bgColor = "bg-amber-200";
            textColor = "text-amber-900 font-bold";
            borderColor = "border-amber-400";
            Icon = Clock;
        }

    } else {
        // HIDDEN
        bgColor = "bg-slate-800 hover:bg-slate-700";
        borderColor = "border-slate-600";
        textColor = "text-white";
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRevealed}
      className={`
        relative w-full aspect-square flex flex-col items-center justify-center p-1
        border-2 rounded-lg transition-all duration-300
        ${bgColor} ${borderColor} ${opacity}
        ${!disabled && !isRevealed ? 'cursor-pointer transform hover:-translate-y-1 hover:shadow-lg' : 'cursor-default'}
      `}
    >
      {Icon && <Icon className={`absolute top-1 right-1 w-3 h-3 ${isRevealed ? 'opacity-70' : ''}`} />}
      <span className={`text-[0.65rem] sm:text-xs md:text-sm uppercase tracking-wider break-all text-center leading-tight ${textColor}`}>
        {card.word}
      </span>
      
      {/* Decorative corners for tech feel */}
      {!isRevealed && (
          <>
            <div className="absolute top-0 left-0 w-1 h-1 bg-current opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-current opacity-50"></div>
          </>
      )}
    </button>
  );
};
