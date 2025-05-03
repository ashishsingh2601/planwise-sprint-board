
import { useState, useEffect, useCallback } from "react";
import { Room } from "@/types";

interface EstimationTimerProps {
  room: Room | null;
  onTimerComplete?: () => void;
  timerDuration?: number;
}

export const useEstimation = ({
  room,
  onTimerComplete,
  timerDuration = 30,
}: EstimationTimerProps) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const startTimer = useCallback(() => {
    if (!room?.currentIssueId) return;
    
    setTimer(timerDuration);
    setIsTimerRunning(true);
  }, [room?.currentIssueId, timerDuration]);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(timerDuration);
    setIsTimerRunning(false);
  }, [timerDuration]);

  // Check if all participants have voted
  const allParticipantsVoted = useCallback(() => {
    if (!room?.currentIssueId) return false;
    
    const voteCount = room.votes.filter(
      vote => vote.issueId === room.currentIssueId
    ).length;
    
    return voteCount === room.participants.length;
  }, [room]);

  // Auto-start the timer when a new issue is selected
  useEffect(() => {
    if (room?.currentIssueId) {
      startTimer();
    } else {
      resetTimer();
    }
  }, [room?.currentIssueId, startTimer, resetTimer]);

  // Timer countdown logic
  useEffect(() => {
    if (!isTimerRunning || timer === null) return;
    
    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer === null || prevTimer <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          if (onTimerComplete) onTimerComplete();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTimerRunning, onTimerComplete, timer]);

  // Stop timer if all participants have voted
  useEffect(() => {
    if (isTimerRunning && allParticipantsVoted()) {
      stopTimer();
    }
  }, [isTimerRunning, allParticipantsVoted, room?.votes, stopTimer]);

  const timerPercentage = timer !== null 
    ? ((timerDuration - timer) / timerDuration) * 100 
    : 0;

  return {
    timer,
    isTimerRunning,
    timerPercentage,
    startTimer,
    stopTimer,
    resetTimer,
    allParticipantsVoted,
    timerExpired: timer === 0,
  };
};
