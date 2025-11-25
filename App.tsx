import React, { useState, useEffect, useCallback } from 'react';
import { generateGame, getCardTypeForPlayer, isObjectiveAgent } from './utils';
import { GamePhase, Player, CardData, Clue, CardType, GameState } from './types';
import { MAX_TOKENS, TARGET_AGENTS } from './constants';
import { Transition } from './components/Transition';
import { Card } from './components/Card';
import { Network } from './network';
import { Target, Clock, Send, Play, RotateCcw, ShieldCheck, CheckCircle, Skull, BookOpen, X, Users, User, AlertTriangle, ShieldAlert, Globe, Wifi } from 'lucide-react';

// --- RULES COMPONENT ---
const RulesModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
    <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
       {/* Header */}
       <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
         <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <BookOpen className="w-5 h-5 text-emerald-500" />
           PROTOCOLE DE MISSION (RÈGLES)
         </h2>
         <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
           <X className="w-6 h-6" />
         </button>
       </div>

       {/* Content */}
       <div className="p-6 overflow-y-auto space-y-8 text-slate-300 custom-scrollbar text-sm sm:text-base">

         {/* Section 1: Concept */}
         <section className="space-y-3">
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> 1. Le Concept (Coopération)
            </h3>
            <p>
                Vous êtes deux espions en mission. Vous devez identifier <strong className="text-white">15 Agents</strong> dissimulés parmi 25 noms de code.
            </p>
            <div className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-cyan-500">
                <p className="italic text-slate-400 text-sm">
                    <strong className="text-cyan-400">IMPORTANT : VISION ASYMÉTRIQUE</strong><br/>
                    Chaque joueur possède une "Clé" différente !<br/>
                    Un mot peut être un <strong>AGENT (Vert)</strong> pour vous, mais un <strong>ASSASSIN (Noir)</strong> pour votre partenaire.<br/>
                    Vous devez vous faire confiance aveuglément.
                </p>
            </div>
         </section>

         {/* Section 2: Loop */}
         <section className="space-y-3">
             <h3 className="text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                 <Play className="w-4 h-4" /> 2. Déroulement d'un Tour
             </h3>
             <div className="space-y-4">
                 <div>
                     <h4 className="font-bold text-white mb-1">PHASE 1 : L'ESPION (Celui qui sait)</h4>
                     <p>Il consulte sa clé secrète et donne un indice pour faire deviner ses cartes Vertes.</p>
                     <ul className="list-disc list-inside ml-2 text-slate-400 mt-1">
                         <li><strong>1 Mot unique</strong> (Lié au sens des cartes).</li>
                         <li><strong>1 Chiffre</strong> (Le nombre de cartes visées).</li>
                     </ul>
                 </div>
                 <div>
                     <h4 className="font-bold text-white mb-1">PHASE 2 : L'AGENT (Celui qui cherche)</h4>
                     <p>Il pointe les cartes une par une.</p>
                     <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">VERT (Agent) :</span>
                            <span>Correct ! Il peut continuer à deviner ou s'arrêter.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">BEIGE (Témoin) :</span>
                            <span>Erreur. Le tour s'arrête immédiatement. Vous perdez du temps.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">NOIR (Assassin) :</span>
                            <span>ÉCHEC CRITIQUE. La mission échoue immédiatement.</span>
                        </li>
                     </ul>
                 </div>
             </div>
         </section>

         {/* Section 3: Time */}
         <section className="space-y-3">
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 3. Gestion du Temps
            </h3>
            <p>
                Vous disposez de <strong className="text-amber-400">9 Jetons Temps</strong> pour toute la partie.
            </p>
            <ul className="list-disc list-inside text-slate-400">
                <li>Chaque fin de tour complet consomme 1 Jeton.</li>
                <li>Toucher un innocent (Beige) consomme 1 Jeton (pénalité).</li>
                <li>Si le compteur atteint 0, la mission est avortée.</li>
            </ul>
         </section>

         {/* Section 4: Communication */}
         <section className="space-y-3">
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> 4. Règles de Communication
            </h3>
            <p className="text-sm">
                Pour garder le défi intact :
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <li className="bg-rose-900/10 border border-rose-900/30 p-2 rounded text-rose-300">
                    INTERDIT de dire le mot qui est écrit sur la carte (ni sa traduction).
                </li>
                <li className="bg-rose-900/10 border border-rose-900/30 p-2 rounded text-rose-300">
                    INTERDIT de faire des bruits ou des grimaces quand l'autre réfléchit.
                </li>
            </ul>
         </section>

       </div>

       <div className="p-4 border-t border-slate-700 bg-slate-800/50">
         <button onClick={onClose} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg shadow-emerald-900/20 transition-all">
           ACCEPTER LA MISSION
         </button>
       </div>
    </div>
  </div>
);

// --- RESTART CONFIRM COMPONENT ---
const RestartModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-sm w-full bg-slate-900 border border-rose-900/50 rounded-xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Abandonner la mission ?</h3>
            <p className="text-slate-400 text-sm mb-6">Toute progression sera perdue. Êtes-vous sûr de vouloir recommencer ?</p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors">
                    ANNULER
                </button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold shadow-lg shadow-rose-900/20 transition-colors">
                    CONFIRMER
                </button>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  // --- STATE ---
  const [cards, setCards] = useState<CardData[]>([]);
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [turnPlayer, setTurnPlayer] = useState<Player>('P1'); // The "Active" player (Clue Giver)
  const [tokens, setTokens] = useState(MAX_TOKENS);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  
  // Modals
  const [showRules, setShowRules] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  
  // Settings & Network
  const [p1Name, setP1Name] = useState("Alpha");
  const [p2Name, setP2Name] = useState("Bravo");
  const [gameMode, setGameMode] = useState<'LOCAL' | 'ONLINE' | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [myPlayerId, setMyPlayerId] = useState<Player>('P1'); // Only used in Online mode
  const [joinCode, setJoinCode] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [playersConnected, setPlayersConnected] = useState({ P1: false, P2: false });

  // Inputs
  const [inputWord, setInputWord] = useState('');
  const [inputCount, setInputCount] = useState<number | string>('');

  // FX
  const [shake, setShake] = useState(false);
  // Used to trigger shake via network
  const [shakeTrigger, setShakeTrigger] = useState(0); 

  // --- INITIALIZATION ---
  const initLocalGame = () => {
    if (!p1Name.trim()) setP1Name("Alpha");
    if (!p2Name.trim()) setP2Name("Bravo");
    setGameMode('LOCAL');
    setCards(generateGame());
    setTokens(MAX_TOKENS);
    setPhase(GamePhase.TRANSITION);
    setTurnPlayer('P1');
    setCurrentClue(null);
    setInputWord('');
    setInputCount('');
    setShowRestartConfirm(false);
  };

  const initOnlineHost = async () => {
    if (!p1Name.trim()) setP1Name("Host");
    try {
      setNetworkError("");
      const initialState: GameState = {
        cards: generateGame(),
        phase: GamePhase.CLUE, // Online skips transition, starts P1 Clue
        turnPlayer: 'P1',
        tokens: MAX_TOKENS,
        currentClue: null,
        p1Name: p1Name,
        p2Name: "...",
        shakeTrigger: 0,
        lastAction: "Game Created"
      };

      const code = await Network.createRoom(p1Name, initialState);
      setRoomId(code);
      setMyPlayerId('P1');
      setGameMode('ONLINE');
      setPhase(GamePhase.MENU); // Wait in lobby actually
      // Subscribe immediately
      subscribeToRoom(code);
    } catch (e) {
      console.error(e);
      setNetworkError("Erreur création salon (Stockage local bloqué ?)");
    }
  };

  const joinOnlineGame = async () => {
    if (!p2Name.trim()) setP2Name("Joiner");
    if (joinCode.length !== 4) return;
    try {
      setNetworkError("");
      const result = await Network.joinRoom(joinCode.toUpperCase(), p2Name);
      if (result.success) {
        setRoomId(joinCode.toUpperCase());
        setMyPlayerId('P2');
        setGameMode('ONLINE');
        subscribeToRoom(joinCode.toUpperCase());
      } else {
        setNetworkError(result.error || "Erreur inconnue");
      }
    } catch (e) {
      setNetworkError("Erreur connexion");
    }
  };

  const subscribeToRoom = useCallback((code: string) => {
    Network.subscribeToGame(code, (serverState, players) => {
      // Sync local state with server state
      setCards(serverState.cards);
      setPhase(serverState.phase);
      setTurnPlayer(serverState.turnPlayer);
      setTokens(serverState.tokens);
      setCurrentClue(serverState.currentClue);
      setP1Name(serverState.p1Name);
      setP2Name(serverState.p2Name);
      setShakeTrigger(prev => {
        if (serverState.shakeTrigger > prev) {
            triggerShake();
            return serverState.shakeTrigger;
        }
        return prev;
      });

      if (players) {
        setPlayersConnected({
            P1: players.P1?.connected || false,
            P2: players.P2?.connected || false
        });
      }
    });
  }, []);

  // --- ACTIONS ---

  // Helper to push state
  const pushState = (updates: Partial<GameState>) => {
    if (gameMode === 'ONLINE' && roomId) {
        Network.updateGameState(roomId, updates);
    } else {
        // Local update (usually handled by the setters directly in logic, but valid for refactoring)
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleRestartConfirm = () => {
      if (gameMode === 'ONLINE') {
        // In online, maybe reset the board?
        const newCards = generateGame();
        pushState({
            cards: newCards,
            phase: GamePhase.CLUE,
            turnPlayer: 'P1',
            tokens: MAX_TOKENS,
            currentClue: null,
            shakeTrigger: shakeTrigger + 1
        });
        setShowRestartConfirm(false);
      } else {
        setPhase(GamePhase.MENU);
        setGameMode(null);
        setShowRestartConfirm(false);
      }
  };

  const handleTransitionUnlock = () => {
    // Only used in LOCAL mode
    if (currentClue === null) {
        setPhase(GamePhase.CLUE);
    } else {
        setPhase(GamePhase.GUESS);
    }
  };

  const handleGiveClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord || !inputCount) return;

    const newClue = {
      word: inputWord.trim().toUpperCase(),
      count: Number(inputCount)
    };

    if (gameMode === 'LOCAL') {
        setCurrentClue(newClue);
        setPhase(GamePhase.TRANSITION);
    } else {
        // Online: Immediate update, no curtain
        pushState({
            currentClue: newClue,
            phase: GamePhase.GUESS
        });
        setInputWord('');
        setInputCount('');
    }
  };

  const handleCardClick = (cardId: number) => {
    // Can only click if it's GUESS phase
    if (phase !== GamePhase.GUESS) return;

    // ONLINE: Can only click if it is MY turn to guess
    // If I am P1, I guess when turnPlayer is P2 (P2 gave clue, P1 guesses)
    // Actually Logic: turnPlayer is the Clue Giver.
    // If turnPlayer is P1, then P2 is guessing.
    if (gameMode === 'ONLINE') {
        const isMyGuessingTurn = (turnPlayer === 'P1' && myPlayerId === 'P2') || (turnPlayer === 'P2' && myPlayerId === 'P1');
        if (!isMyGuessingTurn) return;
    }

    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.revealed) return;

    // Resolve based on GIVER (turnPlayer)
    const giver = turnPlayer;
    const typeForGiver = getCardTypeForPlayer(clickedCard, giver);

    // Reveal locally first for optimistic UI? No, strict sync for safety.
    // But for local game:
    let newCards = cards.map(c => c.id === cardId ? { ...c, revealed: true } : c);
    let newPhase: GamePhase = phase;
    let newTokens = tokens;
    let nextShake = shakeTrigger;
    let triggerEndTurn = false;

    // LOGIC
    if (typeForGiver === CardType.GREEN) {
        // Correct
        const agentsFound = newCards.filter(c => c.revealed && isObjectiveAgent(c)).length;
        if (agentsFound >= TARGET_AGENTS) {
            newPhase = GamePhase.VICTORY;
        }
    } else if (typeForGiver === CardType.BEIGE) {
        // Innocent
        nextShake += 1;
        if (gameMode === 'LOCAL') triggerShake();
        newTokens -= 1;
        triggerEndTurn = true;
    } else if (typeForGiver === CardType.BLACK) {
        // Assassin
        nextShake += 1;
        if (gameMode === 'LOCAL') triggerShake();
        newPhase = GamePhase.GAME_OVER;
    }

    if (gameMode === 'LOCAL') {
        setCards(newCards);
        if (newPhase !== phase) setPhase(newPhase);
        if (newTokens !== tokens) setTokens(newTokens);
        if (triggerEndTurn) handleEndTurn(newCards, newTokens);
    } else {
        // Send to network
        // If trigger end turn, we need to calculate next state completely
        if (triggerEndTurn) {
            // Check tokens for Game Over
            let finalPhase = newPhase;
            let finalTokens = newTokens;
            
            // End Turn Logic for Online
            // Check round penalty
             if (turnPlayer === 'P2') {
                finalTokens -= 1;
                if (finalTokens < 0) finalPhase = GamePhase.GAME_OVER;
            }

            if (finalTokens < 0 && finalPhase !== GamePhase.GAME_OVER) finalPhase = GamePhase.GAME_OVER;

            const nextGiver: Player = turnPlayer === 'P1' ? 'P2' : 'P1';
            
            pushState({
                cards: newCards,
                phase: finalPhase === GamePhase.GUESS ? GamePhase.CLUE : finalPhase, // Back to Clue if just turn end
                tokens: finalTokens,
                turnPlayer: finalPhase === GamePhase.GUESS ? nextGiver : turnPlayer,
                currentClue: null,
                shakeTrigger: nextShake
            });
        } else {
            pushState({
                cards: newCards,
                phase: newPhase,
                tokens: newTokens,
                shakeTrigger: nextShake
            });
        }
    }
  };

  const handleEndTurnButton = () => {
      if (gameMode === 'LOCAL') {
          handleEndTurn(cards, tokens);
      } else {
          // Online Manual End Turn
           // Only Guesser can end turn
           const isMyGuessingTurn = (turnPlayer === 'P1' && myPlayerId === 'P2') || (turnPlayer === 'P2' && myPlayerId === 'P1');
           if (!isMyGuessingTurn) return;

           let newTokens = tokens;
           let nextPhase = GamePhase.CLUE; // Default next is Clue
           let nextGiver: Player = turnPlayer === 'P1' ? 'P2' : 'P1';
           
           if (turnPlayer === 'P2') {
               newTokens -= 1;
           }
           
           if (newTokens < 0) nextPhase = GamePhase.GAME_OVER;

           pushState({
               phase: nextPhase,
               tokens: newTokens,
               turnPlayer: nextGiver,
               currentClue: null
           });
      }
  };

  const handleEndTurn = (currentCards = cards, currentTokens = tokens) => {
    // Local Logic
    let newTokens = currentTokens;
    if (turnPlayer === 'P2') {
        newTokens -= 1;
        setTokens(newTokens);
    }

    if (newTokens < 0) {
         setPhase(GamePhase.GAME_OVER);
         return;
    }

    const nextGiver: Player = turnPlayer === 'P1' ? 'P2' : 'P1';
    setTurnPlayer(nextGiver);
    setCurrentClue(null);
    setInputWord('');
    setInputCount('');
    setPhase(GamePhase.TRANSITION);
  };

  // --- RENDER HELPERS ---

  const agentsFoundCount = cards.filter(c => c.revealed && isObjectiveAgent(c)).length;
  
  // Who is the current PHYSICAL user?
  // Local: Depends on turn
  // Online: Depends on myPlayerId
  const getMyViewType = (): CardType | null => {
      if (gameMode === 'LOCAL') {
          return null; // Calculated in render based on turn
      }
      // Online: I always see MY Key.
      // If I am P1, I see cards as P1.
      return myPlayerId === 'P1' ? CardType.GREEN : CardType.GREEN; // Use logic in component?
      // Wait, in component:
      // If viewerType is GREEN (P1 key), it shows P1 colors.
      // Check Card component logic.
  };

  if (phase === GamePhase.MENU) {
    // Check if we are in Online Lobby
    if (gameMode === 'ONLINE' && roomId) {
         return (
             <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6 animate-fade-in-up border-emerald-500/30">
                    <Wifi className="w-16 h-16 mx-auto text-emerald-500 animate-pulse" />
                    <div>
                        <h2 className="text-slate-400 uppercase tracking-widest text-sm">Fréquence Sécurisée</h2>
                        <div className="text-5xl font-mono font-bold text-white mt-2 tracking-widest select-all">{roomId}</div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-800">
                            <span className="text-emerald-400 font-bold">AGENT 1 (Hôte)</span>
                            <span className="text-white">{p1Name}</span>
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-800">
                            <span className="text-cyan-400 font-bold">AGENT 2</span>
                            <span className="text-white">{p2Name !== "..." ? p2Name : "En attente..."}</span>
                            <div className={`w-3 h-3 rounded-full ${playersConnected.P2 ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-700 animate-pulse'}`}></div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 animate-pulse">
                        EN ATTENTE DE SYNCHRONISATION...
                    </p>
                    {/* The game auto-starts when P2 joins? Or Phase changes?
                        In initOnlineHost, we set Phase to MENU but stored CLUE in DB.
                        The subscription will update Phase to CLUE when ready?
                        Actually, let's keep it simple: Host waits. P2 joins. 
                        When P2 joins, DB updates. Host sees P2 connected.
                        Ideally, Host clicks "START". But prompt asked for fluid.
                        If P2 joins, we can start.
                    */}
                    {myPlayerId === 'P1' && playersConnected.P2 && (
                         <button 
                            onClick={() => pushState({ phase: GamePhase.CLUE })}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg animate-bounce"
                         >
                            LANCER LA MISSION
                         </button>
                    )}
                </div>
             </div>
         )
    }

    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
        
        <div className="z-10 w-full max-w-md space-y-6 animate-fade-in-up flex flex-col items-center">
           {/* Logo Section */}
           <div className="text-center">
             <div className="relative inline-block mb-4">
               <div className="absolute -inset-6 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
               <ShieldCheck className="w-20 h-20 text-emerald-500 mx-auto relative z-10" />
             </div>
             <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter neon-text-green mb-1">
               CO-OP<br/>SPIES
             </h1>
             <p className="text-emerald-400/80 tracking-[0.2em] text-sm font-mono">PROTOCOLE: DUO // SYNCHRONISÉ</p>
           </div>

           {/* Mode Selection Tabs */}
           <div className="w-full grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-lg">
                <button 
                    onClick={() => setGameMode('LOCAL')}
                    className={`py-2 rounded text-sm font-bold transition-all ${gameMode === 'LOCAL' || !gameMode ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    LOCAL
                </button>
                <button 
                    onClick={() => setGameMode('ONLINE')}
                    className={`py-2 rounded text-sm font-bold transition-all ${gameMode === 'ONLINE' ? 'bg-emerald-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    EN LIGNE
                </button>
           </div>

           {/* Input Section */}
           {(!gameMode || gameMode === 'LOCAL') ? (
               <div className="w-full space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                  <div className="space-y-2">
                    <label className="text-xs text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3 h-3" /> Identifiant Agent 1
                    </label>
                    <input 
                      type="text" 
                      value={p1Name} 
                      onChange={(e) => setP1Name(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition-all font-mono"
                      placeholder="Nom de code"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-cyan-500 font-bold uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3 h-3" /> Identifiant Agent 2
                    </label>
                    <input 
                      type="text" 
                      value={p2Name} 
                      onChange={(e) => setP2Name(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-all font-mono"
                      placeholder="Nom de code"
                    />
                  </div>
                  <button 
                   onClick={initLocalGame}
                   className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                 >
                   <Play className="w-5 h-5" /> INITIALISER MISSION LOCALE
                 </button>
               </div>
           ) : (
               <div className="w-full space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm relative overflow-hidden">
                  {/* Neon border effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                  
                  {networkError && (
                      <div className="p-3 bg-rose-900/50 border border-rose-700 rounded text-rose-200 text-xs flex gap-2 items-center">
                          <AlertTriangle className="w-4 h-4 shrink-0" /> {networkError}
                      </div>
                  )}

                  <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Votre Nom de Code</label>
                        <input 
                          type="text" 
                          value={gameMode === 'ONLINE' ? (joinCode ? p2Name : p1Name) : p1Name} 
                          onChange={(e) => joinCode ? setP2Name(e.target.value) : setP1Name(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-2">
                          <button 
                             onClick={initOnlineHost}
                             className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                          >
                             <Globe className="w-4 h-4" /> CRÉER UN SALON
                          </button>
                          
                          <div className="relative py-2">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                              <div className="relative flex justify-center"><span className="bg-slate-900 px-2 text-xs text-slate-500 uppercase">OU</span></div>
                          </div>

                          <div className="flex gap-2">
                              <input 
                                type="text"
                                maxLength={4}
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="CODE"
                                className="w-24 bg-slate-950 border border-slate-700 rounded p-3 text-center text-white font-mono font-bold tracking-widest uppercase focus:border-cyan-500 focus:outline-none"
                              />
                              <button 
                                onClick={joinOnlineGame}
                                disabled={joinCode.length < 4}
                                className="flex-1 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                              >
                                REJOINDRE
                              </button>
                          </div>
                      </div>
                  </div>
               </div>
           )}

           <button 
               onClick={() => setShowRules(true)}
               className="w-full px-8 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-700 hover:text-white transition-colors rounded flex items-center justify-center gap-2"
             >
               <BookOpen className="w-4 h-4" /> CONSULTER LES RÈGLES
             </button>
        </div>
      </div>
    );
  }

  // --- GAME RENDERING ---

  // Determine what view logic to use
  // Local: Use the transition logic (turnPlayer)
  // Online: Use myPlayerId
  const getCardViewerType = (card: CardData): CardType => {
      if (gameMode === 'LOCAL') {
          return getCardTypeForPlayer(card, turnPlayer);
      } else {
          return getCardTypeForPlayer(card, myPlayerId);
      }
  };

  // Status Text
  const getStatusText = () => {
      if (phase === GamePhase.CLUE) {
          if (gameMode === 'ONLINE') {
              if (turnPlayer === myPlayerId) return "ENCODAGE: À VOUS";
              return `ENCODAGE: ${turnPlayer === 'P1' ? p1Name : p2Name}`;
          }
          return "ENCODAGE EN COURS";
      } else {
          if (gameMode === 'ONLINE') {
              if ((turnPlayer === 'P1' && myPlayerId === 'P2') || (turnPlayer === 'P2' && myPlayerId === 'P1')) return "DÉCRYPTAGE: À VOUS";
              return `DÉCRYPTAGE: ${turnPlayer === 'P1' ? p2Name : p1Name}`;
          }
          return "DÉCRYPTAGE EN COURS";
      }
  };

  const isMyTurn = () => {
      if (gameMode === 'LOCAL') return true;
      if (phase === GamePhase.CLUE) return turnPlayer === myPlayerId;
      if (phase === GamePhase.GUESS) return (turnPlayer === 'P1' && myPlayerId === 'P2') || (turnPlayer === 'P2' && myPlayerId === 'P1');
      return false;
  };

  return (
    <div className={`h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden ${shake ? 'glitch' : ''}`}>
      
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showRestartConfirm && <RestartModal onConfirm={handleRestartConfirm} onCancel={() => setShowRestartConfirm(false)} />}

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-900/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* TRANSITION OVERLAY - ONLY FOR LOCAL */}
      {gameMode === 'LOCAL' && phase === GamePhase.TRANSITION && (
        <Transition 
            nextPlayerId={turnPlayer === 'P1' ? (currentClue ? 'P2' : 'P1') : (currentClue ? 'P1' : 'P2')} // Simple toggle logic for local hotseat
            nextPlayerName={turnPlayer === 'P1' ? (currentClue ? p2Name : p1Name) : (currentClue ? p1Name : p2Name)}
            onUnlock={handleTransitionUnlock} 
        />
      )}

      {/* TOP HUD */}
      <header className="relative z-20 flex items-center justify-between p-2 sm:p-4 glass-panel border-b-0 rounded-b-xl mx-2 mt-2 shadow-lg shrink-0">
        <div className="flex flex-col items-start gap-1 min-w-[60px]">
             <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
               <Clock className={`w-3 h-3 ${tokens <= 2 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} /> Temps
             </span>
             <div className="flex flex-wrap gap-1 max-w-[80px]">
               {Array.from({length: MAX_TOKENS}).map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < tokens ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'bg-slate-800'}`}></div>
               ))}
             </div>
        </div>

        <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
                <div className={`w-2 h-2 rounded-full ${turnPlayer === 'P1' ? 'bg-emerald-500' : 'bg-cyan-500'} ${isMyTurn() ? 'animate-pulse' : ''}`}></div>
                {getStatusText()}
             </div>
             {gameMode === 'ONLINE' && (
                 <div className="text-[10px] text-slate-600 font-mono">{roomId}</div>
             )}
        </div>

        <div className="flex flex-col items-end gap-1 min-w-[60px]">
             <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
               Cibles <Target className="w-3 h-3 text-emerald-500" />
             </span>
             <span className="text-lg font-mono font-bold text-emerald-400 leading-none filter drop-shadow-sm">
               {agentsFoundCount}<span className="text-slate-600 text-sm">/{TARGET_AGENTS}</span>
             </span>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative z-10 w-full max-w-lg mx-auto">
        
        {/* GAME OVER / VICTORY MODALS */}
        {(phase === GamePhase.GAME_OVER || phase === GamePhase.VICTORY) && (
            <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in rounded-xl">
                <div className="max-w-md w-full bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl text-center">
                    {phase === GamePhase.VICTORY ? (
                        <>
                            <div className="relative inline-block mb-4">
                                <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full"></div>
                                <CheckCircle className="w-20 h-20 text-emerald-400 relative z-10" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2 neon-text-green">MISSION ACCOMPLIE</h2>
                            <p className="text-slate-400 mb-8">Excellent travail, agents {p1Name} et {p2Name}.</p>
                        </>
                    ) : (
                        <>
                            <div className="relative inline-block mb-4">
                                <div className="absolute inset-0 bg-rose-500/30 blur-xl rounded-full"></div>
                                <Skull className="w-20 h-20 text-rose-500 relative z-10" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2 neon-text-red">ÉCHEC CRITIQUE</h2>
                            <p className="text-slate-400 mb-8">Liaison perdue. Opération compromise.</p>
                        </>
                    )}
                    <button 
                        onClick={handleRestartConfirm} // Actually triggers reset logic
                        className="w-full py-4 bg-white text-slate-900 font-bold rounded hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <RotateCcw className="w-5 h-5" /> REINITIALISER LE SYSTÈME
                    </button>
                </div>
            </div>
        )}

        {/* GRID CONTAINER */}
        <div className="w-full aspect-square max-w-[400px] grid grid-cols-5 gap-1.5 sm:gap-2 my-auto">
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              phase={phase}
              // CRITICAL: In online mode, I always see cards through MY glasses. In Local, it shifts.
              // Note: Card component logic uses 'viewerType' to decide if it shows colors.
              // If Phase is CLUE, Card shows colors of viewerType.
              // If Phase is GUESS, Card hides colors unless revealed.
              // BUT in Online, if I am the Giver, I see colors. If I am Guesser, I see dark.
              // My 'viewerType' is always consistent (e.g. Green Key), but the *display* depends on Phase logic inside Card.
              // Wait, Card.tsx logic says: "If phase === CLUE ... show key". 
              // This works for Local. 
              // For Online: If I am Guesser, Phase is CLUE (Partner is thinking), I should NOT see Key?
              // No, in Duo, you always see your Key. It's your reference.
              // Let's adjust viewerType passed to Card.
              viewerType={getCardViewerType(card)}
              onClick={() => handleCardClick(card.id)}
              disabled={phase !== GamePhase.GUESS || !isMyTurn()}
            />
          ))}
        </div>
      </main>

      {/* CONTROLS AREA */}
      <footer className="relative z-20 w-full max-w-lg mx-auto p-4 pt-0 shrink-0">
        <div className="glass-panel p-4 rounded-xl border-t border-slate-700 shadow-xl">
          
          {phase === GamePhase.CLUE && (
            <form onSubmit={handleGiveClue} className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={inputWord}
                  onChange={e => setInputWord(e.target.value)}
                  placeholder="MOT INDICE" 
                  disabled={!isMyTurn()}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold tracking-wider disabled:opacity-50"
                  maxLength={15}
                  autoFocus={isMyTurn()}
                />
              </div>
              <div className="w-20 relative">
                <input 
                  type="number" 
                  value={inputCount}
                  onChange={e => setInputCount(e.target.value)}
                  placeholder="#" 
                  min="0"
                  max="9"
                  disabled={!isMyTurn()}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded p-3 text-center text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono font-bold text-lg disabled:opacity-50"
                />
              </div>
              <button 
                type="submit"
                disabled={!inputWord || !inputCount || !isMyTurn()}
                className="bg-emerald-600 text-white p-3 rounded hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/20"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          )}

          {phase === GamePhase.GUESS && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
               <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 w-full sm:w-auto justify-center">
                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">Indice</div>
                    <div className="text-xl font-bold text-white neon-text-green leading-none">{currentClue?.word}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700"></div>
                  <div className="text-3xl font-mono font-bold text-white leading-none">{currentClue?.count}</div>
               </div>

               {isMyTurn() && (
                   <button 
                     onClick={handleEndTurnButton}
                     className="w-full sm:w-auto px-6 py-3 bg-slate-800 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2"
                   >
                     <Clock className="w-4 h-4" /> Fin de tour
                   </button>
               )}
               {!isMyTurn() && gameMode === 'ONLINE' && (
                   <div className="text-xs text-slate-500 animate-pulse uppercase tracking-wider">
                       Partenaire en cours d'analyse...
                   </div>
               )}
            </div>
          )}
          
          {/* SYSTEM BUTTONS ROW */}
          {phase !== GamePhase.GAME_OVER && phase !== GamePhase.VICTORY && (
              <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-700/50">
                <button 
                  onClick={() => setShowRules(true)} 
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  <BookOpen className="w-3 h-3" /> RÈGLES
                </button>
                <button 
                  onClick={() => setShowRestartConfirm(true)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-wider"
                >
                  <RotateCcw className="w-3 h-3" /> {gameMode === 'ONLINE' ? 'QUITTER' : 'ABANDONNER'}
                </button>
              </div>
          )}

          {(phase === GamePhase.GAME_OVER || phase === GamePhase.VICTORY) && (
              <div className="text-center text-xs text-slate-500 uppercase tracking-widest py-3">
                  SESSION TERMINÉE
              </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;