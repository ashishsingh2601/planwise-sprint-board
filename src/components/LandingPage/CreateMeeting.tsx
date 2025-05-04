
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/shared/Button";
import { toast } from "@/components/ui/sonner";
import { useRoom } from "@/hooks/useRoom";

const CreateMeeting: React.FC = () => {
  const [name, setName] = useState("");
  const { createRoom, isLoading } = useRoom();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    try {
      const roomId = await createRoom();
      toast.success("Meeting created! Redirecting...");
      
      // Copy the meeting link to the clipboard
      const meetingUrl = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(meetingUrl);
      toast.success("Meeting link copied to clipboard!");
      
      // Redirect to the room page with the user's name
      navigate(`/room/${roomId}?name=${encodeURIComponent(name)}`);
    } catch (error) {
      console.error("Failed to create meeting:", error);
      toast.error("Failed to create meeting. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          required
        />
      </div>
      
      <div className="pt-2">
        <Button 
          type="submit" 
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Create Meeting
        </Button>
      </div>
    </form>
  );
};

export default CreateMeeting;
