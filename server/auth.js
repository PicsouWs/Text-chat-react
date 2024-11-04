import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

export async function registerUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = `https://api.dicebear.com/7.x/avatars/svg?seed=${username}`;
  
  const result = await db.execute({
    sql: 'INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)',
    args: [username, hashedPassword, avatar]
  });
  
  return generateToken(result.lastInsertId);
}

export async function loginUser(username, password) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [username]
  });
  
  const user = result.rows[0];
  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new Error('Invalid credentials');
  }
  
  return generateToken(user.id);
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}