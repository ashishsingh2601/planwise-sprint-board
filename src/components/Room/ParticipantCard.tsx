
import React from "react";
import { User, Vote } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  participant: User;
  hasVoted: boolean;
  revealVotes: boolean;
  vote?: number;
  isCurrentUser: boolean;
  isHost: boolean;
  onTransferHost?: (userId: string) => void;
  onRemoveParticipant?: (userId: string) => void;
  onModifyVote?: (userId: string) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  hasVoted,
  revealVotes,
  vote,
  isCurrentUser,
  isHost,
  onTransferHost,
  onRemoveParticipant,
  onModifyVote,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn(
      "flip-card relative",
      revealVotes ? "flipped" : ""
    )}>
      <div className="flip-card-inner relative h-[180px]">
        {/* Front face - Participant info */}
        <Card className="flip-card-front border-2 h-full overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center h-full p-4">
            {isCurrentUser && (
              <Badge variant="outline" className="absolute top-2 right-2 text-xs bg-planwise-purple text-white">
                You
              </Badge>
            )}
            
            {participant.isHost && (
              <Badge variant="outline" className="absolute top-2 left-2 text-xs border-amber-400 text-amber-500">
                Host
              </Badge>
            )}
            
            <Avatar className="w-20 h-20 mb-3">
              <AvatarFallback className="bg-planwise-light-purple text-planwise-purple">
                {getInitials(participant.name)}
              </AvatarFallback>
            </Avatar>
            
            <span className="font-medium text-sm truncate max-w-full">
              {participant.name}
            </span>
            
            {hasVoted ? (
              <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                Voted
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                Not voted
              </Badge>
            )}
            
            {isHost && !isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full"
                  >
                    <span className="sr-only">Open menu</span>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTransferHost?.(participant.id)}>
                    Make Host
                  </DropdownMenuItem>
                  {hasVoted && onModifyVote && (
                    <DropdownMenuItem onClick={() => onModifyVote(participant.id)}>
                      Modify Vote
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={() => onRemoveParticipant?.(participant.id)}
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardContent>
        </Card>

        {/* Back face - Vote value */}
        <Card className="flip-card-back border-2 h-full overflow-hidden border-planwise-purple">
          <CardContent className="flex flex-col items-center justify-center h-full p-4">
            {vote !== undefined ? (
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold text-planwise-purple">
                  {vote}
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  {participant.name}
                </span>
              </div>
            ) : (
              <div className="text-gray-400 font-medium">No vote</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipantCard;
