import { Response } from 'express';
import { environment } from '../config';
import {
  AuthFailureResponse,
  AccessTokenErrorResponse,
  InternalErrorResponse,
  NotFoundResponse,
  BadRequestResponse,
  ForbiddenResponse,
} from './ApiResponse';

export enum ErrorType {
  UNAUTHORIZED = 'AuthFailureError',
  FORBIDDEN = 'ForbiddenError',
  BAD_TOKEN = 'BadTokenError',
  ACCESS_TOKEN = 'AccessTokenError',
  TOKEN_EXPIRED = 'TokenExpiredError',
  BAD_REQUEST = 'BadRequestError',
  NOT_FOUND = 'NotFoundError',
  NO_ENTRY = 'NoEntryError',
  NO_DATA = 'NoDataError',
  INTERNAL = 'InternalError',
}

export abstract class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public msg: string,
  ) {
    super(type);
  }

  public static handle(err: ApiError, res: Response): Response {
    switch (err.type) {
      case ErrorType.UNAUTHORIZED:
      case ErrorType.BAD_TOKEN:
      case ErrorType.ACCESS_TOKEN:
        return new AuthFailureResponse(err.msg).send(res);
      case ErrorType.TOKEN_EXPIRED:
        return new AccessTokenErrorResponse(err.msg).send(res);
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.msg).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.msg).send(res);
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_ENTRY:
      case ErrorType.NO_DATA:
        return new NotFoundResponse(err.msg).send(res);
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.msg).send(res);
      default: {
        let msg = err.msg;
        if (environment === 'production') msg = 'Something wrong happened.';
        return new InternalErrorResponse(msg).send(res);
      }
    }
  }
}

export class AuthFailureError extends ApiError {
  constructor(message = 'Invalid Credentials') {
    super(ErrorType.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied') {
    super(ErrorType.FORBIDDEN, message);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(message = 'Token is expired') {
    super(ErrorType.TOKEN_EXPIRED, message);
  }
}

export class BadTokenError extends ApiError {
  constructor(message = 'Token is not valid') {
    super(ErrorType.BAD_TOKEN, message);
  }
}

export class AccessTokenError extends ApiError {
  constructor(message = 'Invalid access token') {
    super(ErrorType.ACCESS_TOKEN, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(ErrorType.BAD_REQUEST, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(ErrorType.NOT_FOUND, message);
  }
}

export class NoEntryError extends ApiError {
  constructor(message = "Entry don't exists") {
    super(ErrorType.NO_ENTRY, message);
  }
}

export class NoDataError extends ApiError {
  constructor(message = 'No data available') {
    super(ErrorType.NO_DATA, message);
  }
}

export class InternalError extends ApiError {
  constructor(message = 'Internal error') {
    super(ErrorType.INTERNAL, message);
  }
}
