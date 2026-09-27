import type { FastifyRequest } from 'fastify';
import type { ZodType } from 'zod';

type RequestSource = 'body' | 'params' | 'query';

export interface AppHttpError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const validateRequest = <T>(
  request: FastifyRequest,
  schema: ZodType<T>,
  errorMessage: string,
  source: RequestSource = 'body',
): T => {
  const parseResult = schema.safeParse(request[source]);

  if (!parseResult.success) {
    const error = request.server.httpErrors.badRequest(
      errorMessage,
    ) as AppHttpError;
    error.details = parseResult.error.issues;
    throw error;
  }

  return parseResult.data;
};

export default validateRequest;
