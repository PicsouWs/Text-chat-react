import React from 'react';

interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0]} is typing...`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing...`
    : `${users[0]} and ${users.length - 1} others are typing...`;

  return (
    <div className="px-4 py-2 text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
        {text}
      </div>
    </div>
  );
}