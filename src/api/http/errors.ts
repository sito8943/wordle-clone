class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

class ApiValidationError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 400, payload);
    this.name = "ApiValidationError";
  }
}

class ApiNotFoundError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 404, payload);
    this.name = "ApiNotFoundError";
  }
}

class ApiConflictError extends ApiError {
  constructor(message: string, payload: unknown) {
    super(message, 409, payload);
    this.name = "ApiConflictError";
  }
}

class ApiNetworkError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ApiNetworkError";
    this.cause = cause;
  }
}

const buildApiError = (
  status: number,
  message: string,
  payload: unknown,
): ApiError => {
  if (status === 400) return new ApiValidationError(message, payload);
  if (status === 404) return new ApiNotFoundError(message, payload);
  if (status === 409) return new ApiConflictError(message, payload);
  return new ApiError(message, status, payload);
};

export {
  ApiError,
  ApiValidationError,
  ApiNotFoundError,
  ApiConflictError,
  ApiNetworkError,
  buildApiError,
};
