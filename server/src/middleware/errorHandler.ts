import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
    return;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Resource not found — invalid ID',
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
