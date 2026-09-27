import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

import { ChartController } from '../controllers/chart.controller.js';
import { DatasetService } from '../services/dataset/index.js';

export const chartRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const datasetService = new DatasetService(app);
  const chartController = new ChartController(datasetService);

  app.post(
    '/generate-from-dataset',
    chartController.generateFromDataset.bind(chartController),
  );
};
