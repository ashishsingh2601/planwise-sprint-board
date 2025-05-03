
import React from "react";
import { User, Vote } from "@/types";
import ParticipantCard from "./ParticipantCard";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/shared/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ParticipantTableProps {
  participants: User[];
  currentUserId: string;
  votes: Vote[];
  currentIssueId?: string;
  revealVotes: boolean;
  onTransferHost: (userId: string) => void;
  onRemoveParticipant: (userId: string) => void;
  onModifyVote: (userId: string, value: number) => void;
}

const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  currentUserId,
  votes,
  currentIssueId,
  revealVotes,
  onTransferHost,
  onRemoveParticipant,
  onModifyVote,
}) => {
  const [isModifyVoteOpen, setIsModifyVoteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<number>(1);
  
  const currentUser = participants.find(p => p.id === currentUserId);
  const isHost = currentUser?.isHost || false;
  
  const handleModifyVote = (userId: string) => {
    setSelectedUserId(userId);
    setIsModifyVoteOpen(true);
  };
  
  const handleSaveVote = () => {
    if (selectedUserId && selectedValue) {
      onModifyVote(selectedUserId, selectedValue);
      setIsModifyVoteOpen(false);
      setSelectedUserId(null);
    }
  };
  
  const hasVoted = (userId: string): boolean => {
    if (!currentIssueId) return false;
    return votes.some(v => v.userId === userId && v.issueId === currentIssueId);
  };
  
  const getVote = (userId: string): number | undefined => {
    if (!currentIssueId) return undefined;
    const vote = votes.find(v => v.userId === userId && v.issueId === currentIssueId);
    return vote?.value;
  };
  
  const estimationValues = [1, 2, 3, 5, 8, 13, 21];
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6 text-center">Participants</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            hasVoted={hasVoted(participant.id)}
            revealVotes={revealVotes}
            vote={getVote(participant.id)}
            isCurrentUser={participant.id === currentUserId}
            isHost={isHost}
            onTransferHost={isHost ? onTransferHost : undefined}
            onRemoveParticipant={isHost ? onRemoveParticipant : undefined}
            onModifyVote={isHost ? handleModifyVote : undefined}
          />
        ))}
      </div>
      
      {/* Modify Vote Dialog */}
      <Dialog open={isModifyVoteOpen} onOpenChange={setIsModifyVoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Modify Vote for {participants.find(p => p.id === selectedUserId)?.name}
            </DialogTitle>
          </DialogHeader>
          
          <RadioGroup value={selectedValue.toString()} onValueChange={(val) => setSelectedValue(Number(val))} className="grid grid-cols-3 gap-2 py-4">
            {estimationValues.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value.toString()} id={`value-${value}`} />
                <Label htmlFor={`value-${value}`}>{value}</Label>
              </div>
            ))}
          </RadioGroup>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModifyVoteOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveVote}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantTable;
