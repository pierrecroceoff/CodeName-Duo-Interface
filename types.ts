export enum CardType {
  GREEN = 'GREEN',    // Agent
  BEIGE = 'BEIGE',    // Innocent/Time Waster
  BLACK = 'BLACK'     // Assassin
}

export interface CardData {
  id: number;
  word: string;
  p1Type: CardType;
  p2Type: CardType;
  revealed: boolean;
}

export type Player = 'P1' | 'P2';

export enum GamePhase {
  MENU = 'MENU',
  TRANSITION = 'TRANSITION', // The "Curtain" between turns
  CLUE = 'CLUE',             // Active player gives clue
  GUESS = 'GUESS',           // Partner guesses
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Clue {
  word: string;
  count: number;
}

// Network Game State Container
export interface GameState {
  cards: CardData[];
  phase: GamePhase;
  turnPlayer: Player;
  tokens: number;
  currentClue: Clue | null;
  p1Name: string;
  p2Name: string;
  shakeTrigger: number; // Increment to trigger shake on clients
  lastAction: string;   // Description of last action for logs/debug
}
