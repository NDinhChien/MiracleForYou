import '../../../database/mock';
import '../../../cache/mock';
import {
  mockFindPrivateInfoByEmail,
  mockLA_Add,
  compareSpy,
  mockLogUser,
  mockLA_Remove,
  ID,
  EMAIL,
  PSW,
} from './mock';

import app from '../../../../src/app';
import supertest from 'supertest';
import { Types } from 'mongoose';
import { rule } from '../../../../src/config';
import { ForbiddenError } from '../../../../src/core/ApiError';

describe('/login - validation', () => {
  const endpoint = '/login';
  const request = supertest(app);
  mockFindPrivateInfoByEmail.mockReturnValue(Promise.resolve(null));

  it(`if there is no email, it should throw 'email is required'`, async () => {
    const response = await request.post(endpoint).send({
      password: '000000',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email is required/);
  });

  it(`if there is no password, it should throw 'password is required'`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password is required/);
  });

  it(`if there is unneeded fields, it should throw 'field is not allowed'`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
      code: '123456',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/is not allowed/);
  });

  it(`if password is shorter than 6 characters, it should throw 'at least 6 characters long'`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '00000',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/at least 6 characters long/);
  });

  it(`if password is longer than 30 characters, it should throw 'less than or equal to 30 characters long'`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: 'a'.repeat(31),
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      /less than or equal to 30 characters long/,
    );
  });

  it(`if password contains special characters not included in [#$@&%], it should throw 'can only contain ...'`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: 'abcdef**',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/can only contain/);
  });

  it(`if email has invalid form, it should throw 'not a valid email'`, async () => {
    const response = await request.post(endpoint).send({
      email: 'user12345',
      password: '000000',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/a valid email/);
  });

  it(`if email is valid and password contains special characters included in [#$@&%], validation should be successful`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '#%&$@aaaa',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/not exist/);
  });

  it(`if email is valid and password contain alphanumeric characters, validation should be successfull`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/not exist/);
  });
});

describe('/login - login unit test', () => {
  const endpoint = '/login';
  const request = supertest(app);

  beforeEach(() => {
    mockFindPrivateInfoByEmail.mockClear();
    mockLA_Add.mockClear();
    compareSpy.mockClear();
    mockLogUser.mockClear();
    mockLA_Remove.mockClear();
  });

  it(`if there is no user exists, it should throw 'does not exist'`, async () => {
    mockFindPrivateInfoByEmail.mockReturnValue(Promise.resolve(null));
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/exist/);
    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).not.toBeCalled();
    expect(compareSpy).not.toBeCalled();
    expect(mockLogUser).not.toBeCalled();
    expect(mockLA_Remove).not.toBeCalled();
  });

  it(`if there is one whose status is false, it should throw 'currently invalid'`, async () => {
    mockFindPrivateInfoByEmail.mockReturnValue(
      Promise.resolve({ _id: ID, email: EMAIL, password: PSW, status: false }),
    );

    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/currently invalid/);
    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).not.toBeCalled();
    expect(compareSpy).not.toBeCalled();
    expect(mockLogUser).not.toBeCalled();
    expect(mockLA_Remove).not.toBeCalled();
  });

  it(`if there is valid one and you login the first time with wrong password, it should inform 'Invalid password - ${
    rule.login.maxTryTime - 1
  } times left to try`, async () => {
    mockFindPrivateInfoByEmail.mockReturnValue(
      Promise.resolve({ _id: ID, email: EMAIL, password: PSW, status: true }),
    );
    mockLA_Add.mockReturnValue(Promise.resolve(rule.login.maxTryTime - 1));
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 1} times left`),
    );
    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).toBeCalledTimes(1);
    expect(mockLA_Add).toBeCalledWith(ID);
    expect(compareSpy).toBeCalledTimes(1);
    expect(mockLogUser).not.toBeCalled();
    expect(mockLA_Remove).not.toBeCalled();
  });

  it(`if you enter the wrong password again, it should response 'Invalid password - ${
    rule.login.maxTryTime - 2
  } times left to try'`, async () => {
    mockLA_Add.mockReturnValue(Promise.resolve(rule.login.maxTryTime - 2));
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 2} times left`),
    );
    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).toBeCalledTimes(1);
    expect(mockLA_Add).toBeCalledWith(ID);
    expect(compareSpy).toBeCalledTimes(1);
    expect(mockLogUser).not.toBeCalled();
    expect(mockLA_Remove).not.toBeCalled();
  });

  it(`if you enter the wrong password another time, it should response 'Invalid password - ${
    rule.login.maxTryTime - 3
  } times left to try'`, async () => {
    mockLA_Add.mockReturnValue(Promise.resolve(rule.login.maxTryTime - 3));
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 3} times left`),
    );
    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).toBeCalledTimes(1);
    expect(mockLA_Add).toBeCalledWith(ID);
    expect(compareSpy).toBeCalledTimes(1);
    expect(mockLogUser).not.toBeCalled();
    expect(mockLA_Remove).not.toBeCalled();
  });
  it(`if you still login with wrong password, it should inform 'maximum try time'`, async () => {
    mockLA_Add.mockImplementation(async (id: Types.ObjectId) => {
      throw new ForbiddenError(
        `Entered wrong password for ${
          rule.login.maxTryTime
        } times in sequence, you can reset password or try later after ${new Date(
          Date.now() + rule.login.renewDuration * 1000,
        )}`,
      );
    });

    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(
      new RegExp(
        `wrong password for ${rule.login.maxTryTime} times in sequence`,
      ),
    );
    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).toBeCalledTimes(1);
    expect(mockLA_Add).toBeCalledWith(ID);
    expect(compareSpy).not.toBeCalled();
    expect(mockLogUser).not.toBeCalled();
    expect(mockLA_Remove).not.toBeCalled();
  });
  it(`if you enter the right password, you should receive your user info and tokens respectively`, async () => {
    mockFindPrivateInfoByEmail.mockReturnValue(
      Promise.resolve({
        _id: ID,
        email: EMAIL,
        password: PSW,
        status: true,
        roles: [{ _id: new Types.ObjectId(), code: 'LEARNER', status: true }],
      }),
    );
    mockLA_Add.mockReturnValue(Promise.resolve(rule.login.maxTryTime - 1));
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '12345678' });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Login successfully/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user).toHaveProperty('_id');
    expect(response.body.data.user).toHaveProperty('roles');
    expect(response.body.data.tokens).toBeDefined();
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');

    expect(mockFindPrivateInfoByEmail).toBeCalledTimes(1);
    expect(mockFindPrivateInfoByEmail).toBeCalledWith(EMAIL);
    expect(mockLA_Add).toBeCalledTimes(1);
    expect(mockLA_Add).toBeCalledWith(ID);
    expect(compareSpy).toBeCalledTimes(1);
    expect(mockLogUser).toBeCalledTimes(1);
    expect(mockLA_Remove).toBeCalledTimes(1);
  });
});
