import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { DatasetField } from '../../types/dataset';
import { fieldBadgeColor } from '../../utils/formatters';

interface DetectedFieldsListProps {
  fields: DatasetField[];
  truncated?: boolean;
}

export const DetectedFieldsList: React.FC<DetectedFieldsListProps> = ({
  fields,
  truncated = false,
}) => {
  if (fields.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
          Detected Fields
        </label>
        <span className="text-xs text-gray-400">{fields.length} columns</span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {fields.map((field) => (
          <div
            key={field.name}
            className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <span className="font-mono text-xs text-gray-800 truncate" title={field.name}>
              {field.name}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                fieldBadgeColor[field.type] || fieldBadgeColor.string
              }`}
            >
              {field.type}
            </span>
          </div>
        ))}
      </div>

      {truncated && (
        <div className="mt-2.5 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Dataset exceeds 5,000 rows. Preview truncated to first 5,000 entries.</span>
        </div>
      )}
    </div>
  );
};
