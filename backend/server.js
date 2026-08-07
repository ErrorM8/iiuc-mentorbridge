require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers.set(String(userId), socket.id);
  });

  socket.on('sendMessage', (data) => {
    const receiverSocketId = onlineUsers.get(String(data.receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', data);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});