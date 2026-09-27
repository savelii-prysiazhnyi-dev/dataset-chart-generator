import type { FastifyInstance } from 'fastify';

import type {
  DatasetChartType,
  DatasetGenerationResult,
} from '../../commons/interfaces/dataset/dataset.interface.js';
import { parseFile } from './parseFile.js';
import { buildChartOption } from './buildChartOption.js';

export class DatasetService {
  constructor(private readonly app: FastifyInstance) {}

  async generate(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
    chartType: DatasetChartType,
    xField: string | undefined,
    yField: string | undefined,
  ): Promise<DatasetGenerationResult> {
    const dataset = await parseFile(this.app, fileBuffer, filename, mimetype);

    if (dataset.fields.length < 2) {
      throw this.app.httpErrors.badRequest('Dataset must have at least two columns');
    }

    const { option, resolved } = buildChartOption(
      dataset,
      chartType,
      xField,
      yField,
    );

    const chartData = { option };

    return {
      chartData,
      fields: dataset.fields,
      selectedType: chartType,
      selectedXField: resolved.xField,
      selectedYField: resolved.yField,
      truncated: dataset.truncated,
      datasetInfo: {
        fileName: filename,
        mimeType: mimetype,
        fileSize: fileBuffer.length,
      },
    };
  }
}
