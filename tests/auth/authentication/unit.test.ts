import '../../database/mock';
import '../../cache/mock';
import { addAuthHeaders } from '../utils';
import {
  LEARNER_ACCESS_TOKEN,
  mockJwtValidate,
  mockFindKeyById,
  mockFindPrivateInfoById,
} from './mock';

import * as authUtils from '../../../src/auth/utils';

import { Types } from 'mongoose';
import { JwtPayload } from '../../../src/core/JWT';
import { BadTokenError, TokenExpiredError } from '../../../src/core/ApiError';
import app from '../../../src/app';
import supertest from 'supertest';

const endpoint = '/logout/abc';
const request = supertest(app);
const getAccessTokenSpy = jest.spyOn(authUtils, 'getAccessToken');
const validateTokenDataSpy = jest.spyOn(authUtils, 'validateTokenData');

describe('authentication - unit test', () => {
  beforeEach(() => {
    getAccessTokenSpy.mockClear();
    mockJwtValidate.mockClear();
    validateTokenDataSpy.mockClear();
    mockFindKeyById.mockClear();
    mockFindPrivateInfoById.mockClear();
  });

  it(`if the access token is invalid, it should throw 'token is not valid'`, async () => {
    mockJwtValidate.mockImplementationOnce(async (token: string) => {
      throw new BadTokenError();
    });
    const response = await addAuthHeaders(
      request.delete(endpoint),
      'abcdef12345',
    );
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Token is not valid/i);
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledTimes(1);

    expect(validateTokenDataSpy).not.toBeCalled();
    expect(mockFindKeyById).not.toBeCalled();
    expect(mockFindPrivateInfoById).not.toBeCalled();
  });

  it(`if the access token is expired, it should throw 'token is expired'`, async () => {
    mockJwtValidate.mockImplementationOnce(async (token: string) => {
      throw new TokenExpiredError();
    });
    const response = await addAuthHeaders(
      request.delete(endpoint),
      'abcdef12345',
    );
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token is expired/i);
    expect(response.headers).toHaveProperty('instruction');
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledTimes(1);

    expect(validateTokenDataSpy).not.toBeCalled();
    expect(mockFindKeyById).not.toBeCalled();
    expect(mockFindPrivateInfoById).not.toBeCalled();
  });

  it(`if the payload has any invalid field, it should throw 'invalid access token'`, async () => {
    validateTokenDataSpy.mockImplementationOnce((payload: JwtPayload) => {
      throw new BadTokenError('Invalid Access Token');
    });

    const response = await addAuthHeaders(
      request.delete(endpoint),
      LEARNER_ACCESS_TOKEN,
    );
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid access token/i);
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledTimes(1);
    expect(validateTokenDataSpy).toBeCalledTimes(1);
    expect(mockFindKeyById).not.toBeCalled();
    expect(mockFindPrivateInfoById).not.toBeCalled();
  });

  it(`if there is no key associated with sub field in keys collection, it should throw 'key does not exist'`, async () => {
    mockFindKeyById.mockImplementationOnce(async (id: Types.ObjectId) => {
      return null;
    });
    const response = await addAuthHeaders(
      request.delete(endpoint),
      LEARNER_ACCESS_TOKEN,
    );
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/key does not exist/i);
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledTimes(1);
    expect(validateTokenDataSpy).toBeCalledTimes(1);

    expect(mockFindKeyById).toBeCalledTimes(1);
    expect(mockFindPrivateInfoById).not.toBeCalled();
  });

  it(`if the access key is valid, user should be authenticated successfully`, async () => {
    const response = await addAuthHeaders(
      request.delete(endpoint),
      LEARNER_ACCESS_TOKEN,
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledTimes(1);
    expect(validateTokenDataSpy).toBeCalledTimes(1);
    expect(mockFindKeyById).toBeCalledTimes(1);
    expect(mockFindPrivateInfoById).toBeCalledTimes(1);
  });
});

describe('authentication - validation', () => {
  beforeEach(() => {
    getAccessTokenSpy.mockClear();
    mockJwtValidate.mockClear();
  });
  it(`if there is no authorization header, it should throw 'authorization is required'`, async () => {
    const response = await request.delete(endpoint);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/is required/i);
    expect(getAccessTokenSpy).not.toBeCalled();
  });

  it(`if authorization hearder does not start with 'Bearer ', it should throw 'must be like Bearer <token>'`, async () => {
    const response = await request
      .delete(endpoint)
      .set('authorization', 'abcde');
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/must be like/i);
    expect(getAccessTokenSpy).not.toBeCalled();
  });
  it(`if the authorization header starts with 'Bearer ' but not have token string, it should throw 'must be like Bearer <token>'`, async () => {
    const response = await request
      .delete(endpoint)
      .set('authorization', 'Bearer ');
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/must be like/i);
    expect(getAccessTokenSpy).not.toBeCalled();
  });

  it(`if the authorization header is valid, it should be validated successfully`, async () => {
    const response = await addAuthHeaders(request.delete(endpoint), 'abc');
    expect(getAccessTokenSpy).toBeCalledTimes(1);
    expect(mockJwtValidate).toBeCalledTimes(1);
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/not valid/i);
  });
});
