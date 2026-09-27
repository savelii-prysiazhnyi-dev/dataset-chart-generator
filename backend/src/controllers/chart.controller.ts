import type { FastifyRequest } from 'fastify';

import type { DatasetChartType } from '../commons/interfaces/dataset/dataset.interface.js';
import { datasetGenerationRequestSchema } from '../commons/schemas/datasetGenerationRequest.schema.js';
import type { DatasetService } from '../services/dataset/index.js';
import { validateRequest } from '../utils/validateRequest.js';

export class ChartController {
  constructor(private readonly datasetService: DatasetService) {}

  async generateFromDataset(request: FastifyRequest) {
    const startedAt = performance.now();
    const fields: Record<string, string> = {};
    let fileBuffer: Buffer | null = null;
    let filename = '';
    let mimetype = '';

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        fileBuffer = await part.toBuffer();
        filename = part.filename;
        mimetype = part.mimetype;
      } else {
        if (part.fieldname in fields) {
          throw request.server.httpErrors.badRequest(
            `Duplicate field: ${part.fieldname}`,
          );
        }
        if (typeof part.value !== 'string') {
          throw request.server.httpErrors.badRequest(
            `Field ${part.fieldname} must be a string`,
          );
        }
        fields[part.fieldname] = part.value;
      }
    }

    if (!fileBuffer) {
      throw request.server.httpErrors.badRequest('File is required');
    }

    request.body = fields;
    const { chartType, xField, yField } = validateRequest(
      request,
      datasetGenerationRequestSchema,
      'Invalid request body',
    );

    const resolvedChartType: DatasetChartType = (chartType as DatasetChartType) ?? 'bar';

    const result = await this.datasetService.generate(
      fileBuffer,
      filename,
      mimetype,
      resolvedChartType,
      xField,
      yField,
    );

    request.log.info(
      {
        chartType: resolvedChartType,
        filename,
        durationMs: Math.round(performance.now() - startedAt),
      },
      'dataset chart generation completed',
    );

    return result;
  }
}
