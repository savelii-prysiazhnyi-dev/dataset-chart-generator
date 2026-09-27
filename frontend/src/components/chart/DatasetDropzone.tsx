import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react';
import { formatFileSize, fileExtension } from '../../utils/formatters';

interface DatasetDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED = '.csv,.xlsx';
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export const DatasetDropzone: React.FC<DatasetDropzoneProps> = ({
  file,
  onFileSelect,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (incoming: File | null) => {
    setError(null);
    if (!incoming) {
      onFileSelect(null);
      return;
    }

    const ext = incoming.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setError('Unsupported file type. Please upload a CSV or XLSX file.');
      return;
    }

    if (incoming.size > MAX_FILE_BYTES) {
      setError('File exceeds maximum size of 5 MB.');
      return;
    }

    onFileSelect(incoming);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    if (droppedFile) validateAndSelect(droppedFile);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
        Dataset File
      </label>

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 outline-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isDragging
              ? 'border-gray-900 bg-gray-100/70 scale-[0.99]'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/50'
          }`}
        >
          <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5 pointer-events-none" />
          <span className="text-sm font-medium text-gray-700 pointer-events-none">
            Click to upload or drag &amp; drop
          </span>
          <span className="text-xs text-gray-400 mt-0.5 pointer-events-none">
            CSV or XLSX · max 5 MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            disabled={disabled}
            onChange={(e) => validateAndSelect(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                {fileExtension(file.name)} · {formatFileSize(file.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            disabled={disabled}
            title="Remove file"
            className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
