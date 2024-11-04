import React from 'react';
import { Hash, Users, Bell, Pin, Search } from 'lucide-react';

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center gap-2">
        <Hash className="w-6 h-6 text-gray-400" />
        <h2 className="font-semibold text-gray-100">general</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-100 transition-colors">
          <Pin className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-100 transition-colors">
          <Users className="w-5 h-5" />
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-900 text-gray-100 px-3 py-1 rounded-md text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}