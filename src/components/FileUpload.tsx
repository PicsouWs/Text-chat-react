import React, { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClearFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-gray-400 hover:text-gray-100 transition-colors"
      >
        <Paperclip className="w-6 h-6" />
      </button>

      {selectedFile && (
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded">
          <span className="text-sm text-gray-300 truncate max-w-[200px]">
            {selectedFile.name}
          </span>
          <button
            type="button"
            onClick={onClearFile}
            className="text-gray-400 hover:text-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}