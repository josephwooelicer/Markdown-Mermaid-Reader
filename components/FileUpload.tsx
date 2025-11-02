import React, { useCallback, useState } from 'react';
import { UploadCloudIcon } from './icons/UploadCloudIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  return (
    <div className="max-w-2xl w-full text-center p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 mb-2">Markdown & Mermaid Renderer</h1>
        <p className="text-slate-400 text-lg">Upload a ZIP file containing your project to get started.</p>
      </div>
      
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ease-in-out ${
          isDragging 
            ? 'border-purple-500 bg-purple-900/20 scale-105' 
            : 'border-slate-700 hover:border-purple-500 bg-slate-800'
        }`}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
          aria-label="Upload zip file"
        />
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
            <UploadCloudIcon className="h-16 w-16 text-slate-500" />
          <p className="text-slate-400 text-base">
            <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop a ZIP file here.
          </p>
        </div>
      </div>
      
      {isLoading && <p className="mt-6 text-purple-400 animate-pulse font-medium">Processing your file...</p>}
      {error && (
        <div className="mt-6 text-red-300 bg-red-900/30 p-4 rounded-lg border border-red-500/50" role="alert">
            <p className="font-semibold">Upload Failed</p>
            <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};