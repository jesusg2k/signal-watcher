import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { APIResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.correlationId;

  logger.error('Request error', {
    correlationId,
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = `Database error: ${error.message}`;
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.name.includes('Prisma')) {
    statusCode = 500;
    message = `Prisma error: ${error.message}`;
  }

  const response: APIResponse = {
    success: false,
    error: message,
    correlationId
  };

  res.status(statusCode).json(response);
};