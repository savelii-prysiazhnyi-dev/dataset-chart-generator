import type { DatasetChartType, DatasetGenerationResult } from '../types/dataset';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResult<T> {
  data?: T;
  errorMessage?: string;
  statusCode?: number;
}

export const chartService = {
  async generateFromDataset(
    file: File,
    chartType: DatasetChartType,
    xField?: string,
    yField?: string,
  ): Promise<ApiResult<DatasetGenerationResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chartType', chartType);
    if (xField) formData.append('xField', xField);
    if (yField) formData.append('yField', yField);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chart/generate-from-dataset`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          errorMessage: json.message || 'Failed to generate chart from dataset',
          statusCode: response.status,
        };
      }

      return {
        data: json as DatasetGenerationResult,
        statusCode: response.status,
      };
    } catch (err) {
      return {
        errorMessage: err instanceof Error ? err.message : 'Network error occurred',
        statusCode: 0,
      };
    }
  },
};

export default chartService;
