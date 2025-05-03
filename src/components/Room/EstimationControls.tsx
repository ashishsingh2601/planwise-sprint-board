
import React from "react";
import { Button } from "@/components/shared/Button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Issue } from "@/types";
import { Badge } from "@/components/ui/badge";

interface EstimationControlsProps {
  currentIssue?: Issue;
  userVote?: number;
  allParticipantsVoted: boolean;
  canReveal: boolean;
  timerPercentage: number;
  timerValue: number | null;
  onSubmitVote: (value: number) => void;
  onRevealVotes: () => void;
  isHost: boolean;
}

const EstimationControlsProps: React.FC<EstimationControlsProps> = ({
  currentIssue,
  userVote,
  allParticipantsVoted,
  canReveal,
  timerPercentage,
  timerValue,
  onSubmitVote,
  onRevealVotes,
  isHost,
}) => {
  const estimationValues = [1, 2, 3, 5, 8, 13, 21];

  if (!currentIssue) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            {isHost ? "Select an issue to start estimation" : "Waiting for the host to select an issue"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <Badge variant="outline" className="bg-planwise-light-purple text-planwise-purple">
              {currentIssue.key}
            </Badge>
            
            {timerValue !== null && (
              <span className="text-sm font-medium">
                {timerValue}s
              </span>
            )}
          </div>
          
          <Progress value={timerPercentage} className="h-2" />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">{currentIssue.title}</h3>
          {currentIssue.description && (
            <p className="text-sm text-gray-600">{currentIssue.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {!userVote && (
            <div className="flex flex-wrap gap-2 justify-center">
              {estimationValues.map((value) => (
                <Button
                  key={value}
                  variant={userVote === value ? "primary" : "outline"}
                  onClick={() => onSubmitVote(value)}
                  className="px-4 py-2 h-12 w-12 font-bold"
                >
                  {value}
                </Button>
              ))}
            </div>
          )}

          {userVote && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Your vote</p>
              <Badge className="text-lg px-3 py-1 bg-planwise-light-purple text-planwise-purple">
                {userVote}
              </Badge>
            </div>
          )}

          {isHost && (
            <div className="flex justify-center mt-4">
              <Button
                variant="primary"
                onClick={onRevealVotes}
                disabled={!canReveal}
              >
                Reveal Votes
              </Button>
            </div>
          )}

          {!isHost && allParticipantsVoted && (
            <p className="text-center text-sm text-gray-500">
              All votes submitted. Waiting for host to reveal.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimationControlsProps;
