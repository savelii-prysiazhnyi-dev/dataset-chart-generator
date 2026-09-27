import type { DatasetChartType, DatasetFieldType } from '../types/dataset';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const fileExtension = (name: string): string =>
  name.split('.').pop()?.toUpperCase() ?? '';

export const fieldBadgeColor: Record<DatasetFieldType, string> = {
  number: 'bg-blue-100 text-blue-700 border-blue-200',
  string: 'bg-gray-100 text-gray-700 border-gray-200',
  boolean: 'bg-purple-100 text-purple-700 border-purple-200',
  date: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  mixed: 'bg-amber-100 text-amber-700 border-amber-200',
};

export const xAxisLabel = (chartType: DatasetChartType): string => {
  if (chartType === 'pie') return 'Slice Name field';
  if (chartType === 'scatter') return 'X Axis (numeric)';
  return 'Category / X Axis';
};

export const yAxisLabel = (chartType: DatasetChartType): string => {
  if (chartType === 'pie') return 'Slice Value field';
  if (chartType === 'scatter') return 'Y Axis (numeric)';
  return 'Value / Y Axis';
};
