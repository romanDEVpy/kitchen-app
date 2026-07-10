import { NextResponse } from 'next/server.js';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_CONFIGURATION_ERROR: 'SERVER_CONFIGURATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export class ApiError extends Error {
  constructor(code, message, status = 500, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function successResponse(data = {}, init = {}) {
  return NextResponse.json({ ok: true, data }, init);
}

export function errorResponse(code, message, status = 500, details = undefined) {
  const body = { ok: false, error: { code, message } };
  if (process.env.NODE_ENV !== 'production' && details) {
    body.error.details = details;
  }
  return NextResponse.json(body, { status });
}

export function handleApiError(error, context = 'api') {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      console.error(`[${context}] ${error.code}: ${error.message}`);
    }
    return errorResponse(error.code, error.message, error.status, error.details);
  }

  console.error(`[${context}] Unhandled error:`, error?.message || error);
  return errorResponse(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', 500);
}
