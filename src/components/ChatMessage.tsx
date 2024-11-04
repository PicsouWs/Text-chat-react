import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Download } from 'lucide-react';
import { MessageReactions } from './MessageReactions';
import { ReadReceipt } from './ReadReceipt';

interface ChatMessageProps {
  content: string;
  username: string;
  timestamp: Date;
  avatar: string;
  isPrivate?: boolean;
  fileUrl?: string;
  fileName?: string;
  reactions: {
    emoji: string;
    count: number;
    users: string[];
    hasReacted: boolean;
  }[];
  isRead: boolean;
  readBy: string[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export function ChatMessage({
  content,
  username,
  timestamp,
  avatar,
  isPrivate,
  fileUrl,
  fileName,
  reactions,
  isRead,
  readBy,
  onAddReaction,
  onRemoveReaction
}: ChatMessageProps) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50/5 group">
      <img
        src={avatar}
        alt={username}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-100">{username}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
          {isPrivate && (
            <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
              Private
            </span>
          )}
        </div>
        
        <p className="text-gray-300 mt-1 break-words">{content}</p>
        
        {fileUrl && (
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-gray-700 rounded p-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">{fileName}</span>
              <a
                href={fileUrl}
                download
                className="p-1 hover:bg-gray-600 rounded transition-colors"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        <MessageReactions
          reactions={reactions}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ReadReceipt isRead={isRead} readBy={readBy} />
      </div>
    </div>
  );
}