import React, { useState, useEffect } from 'react';
import { Smile, Send } from 'lucide-react';
import { FileUpload } from './FileUpload';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export function ChatInput({ onSendMessage, onTyping, onStopTyping }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping();

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      onStopTyping();
    }, 1000);

    setTypingTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-lg mx-4 mb-4">
      <div className="flex items-center gap-3">
        <FileUpload
          onFileSelect={setSelectedFile}
          selectedFile={selectedFile}
          onClearFile={() => setSelectedFile(null)}
        />
        
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Send a message..."
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 outline-none"
        />

        <button
          type="button"
          className="text-gray-400 hover:text-gray-100 transition-colors"
        >
          <Smile className="w-6 h-6" />
        </button>

        <button
          type="submit"
          disabled={!message.trim() && !selectedFile}
          className="text-gray-400 hover:text-gray-100 transition-colors disabled:opacity-50"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
}