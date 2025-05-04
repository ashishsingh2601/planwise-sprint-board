
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const roomRoutes = require('./routes/roomRoutes');
const { setupSocketHandlers } = require('./socket/socketHandlers');

const app = express();

// Configure CORS correctly - make sure to add all necessary origins
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-production-url.com', '*'],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Initialize server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://your-production-url.com', '*'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Add root route
app.get('/', (req, res) => {
  res.json({ message: 'Planwise API is running' });
});

// Use routes
app.use('/api/room', roomRoutes);

// Set up socket handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
