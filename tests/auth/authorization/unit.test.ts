import '../../database/mock';
import '../../cache/mock';
import { addAuthHeaders } from '../utils';
import { RoleCode } from '../../../src/database/model/Role';

import {
  ADMIN_ACCESS_TOKEN,
  LEARNER_ACCESS_TOKEN,
  mockFindPrivateInfoById,
} from '../authentication/mock';
import { mockFindByCodes } from './mock';

import app from '../../../src/app';
import supertest from 'supertest';

describe('authorization - unit test', () => {
  const endpoint = '/users/abc';
  const request = supertest(app);

  beforeEach(() => {
    mockFindPrivateInfoById.mockClear();
    mockFindByCodes.mockClear();
  });

  it(`if required roles are invalid, it should throw 'internall error'`, async () => {
    mockFindByCodes.mockImplementationOnce(async () => {
      return [];
    });
    const response = await addAuthHeaders(
      request.get(endpoint),
      LEARNER_ACCESS_TOKEN,
    );
    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal error/);
    expect(mockFindPrivateInfoById).toBeCalledTimes(1);
    expect(mockFindByCodes).toBeCalledTimes(1);
    expect(mockFindByCodes).toBeCalledWith([RoleCode.ADMIN]);
  });

  it(`if user don't have any of required roles, it should throw 'permission deny'`, async () => {
    const response = await addAuthHeaders(
      request.get(endpoint),
      LEARNER_ACCESS_TOKEN,
    );
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/denied/);
    expect(mockFindPrivateInfoById).toBeCalledTimes(1);
    expect(mockFindByCodes).toBeCalledTimes(1);
    expect(mockFindByCodes).toBeCalledWith([RoleCode.ADMIN]);
  });

  it(`if user have any of required roles, user should be authorized successfully`, async () => {
    const response = await addAuthHeaders(
      request.get(endpoint),
      ADMIN_ACCESS_TOKEN,
    );
    expect(response.status).toBe(404);
    expect(mockFindPrivateInfoById).toBeCalledTimes(1);
    expect(mockFindByCodes).toBeCalledTimes(1);
    expect(mockFindByCodes).toBeCalledWith([RoleCode.ADMIN]);
  });
});
