import React, { useState } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface MessageReactionsProps {
  reactions: {
    emoji: string;
    count: number;
    users: string[];
    hasReacted: boolean;
  }[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export function MessageReactions({ reactions, onAddReaction, onRemoveReaction }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map(({ emoji, count, users, hasReacted }) => (
        <button
          key={emoji}
          onClick={() => hasReacted ? onRemoveReaction(emoji) : onAddReaction(emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm ${
            hasReacted ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'
          } hover:bg-gray-700 transition-colors`}
          title={users.join(', ')}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}
      
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 text-gray-400 hover:text-gray-300 transition-colors rounded-full hover:bg-gray-700"
        >
          <Smile className="w-4 h-4" />
        </button>
        
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-lg shadow-lg flex gap-1 z-10">
            {EMOJI_LIST.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onAddReaction(emoji);
                  setShowPicker(false);
                }}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}