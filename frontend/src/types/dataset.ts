export type DatasetChartType = 'bar' | 'line' | 'pie' | 'scatter';

export type DatasetFieldType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'date'
  | 'mixed';

export interface DatasetField {
  name: string;
  type: DatasetFieldType;
}

export interface DatasetInfo {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface ChartConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: Record<string, any>;
}

export interface DatasetGenerationResult {
  chartData: ChartConfig;
  fields: DatasetField[];
  selectedType: DatasetChartType;
  selectedXField: string;
  selectedYField: string;
  truncated: boolean;
  datasetInfo: DatasetInfo;
}
