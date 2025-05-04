
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

// Get all rooms (for internal use)
const getRooms = () => {
  return rooms;
};

module.exports = {
  getRoomData,
  createNewRoom,
  getRooms
};
