import { Response } from 'express';

// Helper code for the API consumer to understand the error and handle is accordingly
enum Status {
  SUCCESS = '10000',
  FAILURE = '10001',
  RETRY = '10002',
  INVALID_ACCESS_TOKEN = '10003',
}

enum ResponseStatus {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

abstract class ApiResponse {
  constructor(
    protected status: Status,
    protected responseStatus: ResponseStatus,
    protected message: string,
  ) {}

  public send(
    res: Response,
    headers: { [key: string]: string } = {},
  ): Response {
    return ApiResponse.prepare<ApiResponse>(res, headers, this);
  }

  protected static prepare<T extends ApiResponse>(
    res: Response,
    headers: { [key: string]: string },
    data: T,
  ): Response {
    for (const [key, value] of Object.entries(headers)) res.append(key, value);
    return res.status(data.responseStatus).json(ApiResponse.sanitize(data));
  }

  private static sanitize<T extends ApiResponse>(data: T): T {
    const clone: T = {} as T;
    Object.assign(clone, data);
    // @ts-ignore
    delete clone.responseStatus;
    for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i];
    return clone;
  }
}

export class AuthFailureResponse extends ApiResponse {
  constructor(message = 'Authentication Failure') {
    super(Status.FAILURE, ResponseStatus.UNAUTHORIZED, message);
  }
}
export class ForbiddenResponse extends ApiResponse {
  constructor(message = 'Forbidden') {
    super(Status.FAILURE, ResponseStatus.FORBIDDEN, message);
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  private instruction = 'refresh_token';

  constructor(message = 'Access token invalid') {
    super(Status.INVALID_ACCESS_TOKEN, ResponseStatus.UNAUTHORIZED, message);
  }

  override send(
    res: Response,
    headers: { [key: string]: string } = {},
  ): Response {
    headers.instruction = this.instruction;
    return ApiResponse.prepare<AccessTokenErrorResponse>(res, headers, this);
  }
}

export class TokenRefreshResponse extends ApiResponse {
  constructor(
    message: string,
    private accessToken: string,
    private refreshToken: string,
  ) {
    super(Status.SUCCESS, ResponseStatus.SUCCESS, message);
  }

  override send(
    res: Response,
    headers: { [key: string]: string } = {},
  ): Response {
    return ApiResponse.prepare<TokenRefreshResponse>(res, headers, this);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(message = 'Bad Parameters') {
    super(Status.FAILURE, ResponseStatus.BAD_REQUEST, message);
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(message = 'Not Found') {
    super(Status.FAILURE, ResponseStatus.NOT_FOUND, message);
  }
}

export class SuccessMsgResponse extends ApiResponse {
  constructor(message: string) {
    super(Status.SUCCESS, ResponseStatus.SUCCESS, message);
  }
}

export class SuccessResponse<T> extends ApiResponse {
  constructor(
    message: string,
    private data: T,
  ) {
    super(Status.SUCCESS, ResponseStatus.SUCCESS, message);
  }

  override send(
    res: Response,
    headers: { [key: string]: string } = {},
  ): Response {
    return ApiResponse.prepare<SuccessResponse<T>>(res, headers, this);
  }
}

export class FailureMsgResponse extends ApiResponse {
  constructor(message: string) {
    super(Status.FAILURE, ResponseStatus.SUCCESS, message);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(message = 'Internal Error') {
    super(Status.FAILURE, ResponseStatus.INTERNAL_ERROR, message);
  }
}
