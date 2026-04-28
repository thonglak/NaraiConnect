export class AppError extends Error {
  override readonly name = 'AppError';
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

export const errUnauthorized = (msg = 'Unauthorized') => new AppError('UNAUTHORIZED', msg, 401);
export const errForbidden = (msg = 'Forbidden') => new AppError('FORBIDDEN', msg, 403);
export const errNotFound = (msg = 'Not found') => new AppError('NOT_FOUND', msg, 404);
export const errConflict = (msg: string) => new AppError('CONFLICT', msg, 409);
export const errValidation = (msg: string) => new AppError('VALIDATION_ERROR', msg, 422);
