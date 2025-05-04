
const { getRoomData, createNewRoom } = require('../services/roomService');

// Get room by ID
const getRoomById = (req, res) => {
  const { id } = req.params;
  const result = getRoomData(id);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
};

// Create a new room
const createRoom = (req, res) => {
  const result = createNewRoom();
  res.json(result);
};

module.exports = {
  getRoomById,
  createRoom
};
