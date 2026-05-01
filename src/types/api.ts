export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResult<T> {
  data?: T;
  error?: ApiError;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  error?: ApiError;
}
