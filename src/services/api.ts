
import { Issue, Room, User, Vote } from "@/types";

// This is a mock implementation that would be replaced with actual API calls
export const api = {
  // Room management
  createRoom: async (): Promise<{ roomId: string }> => {
    // In a real implementation, this would call the backend
    const roomId = `room_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Creating room with ID:", roomId);
    return { roomId };
  },

  joinRoom: async (roomId: string, userName: string): Promise<{ user: User; room: Room }> => {
    // This would call the backend in a real implementation
    const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`User ${userName} (${userId}) joining room ${roomId}`);
    
    // Mock implementation for now
    const user: User = {
      id: userId,
      name: userName,
      isHost: false, // Will be set to true for the first user by the backend
    };
    
    // In reality, we would get this from the backend
    const room: Room = {
      id: roomId,
      participants: [user],
      issues: [],
      votes: [],
      revealVotes: false,
    };
    
    return { user, room };
  },
  
  leaveRoom: async (roomId: string, userId: string): Promise<void> => {
    console.log(`User ${userId} leaving room ${roomId}`);
    // Would call backend in real implementation
  },

  // Issue management
  uploadIssues: async (roomId: string, issues: Partial<Issue>[]): Promise<Issue[]> => {
    console.log(`Uploading ${issues.length} issues to room ${roomId}`);
    
    // Mock implementation - in reality this would send to the backend
    const formattedIssues = issues.map((issue, index) => ({
      id: `issue_${Math.random().toString(36).substr(2, 9)}`,
      key: issue.key || `ISSUE-${index + 1}`,
      title: issue.title || `Issue ${index + 1}`,
      description: issue.description,
    }));
    
    return formattedIssues;
  },

  selectIssue: async (roomId: string, issueId: string): Promise<void> => {
    console.log(`Selecting issue ${issueId} in room ${roomId}`);
    // Would call backend in real implementation
  },

  // Voting
  submitVote: async (roomId: string, vote: Omit<Vote, 'id'>): Promise<void> => {
    console.log(`Submitting vote in room ${roomId}:`, vote);
    // Would call backend in real implementation
  },
  
  revealVotes: async (roomId: string): Promise<Vote[]> => {
    console.log(`Revealing votes in room ${roomId}`);
    // Would call backend in real implementation
    return [];
  },

  finalizeEstimation: async (
    roomId: string, 
    issueId: string, 
    value: number
  ): Promise<void> => {
    console.log(`Finalizing estimation for issue ${issueId} with value ${value}`);
    // Would call backend in real implementation
  },

  // Host actions
  transferHost: async (roomId: string, newHostId: string): Promise<void> => {
    console.log(`Transferring host to user ${newHostId} in room ${roomId}`);
    // Would call backend in real implementation
  },
  
  removeParticipant: async (roomId: string, userId: string): Promise<void> => {
    console.log(`Removing participant ${userId} from room ${roomId}`);
    // Would call backend in real implementation
  },

  modifyVote: async (
    roomId: string, 
    userId: string, 
    issueId: string, 
    value: number
  ): Promise<void> => {
    console.log(`Host modifying vote for user ${userId} on issue ${issueId} to ${value}`);
    // Would call backend in real implementation
  },
};
