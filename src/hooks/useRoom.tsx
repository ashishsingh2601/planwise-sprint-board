
import { useEffect, useState } from "react";
import { Room, User, Issue, Vote, EstimationSummary } from "@/types";
import { api } from "@/services/api";
import { toast } from "@/components/ui/sonner";

interface UseRoomOptions {
  roomId?: string;
  userName?: string;
}

export const useRoom = ({ roomId, userName }: UseRoomOptions = {}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new room
  const createRoom = async (): Promise<string> => {
    setIsLoading(true);
    try {
      const { roomId } = await api.createRoom();
      setIsLoading(false);
      return roomId;
    } catch (err) {
      setError("Failed to create room");
      setIsLoading(false);
      toast.error("Failed to create room");
      throw err;
    }
  };

  // Join a room
  const joinRoom = async (roomId: string, userName: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { user, room } = await api.joinRoom(roomId, userName);
      setCurrentUser(user);
      setRoom(room);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to join room");
      setIsLoading(false);
      toast.error("Failed to join room");
    }
  };

  // Leave room
  const leaveRoom = async (): Promise<void> => {
    if (!room || !currentUser) return;
    
    try {
      await api.leaveRoom(room.id, currentUser.id);
      setRoom(null);
      setCurrentUser(null);
    } catch (err) {
      toast.error("Failed to leave room");
    }
  };

  // Upload issues
  const uploadIssues = async (issues: Partial<Issue>[]): Promise<void> => {
    if (!room) return;
    
    setIsLoading(true);
    try {
      const uploadedIssues = await api.uploadIssues(room.id, issues);
      setRoom(prev => prev ? {
        ...prev,
        issues: [...prev.issues, ...uploadedIssues],
      } : null);
      setIsLoading(false);
      toast.success("Issues uploaded successfully");
    } catch (err) {
      setError("Failed to upload issues");
      setIsLoading(false);
      toast.error("Failed to upload issues");
    }
  };

  // Select an issue for estimation
  const selectIssue = async (issueId: string): Promise<void> => {
    if (!room || !currentUser?.isHost) return;
    
    try {
      await api.selectIssue(room.id, issueId);
      setRoom(prev => prev ? {
        ...prev,
        currentIssueId: issueId,
        revealVotes: false,
        votes: prev.votes.filter(vote => vote.issueId !== issueId),
      } : null);
    } catch (err) {
      toast.error("Failed to select issue");
    }
  };

  // Submit vote
  const submitVote = async (value: number): Promise<void> => {
    if (!room || !currentUser || !room.currentIssueId) return;
    
    try {
      const vote = {
        userId: currentUser.id,
        issueId: room.currentIssueId,
        value,
      };
      
      await api.submitVote(room.id, vote);
      
      // Update local state optimistically
      setRoom(prev => {
        if (!prev) return null;
        
        const existingVoteIndex = prev.votes.findIndex(
          v => v.userId === currentUser.id && v.issueId === room.currentIssueId
        );
        
        let newVotes = [...prev.votes];
        
        if (existingVoteIndex >= 0) {
          newVotes[existingVoteIndex] = vote;
        } else {
          newVotes.push(vote);
        }
        
        return {
          ...prev,
          votes: newVotes,
        };
      });
      
      toast.success("Vote submitted");
    } catch (err) {
      toast.error("Failed to submit vote");
    }
  };

  // Reveal votes
  const revealVotes = async (): Promise<void> => {
    if (!room || !currentUser?.isHost) return;
    
    try {
      await api.revealVotes(room.id);
      setRoom(prev => prev ? { ...prev, revealVotes: true } : null);
    } catch (err) {
      toast.error("Failed to reveal votes");
    }
  };

  // Finalize estimation
  const finalizeEstimation = async (value: number): Promise<void> => {
    if (!room || !currentUser?.isHost || !room.currentIssueId) return;
    
    try {
      await api.finalizeEstimation(room.id, room.currentIssueId, value);
      
      setRoom(prev => {
        if (!prev || !prev.currentIssueId) return prev;
        
        const updatedIssues = prev.issues.map(issue => {
          if (issue.id === prev.currentIssueId) {
            return { ...issue, estimation: value };
          }
          return issue;
        });
        
        return {
          ...prev,
          issues: updatedIssues,
          currentIssueId: undefined,
          revealVotes: false,
        };
      });
      
      toast.success(`Issue estimated with value ${value}`);
    } catch (err) {
      toast.error("Failed to finalize estimation");
    }
  };

  // Transfer host
  const transferHost = async (userId: string): Promise<void> => {
    if (!room || !currentUser?.isHost) return;
    
    try {
      await api.transferHost(room.id, userId);
      
      setRoom(prev => {
        if (!prev) return null;
        
        const updatedParticipants = prev.participants.map(p => ({
          ...p,
          isHost: p.id === userId,
        }));
        
        return {
          ...prev,
          participants: updatedParticipants,
        };
      });
      
      // Update current user if they're the one who just got host status
      if (currentUser.id === userId) {
        setCurrentUser({ ...currentUser, isHost: true });
      } else if (currentUser.isHost) {
        setCurrentUser({ ...currentUser, isHost: false });
      }
      
      toast.success("Host privileges transferred");
    } catch (err) {
      toast.error("Failed to transfer host privileges");
    }
  };

  // Remove participant
  const removeParticipant = async (userId: string): Promise<void> => {
    if (!room || !currentUser?.isHost) return;
    
    try {
      await api.removeParticipant(room.id, userId);
      
      setRoom(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          participants: prev.participants.filter(p => p.id !== userId),
          votes: prev.votes.filter(v => v.userId !== userId),
        };
      });
      
      toast.success("Participant removed");
    } catch (err) {
      toast.error("Failed to remove participant");
    }
  };

  // Modify vote (host only)
  const modifyVote = async (
    userId: string, 
    value: number
  ): Promise<void> => {
    if (
      !room || 
      !currentUser?.isHost || 
      !room.currentIssueId
    ) return;
    
    try {
      await api.modifyVote(room.id, userId, room.currentIssueId, value);
      
      setRoom(prev => {
        if (!prev || !prev.currentIssueId) return prev;
        
        const existingVoteIndex = prev.votes.findIndex(
          v => v.userId === userId && v.issueId === prev.currentIssueId
        );
        
        let newVotes = [...prev.votes];
        
        if (existingVoteIndex >= 0) {
          newVotes[existingVoteIndex] = {
            userId,
            issueId: prev.currentIssueId,
            value,
          };
        } else {
          newVotes.push({
            userId,
            issueId: prev.currentIssueId,
            value,
          });
        }
        
        return {
          ...prev,
          votes: newVotes,
        };
      });
      
      toast.success("Vote modified");
    } catch (err) {
      toast.error("Failed to modify vote");
    }
  };

  // Get participants who have voted for the current issue
  const getVotersForCurrentIssue = (): string[] => {
    if (!room || !room.currentIssueId) return [];
    
    return room.votes
      .filter(vote => vote.issueId === room.currentIssueId)
      .map(vote => vote.userId);
  };

  // Get current issue
  const getCurrentIssue = (): Issue | undefined => {
    if (!room || !room.currentIssueId) return undefined;
    
    return room.issues.find(issue => issue.id === room.currentIssueId);
  };

  // Get vote summary for the current issue
  const getVoteSummary = (): EstimationSummary[] => {
    if (!room || !room.currentIssueId) return [];
    
    const currentIssueVotes = room.votes.filter(
      vote => vote.issueId === room.currentIssueId
    );
    
    const voteCounts: Record<number, number> = {};
    
    currentIssueVotes.forEach(vote => {
      voteCounts[vote.value] = (voteCounts[vote.value] || 0) + 1;
    });
    
    return Object.entries(voteCounts).map(([value, count]) => ({
      value: Number(value),
      count,
    })).sort((a, b) => a.value - b.value);
  };

  // Get the user's vote for the current issue
  const getUserVote = (): number | undefined => {
    if (!room || !currentUser || !room.currentIssueId) return undefined;
    
    const vote = room.votes.find(
      v => v.userId === currentUser.id && v.issueId === room.currentIssueId
    );
    
    return vote?.value;
  };

  // Get participant by ID
  const getParticipantById = (userId: string): User | undefined => {
    if (!room) return undefined;
    
    return room.participants.find(p => p.id === userId);
  };

  // Auto-join room if roomId and userName are provided
  useEffect(() => {
    if (roomId && userName && !room && !currentUser) {
      joinRoom(roomId, userName);
    }
  }, [roomId, userName]);

  return {
    room,
    currentUser,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    uploadIssues,
    selectIssue,
    submitVote,
    revealVotes,
    finalizeEstimation,
    transferHost,
    removeParticipant,
    modifyVote,
    getVotersForCurrentIssue,
    getCurrentIssue,
    getVoteSummary,
    getUserVote,
    getParticipantById,
  };
};
