import React from 'react';
import type { DatasetChartType, DatasetField } from '../../types/dataset';
import { xAxisLabel, yAxisLabel } from '../../utils/formatters';

interface FieldSelectorsProps {
  fields: DatasetField[];
  chartType: DatasetChartType;
  xField: string;
  yField: string;
  onSelectX: (field: string) => void;
  onSelectY: (field: string) => void;
  disabled?: boolean;
}

export const FieldSelectors: React.FC<FieldSelectorsProps> = ({
  fields,
  chartType,
  xField,
  yField,
  onSelectX,
  onSelectY,
  disabled = false,
}) => {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
        Axis Field Mapping
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {/* X Field */}
        <div>
          <span className="text-xs text-gray-600 font-medium mb-1 block">
            {xAxisLabel(chartType)}
          </span>
          <select
            value={xField}
            disabled={disabled}
            onChange={(e) => onSelectX(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.type})
              </option>
            ))}
          </select>
        </div>

        {/* Y Field */}
        <div>
          <span className="text-xs text-gray-600 font-medium mb-1 block">
            {yAxisLabel(chartType)}
          </span>
          <select
            value={yField}
            disabled={disabled}
            onChange={(e) => onSelectY(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.type})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
