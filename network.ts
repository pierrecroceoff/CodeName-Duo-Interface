import { GameState } from './types';
import { io, Socket } from 'socket.io-client';

// --- CONFIGURATION ---
// IMPORTANT: Change this URL to your deployed backend URL (e.g., on Render.com)
// For local testing with the provided server.js, use "http://localhost:3000"
const SERVER_URL = "https://codename-duo-server.onrender.com"; 

// Singleton socket instance
let socket: Socket | null = null;

export const Network = {
  // Initialize connection
  connect(): Socket {
    if (!socket) {
      socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'], // Try websocket first
        reconnectionAttempts: 5
      });

      socket.on('connect_error', (err) => {
        console.error("Connection Error:", err);
      });
    }
    return socket;
  },

  // Create a new room and return the code
  async createRoom(hostName: string, initialState: GameState): Promise<string> {
    const s = Network.connect();
    
    return new Promise((resolve, reject) => {
      // Timeout safety
      const timeout = setTimeout(() => reject("Timeout: Pas de réponse du serveur"), 5000);

      s.emit('create_room', { hostName, initialState }, (response: { success: boolean; roomId?: string; error?: string }) => {
        clearTimeout(timeout);
        if (response.success && response.roomId) {
          resolve(response.roomId);
        } else {
          reject(response.error || "Erreur création salon");
        }
      });
    });
  },

  // Join a room
  async joinRoom(roomCode: string, playerName: string): Promise<{ success: boolean; error?: string }> {
    const s = Network.connect();

    return new Promise((resolve) => {
       const timeout = setTimeout(() => resolve({ success: false, error: "Timeout serveur" }), 5000);

       s.emit('join_room', { roomId: roomCode, playerName }, (response: { success: boolean; error?: string }) => {
         clearTimeout(timeout);
         resolve(response);
       });
    });
  },

  // Subscribe to game state changes
  subscribeToGame(roomCode: string, onUpdate: (state: GameState, players: any) => void) {
    const s = Network.connect();

    // Remove previous listeners to prevent duplicates if re-subscribing
    s.off('game_updated');
    s.off('player_joined');

    // Listener
    s.on('game_updated', (data: { state: GameState; players: any }) => {
      onUpdate(data.state, data.players);
    });

    // We can also listen specifically for players joining if we want distinct notifications
    // but usually game_updated sends the whole package.
    
    return () => {
      s.off('game_updated');
    };
  },

  // Push a state update
  async updateGameState(roomCode: string, newState: Partial<GameState>) {
    const s = Network.connect();
    s.emit('update_game_state', { roomId: roomCode, updates: newState });
  }
};