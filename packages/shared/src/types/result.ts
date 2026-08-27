export type Result<T> =
  | { success: true; data: T }
  | { success: false; code: string; message: string; retryable?: boolean }
