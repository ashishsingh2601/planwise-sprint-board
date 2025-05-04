
// Store rooms in memory (in production, use a database)
const rooms = new Map();

// Get room data by ID
const getRoomData = (roomId) => {
  if (rooms.has(roomId)) {
    return { success: true, room: rooms.get(roomId) };
  } else {
    return { success: false, message: 'Room not found' };
  }
};

// Create a new room
const createNewRoom = () => {
  const roomId = `room_${Math.random().toString(36).substr(2, 9)}`;
  const room = {
    id: roomId,
    participants: [],
    issues: [],
    votes: [],
    revealVotes: false
  };
  
  rooms.set(roomId, room);
  return { success: true, roomId };
};

// Add or update participant in room
const addParticipantToRoom = (roomId, user) => {
  if (!rooms.has(roomId)) {
    return { success: false, message: 'Room not found' };
  }

  const room = rooms.get(roomId);
  const existingUserIndex = room.participants.findIndex(p => p.id === user.id);
  
  if (existingUserIndex >= 0) {
    // Update existing user
    room.participants[existingUserIndex] = user;
  } else {
    // Add new user with proper host flag
    // Only set as host if there are no participants
    if (room.participants.length === 0) {
      user.isHost = true;
    } else {
      user.isHost = false; // Make sure subsequent users are not hosts
    }
    room.participants.push(user);
  }

  return { success: true, room };
};

// Remove participant from room
const removeParticipantFromRoom = (roomId, userId) => {
  if (!rooms.has(roomId)) {
    return { success: false, message: 'Room not found' };
  }

  const room = rooms.get(roomId);
  room.participants = room.participants.filter(p => p.id !== userId);
  
  // If room is empty, delete it
  if (room.participants.length === 0) {
    rooms.delete(roomId);
    return { success: true, message: 'Room deleted' };
  }
  
  // If the host left, assign a new host
  const hostIndex = room.participants.findIndex(p => p.isHost);
  if (hostIndex === -1 && room.participants.length > 0) {
    room.participants[0].isHost = true;
  }
  
  // Remove user votes
  room.votes = room.votes.filter(v => v.userId !== userId);
  
  return { success: true, room };
};

// Get all rooms (for internal use)
const getRooms = () => {
  return rooms;
};

module.exports = {
  getRoomData,
  createNewRoom,
  getRooms,
  addParticipantToRoom,
  removeParticipantFromRoom
};
