import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { Sidebar } from './Sidebar';
import { UserList } from './UserList';

interface User {
  id: number;
  username: string;
  avatar: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number | null;
  username: string;
  avatar: string;
  created_at: string;
}

interface ChatProps {
  token: string;
  onLogout: () => void;
}

export function Chat({ token, onLogout }: ChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect_error', (err) => {
      if (err.message === 'Authentication error') {
        onLogout();
      }
    });

    newSocket.on('users', (userList: User[]) => {
      setUsers(userList);
    });

    newSocket.on('previous-messages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, onLogout]);

  const handleSendMessage = (content: string) => {
    if (socket) {
      socket.emit('send-message', {
        content,
        receiverId: selectedUser?.id
      });
    }
  };

  const filteredMessages = messages.filter(message => 
    !selectedUser ? !message.receiver_id :
    (message.sender_id === selectedUser.id && !message.receiver_id) ||
    (message.sender_id === selectedUser.id && message.receiver_id === socket?.userId) ||
    (message.sender_id === socket?.userId && message.receiver_id === selectedUser.id)
  );

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          selectedUser={selectedUser} 
          onBack={() => setSelectedUser(null)} 
        />
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {filteredMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    username={message.username}
                    timestamp={new Date(message.created_at)}
                    avatar={message.avatar}
                    isPrivate={!!message.receiver_id}
                  />
                ))}
              </div>
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
          {!selectedUser && (
            <UserList 
              users={users} 
              onSelectUser={setSelectedUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}