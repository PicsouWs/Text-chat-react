import React from 'react';
import { Check } from 'lucide-react';

interface ReadReceiptProps {
  isRead: boolean;
  readBy: string[];
}

export function ReadReceipt({ isRead, readBy }: ReadReceiptProps) {
  if (!isRead) {
    return (
      <Check className="w-4 h-4 text-gray-500" />
    );
  }

  return (
    <div className="flex items-center gap-0.5" title={`Read by: ${readBy.join(', ')}`}>
      <Check className="w-4 h-4 text-blue-500" />
      <Check className="w-4 h-4 text-blue-500 -ml-3" />
    </div>
  );
}