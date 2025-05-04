
const express = require('express');
const router = express.Router();
const { getRoomById, createRoom } = require('../controllers/roomController');

// Get room by ID
router.get('/:id', getRoomById);

// Create a new room
router.post('/', createRoom);

module.exports = router;
