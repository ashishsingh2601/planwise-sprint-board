import { Issue, Room, User, Vote } from "@/types";
import { io, Socket } from "socket.io-client";

// API base URL - configure based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-production-url.com'  // Update with actual production URL
  : 'http://localhost:3001';

// Socket.io connection
let socket: Socket | null = null;

// Connect to Socket.io server with proper options
const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      console.log('Connected to server via Socket.io');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    socket.on('error', (error) => {
      console.error('Socket.io error:', error);
    });
  }
  
  return socket;
};

// Helper to handle room events
const setupRoomListeners = (roomId: string, callback: (room: Room) => void): void => {
  const socket = connectSocket();
  
  // Listen for room updates
  socket.on('room-updated', (updatedRoom: Room) => {
    if (updatedRoom.id === roomId) {
      console.log('Room updated event received:', updatedRoom);
      callback(updatedRoom);
    }
  });
};

// Remove room listeners when leaving
const removeRoomListeners = (roomId: string): void => {
  if (socket) {
    socket.off('room-updated');
  }
};

export const api = {
  // Room management
  createRoom: async (): Promise<{ roomId: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/room`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create room');
      }
      
      console.log("Created room with ID:", data.roomId);
      return { roomId: data.roomId };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  joinRoom: async (roomId: string, userName: string): Promise<{ user: User; room: Room }> => {
    try {
      const socket = connectSocket();
      
      // Generate a user ID
      const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      
      return new Promise((resolve, reject) => {
        // First check if room exists
        socket.emit('get-room', { roomId }, (response: any) => {
          if (!response.success) {
            reject(new Error('Room not found'));
            return;
          }
          
          const isFirstUser = response.room.participants.length === 0;
          
          // Create user object
          const user: User = {
            id: userId,
            name: userName,
            isHost: isFirstUser, // First user becomes host
          };
          
          // Join the room
          socket.emit('join-room', { roomId, user });
          
          // Get updated room data
          socket.emit('get-room', { roomId }, (finalResponse: any) => {
            if (finalResponse.success) {
              resolve({ user, room: finalResponse.room });
            } else {
              reject(new Error('Failed to join room'));
            }
          });
        });
      });
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },
  
  leaveRoom: async (roomId: string, userId: string): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('leave-room', { roomId, userId });
      removeRoomListeners(roomId);
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  },

  // Issue management
  uploadIssues: async (roomId: string, issues: Partial<Issue>[]): Promise<Issue[]> => {
    try {
      const socket = connectSocket();
      socket.emit('upload-issues', { roomId, issues });
      
      // Return a fake promise as socket.io is asynchronous
      return issues.map((issue, index) => ({
        id: `issue_temp_${Date.now()}_${index}`,
        key: issue.key || `ISSUE-${index + 1}`,
        title: issue.title || `Issue ${index + 1}`,
        description: issue.description,
      })) as Issue[];
    } catch (error) {
      console.error('Error uploading issues:', error);
      throw error;
    }
  },

  selectIssue: async (roomId: string, issueId: string): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('select-issue', { roomId, issueId });
    } catch (error) {
      console.error('Error selecting issue:', error);
      throw error;
    }
  },

  // Voting
  submitVote: async (roomId: string, vote: Omit<Vote, 'id'>): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('submit-vote', { roomId, vote });
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },
  
  revealVotes: async (roomId: string): Promise<Vote[]> => {
    try {
      const socket = connectSocket();
      socket.emit('reveal-votes', { roomId });
      
      // This is a placeholder as socket.io doesn't return values directly
      return [];
    } catch (error) {
      console.error('Error revealing votes:', error);
      throw error;
    }
  },

  finalizeEstimation: async (
    roomId: string, 
    issueId: string, 
    value: number
  ): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('finalize-estimation', { roomId, issueId, value });
    } catch (error) {
      console.error('Error finalizing estimation:', error);
      throw error;
    }
  },

  // Host actions
  transferHost: async (roomId: string, newHostId: string): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('transfer-host', { roomId, newHostId });
    } catch (error) {
      console.error('Error transferring host:', error);
      throw error;
    }
  },
  
  removeParticipant: async (roomId: string, userId: string): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('remove-participant', { roomId, userId });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  },

  modifyVote: async (
    roomId: string, 
    userId: string, 
    issueId: string, 
    value: number
  ): Promise<void> => {
    try {
      const socket = connectSocket();
      socket.emit('modify-vote', { roomId, userId, issueId, value });
    } catch (error) {
      console.error('Error modifying vote:', error);
      throw error;
    }
  },
  
  // Method to listen for room updates
  listenForUpdates: (roomId: string, callback: (room: Room) => void): void => {
    setupRoomListeners(roomId, callback);
  },
  
  // Method to stop listening for room updates
  stopListening: (roomId: string): void => {
    removeRoomListeners(roomId);
  }
};
