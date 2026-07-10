import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function normalizeApiErrorMessage(message: ApiErrorBody['message']): string {
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return message;
}
