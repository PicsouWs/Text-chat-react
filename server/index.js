import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { db } from './db.js';
import { registerUser, loginUser, verifyToken } from './auth.js';

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Auth endpoints
app.post('/api/register', async (req, res) => {
  try {
    const token = await registerUser(req.body.username, req.body.password);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const token = await loginUser(req.body.username, req.body.password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const payload = verifyToken(token);
  if (!payload) {
    return next(new Error('Authentication error'));
  }
  socket.userId = payload.userId;
  next();
});

const connectedUsers = new Map();
const typingUsers = new Map();

io.on('connection', async (socket) => {
  const userId = socket.userId;
  connectedUsers.set(userId, socket.id);
  
  // Get user info
  const userResult = await db.execute({
    sql: 'SELECT id, username, avatar FROM users WHERE id = ?',
    args: [userId]
  });
  const user = userResult.rows[0];
  
  // Send user list to the connected user
  const usersResult = await db.execute('SELECT id, username, avatar FROM users');
  socket.emit('users', usersResult.rows);
  
  // Load channel messages with reactions and read receipts
  const channelMessages = await db.execute({
    sql: `
      SELECT 
        m.*,
        u.username,
        u.avatar,
        GROUP_CONCAT(DISTINCT r.emoji || ':' || r.user_id) as reactions,
        GROUP_CONCAT(DISTINCT rr.user_id) as read_by
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      LEFT JOIN reactions r ON r.message_id = m.id
      LEFT JOIN read_receipts rr ON rr.message_id = m.id
      WHERE m.channel_id = 'general' 
      GROUP BY m.id
      ORDER BY m.created_at DESC 
      LIMIT 50
    `
  });
  socket.emit('previous-messages', channelMessages.rows.reverse());
  
  // Handle typing indicators
  socket.on('typing', ({ receiverId }) => {
    const key = receiverId || 'general';
    let typing = typingUsers.get(key) || new Set();
    typing.add(user.username);
    typingUsers.set(key, typing);
    
    if (receiverId) {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing-users', Array.from(typing));
      }
    } else {
      io.emit('typing-users', Array.from(typing));
    }
  });

  socket.on('stop-typing', ({ receiverId }) => {
    const key = receiverId || 'general';
    let typing = typingUsers.get(key) || new Set();
    typing.delete(user.username);
    typingUsers.set(key, typing);
    
    if (receiverId) {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing-users', Array.from(typing));
      }
    } else {
      io.emit('typing-users', Array.from(typing));
    }
  });

  // Handle reactions
  socket.on('add-reaction', async ({ messageId, emoji }) => {
    try {
      await db.execute({
        sql: 'INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)',
        args: [messageId, userId, emoji]
      });
      
      const reactions = await db.execute({
        sql: `
          SELECT r.emoji, COUNT(*) as count, GROUP_CONCAT(u.username) as users
          FROM reactions r
          JOIN users u ON r.user_id = u.id
          WHERE r.message_id = ?
          GROUP BY r.emoji
        `,
        args: [messageId]
      });
      
      io.emit('message-reactions', { messageId, reactions: reactions.rows });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  });

  socket.on('remove-reaction', async ({ messageId, emoji }) => {
    try {
      await db.execute({
        sql: 'DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
        args: [messageId, userId, emoji]
      });
      
      const reactions = await db.execute({
        sql: `
          SELECT r.emoji, COUNT(*) as count, GROUP_CONCAT(u.username) as users
          FROM reactions r
          JOIN users u ON r.user_id = u.id
          WHERE r.message_id = ?
          GROUP BY r.emoji
        `,
        args: [messageId]
      });
      
      io.emit('message-reactions', { messageId, reactions: reactions.rows });
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  });

  // Handle read receipts
  socket.on('mark-as-read', async ({ messageId }) => {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)',
        args: [messageId, userId]
      });
      
      const readBy = await db.execute({
        sql: `
          SELECT u.username
          FROM read_receipts r
          JOIN users u ON r.user_id = u.id
          WHERE r.message_id = ?
        `,
        args: [messageId]
      });
      
      io.emit('message-read', { 
        messageId, 
        readBy: readBy.rows.map(row => row.username)
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });
  
  // Handle new messages
  socket.on('send-message', async ({ content, receiverId, fileUrl, fileName }) => {
    const message = {
      content,
      sender_id: userId,
      receiver_id: receiverId || null,
      channel_id: receiverId ? null : 'general',
      file_url: fileUrl || null,
      file_name: fileName || null,
      created_at: new Date()
    };
    
    const result = await db.execute({
      sql: `INSERT INTO messages (content, sender_id, receiver_id, channel_id, file_url, file_name) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [message.content, message.sender_id, message.receiver_id, message.channel_id, message.file_url, message.file_name]
    });
    
    const fullMessage = {
      ...message,
      id: result.lastInsertId,
      username: user.username,
      avatar: user.avatar,
      reactions: [],
      readBy: []
    };
    
    if (receiverId) {
      // Private message
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new-message', fullMessage);
      }
      socket.emit('new-message', fullMessage);
    } else {
      // Channel message
      io.emit('new-message', fullMessage);
    }
  });
  
  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    // Remove user from typing indicators
    for (const [key, typing] of typingUsers.entries()) {
      if (typing.delete(user.username)) {
        if (key === 'general') {
          io.emit('typing-users', Array.from(typing));
        } else {
          const receiverSocketId = connectedUsers.get(key);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing-users', Array.from(typing));
          }
        }
      }
    }
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});