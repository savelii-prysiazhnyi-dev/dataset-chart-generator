import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type FastifyServerOptions,
} from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import sensible from '@fastify/sensible';

import { env } from './config/env.js';
import { chartRoutes } from './routes/chart.routes.js';
import type { AppHttpError } from './utils/validateRequest.js';

export const buildApp = async (
  opts: FastifyServerOptions = {},
): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    trustProxy: true,
    ...opts,
  });

  // Global Error handler
  app.setErrorHandler(
    (error: AppHttpError, request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 500) {
        request.log.error({ err: error }, 'Internal server error occurred');
      }
      reply.status(statusCode).send({
        message: statusCode < 500 ? error.message : 'Internal server error',
        details: error.details ?? undefined,
      });
    },
  );

  // Sensible utilities & HTTP errors
  await app.register(sensible);

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Multipart file uploads (max 5 MB)
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
  });

  // Health check endpoints
  const healthHandler = async () => ({
    status: 'ok',
    service: 'dataset-chart-generation-backend',
    timestamp: new Date().toISOString(),
  });
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Register chart routes under both /chart and /api/chart
  await app.register(chartRoutes, { prefix: '/chart' });
  await app.register(chartRoutes, { prefix: '/api/chart' });

  return app;
};

export default buildApp;
