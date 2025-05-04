
import { Issue, Room, User, Vote } from "@/types";

// Helper to simulate persistent data across browser reloads
const getStoredRoom = (roomId: string): Room | null => {
  try {
    const storedRoom = localStorage.getItem(`planwise_room_${roomId}`);
    return storedRoom ? JSON.parse(storedRoom) : null;
  } catch (e) {
    console.error("Error retrieving stored room:", e);
    return null;
  }
};

const storeRoom = (room: Room): void => {
  try {
    localStorage.setItem(`planwise_room_${room.id}`, JSON.stringify(room));
    // Broadcast room update to all tabs/windows
    const event = new CustomEvent('room-updated', { 
      detail: { roomId: room.id, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
  } catch (e) {
    console.error("Error storing room:", e);
  }
};

// Listen for room updates from other tabs/windows
if (typeof window !== 'undefined') {
  window.addEventListener('room-updated', (event: any) => {
    const { roomId } = event.detail;
    console.log('Room updated event received:', roomId);
    // Custom event to notify React components about the room update
    window.dispatchEvent(new CustomEvent('refresh-room', { 
      detail: { roomId } 
    }));
  });
}

// This is a mock implementation that would be replaced with actual API calls
export const api = {
  // Room management
  createRoom: async (): Promise<{ roomId: string }> => {
    // In a real implementation, this would call the backend
    const roomId = `room_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Creating room with ID:", roomId);
    
    // Initialize the room in storage
    const initialRoom: Room = {
      id: roomId,
      participants: [],
      issues: [],
      votes: [],
      revealVotes: false,
    };
    
    storeRoom(initialRoom);
    
    return { roomId };
  },

  joinRoom: async (roomId: string, userName: string): Promise<{ user: User; room: Room }> => {
    // This would call the backend in a real implementation
    const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`User ${userName} (${userId}) joining room ${roomId}`);
    
    // Get existing room or create new one
    const existingRoom = getStoredRoom(roomId) || {
      id: roomId,
      participants: [],
      issues: [],
      votes: [],
      revealVotes: false,
    };
    
    // Create the user
    const user: User = {
      id: userId,
      name: userName,
      isHost: existingRoom.participants.length === 0, // First user becomes host
    };
    
    // Add the user to the room
    const updatedRoom: Room = {
      ...existingRoom,
      participants: [...existingRoom.participants, user],
    };
    
    // Store the updated room
    storeRoom(updatedRoom);
    
    return { user, room: updatedRoom };
  },
  
  leaveRoom: async (roomId: string, userId: string): Promise<void> => {
    console.log(`User ${userId} leaving room ${roomId}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    // Remove the user
    const updatedParticipants = existingRoom.participants.filter(p => p.id !== userId);
    
    // Find a new host if the leaving user was the host
    const leavingUser = existingRoom.participants.find(p => p.id === userId);
    let needNewHost = leavingUser?.isHost && updatedParticipants.length > 0;
    
    if (needNewHost) {
      updatedParticipants[0].isHost = true;
    }
    
    // Remove votes by this user
    const updatedVotes = existingRoom.votes.filter(v => v.userId !== userId);
    
    const updatedRoom: Room = {
      ...existingRoom,
      participants: updatedParticipants,
      votes: updatedVotes,
    };
    
    storeRoom(updatedRoom);
  },

  // Issue management
  uploadIssues: async (roomId: string, issues: Partial<Issue>[]): Promise<Issue[]> => {
    console.log(`Uploading ${issues.length} issues to room ${roomId}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) throw new Error("Room not found");
    
    // Mock implementation - in reality this would send to the backend
    const formattedIssues = issues.map((issue, index) => ({
      id: `issue_${Math.random().toString(36).substr(2, 9)}`,
      key: issue.key || `ISSUE-${index + 1}`,
      title: issue.title || `Issue ${index + 1}`,
      description: issue.description,
    }));
    
    // Add issues to the room
    const updatedRoom: Room = {
      ...existingRoom,
      issues: [...existingRoom.issues, ...formattedIssues],
    };
    
    storeRoom(updatedRoom);
    
    return formattedIssues;
  },

  selectIssue: async (roomId: string, issueId: string): Promise<void> => {
    console.log(`Selecting issue ${issueId} in room ${roomId}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    const updatedRoom: Room = {
      ...existingRoom,
      currentIssueId: issueId,
      revealVotes: false,
      votes: existingRoom.votes.filter(vote => vote.issueId !== issueId),
    };
    
    storeRoom(updatedRoom);
  },

  // Voting
  submitVote: async (roomId: string, vote: Omit<Vote, 'id'>): Promise<void> => {
    console.log(`Submitting vote in room ${roomId}:`, vote);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    // Remove any existing votes by this user for this issue
    const otherVotes = existingRoom.votes.filter(
      v => !(v.userId === vote.userId && v.issueId === vote.issueId)
    );
    
    const updatedRoom: Room = {
      ...existingRoom,
      votes: [...otherVotes, vote],
    };
    
    storeRoom(updatedRoom);
  },
  
  revealVotes: async (roomId: string): Promise<Vote[]> => {
    console.log(`Revealing votes in room ${roomId}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return [];
    
    const updatedRoom: Room = {
      ...existingRoom,
      revealVotes: true,
    };
    
    storeRoom(updatedRoom);
    
    return existingRoom.votes.filter(vote => vote.issueId === existingRoom.currentIssueId);
  },

  finalizeEstimation: async (
    roomId: string, 
    issueId: string, 
    value: number
  ): Promise<void> => {
    console.log(`Finalizing estimation for issue ${issueId} with value ${value}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    const updatedIssues = existingRoom.issues.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, estimation: value };
      }
      return issue;
    });
    
    const updatedRoom: Room = {
      ...existingRoom,
      issues: updatedIssues,
      currentIssueId: undefined,
      revealVotes: false,
    };
    
    storeRoom(updatedRoom);
  },

  // Host actions
  transferHost: async (roomId: string, newHostId: string): Promise<void> => {
    console.log(`Transferring host to user ${newHostId} in room ${roomId}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    const updatedParticipants = existingRoom.participants.map(p => ({
      ...p,
      isHost: p.id === newHostId,
    }));
    
    const updatedRoom: Room = {
      ...existingRoom,
      participants: updatedParticipants,
    };
    
    storeRoom(updatedRoom);
  },
  
  removeParticipant: async (roomId: string, userId: string): Promise<void> => {
    console.log(`Removing participant ${userId} from room ${roomId}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    const updatedRoom: Room = {
      ...existingRoom,
      participants: existingRoom.participants.filter(p => p.id !== userId),
      votes: existingRoom.votes.filter(v => v.userId !== userId),
    };
    
    storeRoom(updatedRoom);
  },

  modifyVote: async (
    roomId: string, 
    userId: string, 
    issueId: string, 
    value: number
  ): Promise<void> => {
    console.log(`Host modifying vote for user ${userId} on issue ${issueId} to ${value}`);
    
    const existingRoom = getStoredRoom(roomId);
    if (!existingRoom) return;
    
    const otherVotes = existingRoom.votes.filter(
      v => !(v.userId === userId && v.issueId === issueId)
    );
    
    const updatedRoom: Room = {
      ...existingRoom,
      votes: [...otherVotes, { userId, issueId, value }],
    };
    
    storeRoom(updatedRoom);
  },
  
  // New method to check for room updates
  checkForUpdates: async (roomId: string): Promise<Room | null> => {
    return getStoredRoom(roomId);
  }
};
