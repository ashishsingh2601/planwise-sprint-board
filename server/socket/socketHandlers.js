const { 
  getRooms, 
  getRoomData, 
  addParticipantToRoom, 
  removeParticipantFromRoom 
} = require('../services/roomService');

// Set up socket handlers
const setupSocketHandlers = (io) => {
  // Get rooms from service
  const rooms = getRooms();
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle joining a room
    socket.on('join-room', ({ roomId, user }) => {
      console.log(`User ${user.name} joining room ${roomId}`);
      
      // Add user to room
      const result = addParticipantToRoom(roomId, user);
      
      if (result.success) {
        // Join socket to room
        socket.join(roomId);
        
        // Notify room members about the update
        io.to(roomId).emit('room-updated', result.room);
      }
    });
    
    // Leave room
    socket.on('leave-room', ({ roomId, userId }) => {
      console.log(`User ${userId} leaving room ${roomId}`);
      
      const result = removeParticipantFromRoom(roomId, userId);
      
      if (result.success && result.room) {
        // Notify remaining participants
        io.to(roomId).emit('room-updated', result.room);
      }
      
      // Disconnect from room
      socket.leave(roomId);
    });
    
    // Handle room actions
    socket.on('upload-issues', ({ roomId, issues }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        
        // Format and add issues
        const newIssues = issues.map((issue, index) => ({
          id: `issue_${Date.now()}_${index}`,
          key: issue.key || `ISSUE-${index + 1}`,
          title: issue.title || `Issue ${index + 1}`,
          description: issue.description,
        }));
        
        room.issues = [...room.issues, ...newIssues];
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('select-issue', ({ roomId, issueId }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.currentIssueId = issueId;
        room.revealVotes = false;
        room.votes = room.votes.filter(vote => vote.issueId !== issueId);
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('submit-vote', ({ roomId, vote }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        
        // Remove any existing votes by this user for this issue
        const otherVotes = room.votes.filter(
          v => !(v.userId === vote.userId && v.issueId === vote.issueId)
        );
        
        room.votes = [...otherVotes, vote];
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('reveal-votes', ({ roomId }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.revealVotes = true;
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('finalize-estimation', ({ roomId, issueId, value }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        
        room.issues = room.issues.map(issue => {
          if (issue.id === issueId) {
            return { ...issue, estimation: value };
          }
          return issue;
        });
        
        room.currentIssueId = undefined;
        room.revealVotes = false;
        
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('transfer-host', ({ roomId, newHostId }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        
        room.participants = room.participants.map(p => ({
          ...p,
          isHost: p.id === newHostId,
        }));
        
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('remove-participant', ({ roomId, userId }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        
        room.participants = room.participants.filter(p => p.id !== userId);
        room.votes = room.votes.filter(v => v.userId !== userId);
        
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    socket.on('modify-vote', ({ roomId, userId, issueId, value }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        
        const otherVotes = room.votes.filter(
          v => !(v.userId === userId && v.issueId === issueId)
        );
        
        room.votes = [...otherVotes, { userId, issueId, value }];
        io.to(roomId).emit('room-updated', room);
      }
    });
    
    // Handle get room data
    socket.on('get-room', ({ roomId }, callback) => {
      const result = getRoomData(roomId);
      callback(result);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = {
  setupSocketHandlers
};
