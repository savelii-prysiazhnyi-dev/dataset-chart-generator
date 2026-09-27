import React from 'react';
import { BarChart2, TrendingUp, PieChart, Activity } from 'lucide-react';
import type { DatasetChartType } from '../../types/dataset';

interface ChartTypeSelectorProps {
  currentType: DatasetChartType;
  onSelect: (type: DatasetChartType) => void;
  disabled?: boolean;
}

const CHART_TYPES: {
  type: DatasetChartType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: 'bar', label: 'Bar', icon: BarChart2 },
  { type: 'line', label: 'Line', icon: TrendingUp },
  { type: 'pie', label: 'Pie', icon: PieChart },
  { type: 'scatter', label: 'Scatter', icon: Activity },
];

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  currentType,
  onSelect,
  disabled = false,
}) => {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
        Chart Type
      </label>
      <div className="grid grid-cols-4 gap-2">
        {CHART_TYPES.map(({ type, label, icon: Icon }) => {
          const isActive = currentType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border-2 cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon strokeWidth={isActive ? 2 : 1.75} className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
