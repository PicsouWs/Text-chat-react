import React from 'react';
import { Hash, Volume2, Settings, Plus } from 'lucide-react';

export function Sidebar() {
  const channels = [
    { id: 1, name: 'general', type: 'text' },
    { id: 2, name: 'voice-chat', type: 'voice' },
    { id: 3, name: 'announcements', type: 'text' },
  ];

  return (
    <div className="w-60 bg-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">React Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Text Channels</span>
            <button className="hover:text-gray-100 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                className="flex items-center gap-2 w-full px-2 py-1 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors"
              >
                {channel.type === 'text' ? (
                  <Hash className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                <span>{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}