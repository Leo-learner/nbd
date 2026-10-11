export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
    public requestId?: string,
    public retryAfter = 0,
  ) {
    super(message);
  }
}
