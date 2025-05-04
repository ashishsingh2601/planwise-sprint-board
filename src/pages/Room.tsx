
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/shared/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ParticipantTable from "@/components/Room/ParticipantTable";
import IssueList from "@/components/Room/IssueList";
import IssueImport from "@/components/Room/IssueImport";
import EstimationControls from "@/components/Room/EstimationControls";
import RevealSummary from "@/components/Room/RevealSummary";
import { useRoom } from "@/hooks/useRoom";
import { useEstimation } from "@/hooks/useEstimation";
import { Issue } from "@/types";

const Room = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [name, setName] = useState("");
  
  // Extract name from query params if available
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const nameParam = queryParams.get("name");
    if (nameParam) {
      setName(nameParam);
    } else {
      setNameDialogOpen(true);
    }
  }, [location.search]);
  
  const {
    room,
    currentUser,
    isLoading,
    error,
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
  } = useRoom();
  
  const {
    timer,
    isTimerRunning,
    timerPercentage,
    allParticipantsVoted,
    timerExpired,
  } = useEstimation({
    room,
    onTimerComplete: () => {
      toast.info("Time's up! Please finish voting.");
    },
  });
  
  const handleJoinRoom = async () => {
    if (!roomId || !name.trim()) return;
    
    try {
      await joinRoom(roomId, name);
      setNameDialogOpen(false);
      toast.success(`Welcome to the room, ${name}!`);
      
      // Update URL to include name
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("name", name);
      navigate(`/room/${roomId}?${queryParams.toString()}`, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Failed to join room");
    }
  };
  
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate("/");
  };
  
  const handleUploadIssues = async (issues: Partial<Issue>[]) => {
    await uploadIssues(issues);
  };
  
  const handleCopyRoomLink = async () => {
    if (!roomId) return;
    
    try {
      const url = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Room link copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy room link");
    }
  };
  
  const showRevealSummary = room?.revealVotes && room?.currentIssueId;
  const isHost = currentUser?.isHost || false;
  const currentIssue = getCurrentIssue();
  const currentUserVote = getUserVote();
  const voterIds = getVotersForCurrentIssue();
  const voteSummaries = getVoteSummary();
  
  const canReveal = (
    isHost && 
    room?.currentIssueId && 
    (allParticipantsVoted() || timerExpired)
  );
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Are you sure you want to leave? You will be removed from the room.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  
  // Automatically join room when roomId and name are available
  useEffect(() => {
    if (roomId && name && !currentUser && !nameDialogOpen) {
      joinRoom(roomId, name).catch(error => {
        console.error("Failed to join room:", error);
        toast.error("Failed to join room automatically");
      });
    }
  }, [roomId, name, currentUser, nameDialogOpen]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button variant="primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-planwise-purple">
              Plan<span className="text-gray-800">wise</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {currentUser && (
              <>
                <Button variant="outline" size="sm" onClick={handleCopyRoomLink}>
                  Copy Room Link
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLeaveRoom}>
                  Leave Room
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-planwise-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Connecting to room...</p>
            </div>
          </div>
        ) : room && currentUser ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Planning Room
                  {room.participants.length > 0 && (
                    <span className="text-base text-gray-500 ml-2">
                      ({room.participants.length} {room.participants.length === 1 ? 'participant' : 'participants'})
                    </span>
                  )}
                </h2>
                {isHost && (
                  <IssueImport onImport={handleUploadIssues} />
                )}
              </div>
              
              <ParticipantTable
                participants={room.participants}
                currentUserId={currentUser.id}
                votes={room.votes}
                currentIssueId={room.currentIssueId}
                revealVotes={room.revealVotes}
                onTransferHost={transferHost}
                onRemoveParticipant={removeParticipant}
                onModifyVote={modifyVote}
              />
              
              <div className="mt-6">
                <EstimationControls
                  currentIssue={currentIssue}
                  userVote={currentUserVote}
                  allParticipantsVoted={allParticipantsVoted()}
                  canReveal={canReveal}
                  timerPercentage={timerPercentage}
                  timerValue={timer}
                  onSubmitVote={submitVote}
                  onRevealVotes={revealVotes}
                  isHost={isHost}
                />
              </div>
            </div>
            
            <div className="h-full">
              <IssueList
                issues={room.issues}
                currentIssueId={room.currentIssueId}
                onSelectIssue={selectIssue}
                isHost={isHost}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Room not found</h2>
              <p className="text-gray-600 mb-6">
                The room you're looking for doesn't exist or you haven't joined yet.
              </p>
              <Button variant="primary" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        )}
        
        {showRevealSummary && (
          <RevealSummary
            summaries={voteSummaries}
            totalVotes={voterIds.length}
            onFinalize={finalizeEstimation}
            onReEstimate={() => selectIssue(room.currentIssueId!)}
            isHost={isHost}
          />
        )}
      </main>
      
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Planning Room</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom();
          }}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={!name.trim()}
                variant="primary"
              >
                Join Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Room;
