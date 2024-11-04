import React from 'react';
import { Users } from 'lucide-react';

interface User {
  id: number;
  username: string;
  avatar: string;
}

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export function UserList({ users, onSelectUser }: UserListProps) {
  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold">Online Users</h3>
        </div>
      </div>
      <div className="p-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm">{user.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}