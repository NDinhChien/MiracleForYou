import { UserModel } from '../../../../src/database/model/User';
import { KeyModel } from '../../../../src/database/model/Key';
import { EmailCodeModel } from '../../../../src/database/model/EmailCode';
import UserRepo from '../../../../src/database/repository/UserRepo';
import ECodeRepo from '../../../../src/database/repository/ECodeRepo';
import KeyRepo from '../../../../src/database/repository/KeyRepo';
import { rule } from '../../../../src/config';
import { connection } from '../../../../src/database';
import cache from '../../../../src/cache';
import supertest from 'supertest';
import app from '../../../../src/app';

const EMAIL = 'user010101@gmail.com';
const emailExistSpy = jest.spyOn(UserRepo, 'exists');
const findVerifiedEmailSpy = jest.spyOn(ECodeRepo, 'findVerifiedEmail');
const createUserSpy = jest.spyOn(UserRepo, 'create');
const logUserSpy = jest.spyOn(KeyRepo, 'logUser');
const removeECodeSpy = jest.spyOn(ECodeRepo, 'remove');

describe(`/signup - integration test`, () => {
  const endpoint = '/signup';
  const request = supertest(app);

  beforeAll(async () => {
    await KeyModel.deleteMany({});
    await UserModel.deleteMany({});
    await EmailCodeModel.deleteMany({});
  });
  afterAll(async () => {
    await KeyModel.deleteMany({});
    await UserModel.deleteMany({});
    await EmailCodeModel.deleteMany({});
    await connection.close();
    await cache.disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`if email is not registered and has not been verified yet, it should throw 'verify email first'`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
    });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/verify your email first/);
    expect(emailExistSpy).toBeCalledTimes(1);
    expect(findVerifiedEmailSpy).toBeCalledTimes(1);
    expect(findVerifiedEmailSpy).toBeCalledWith(EMAIL);

    expect(createUserSpy).not.toBeCalled();
    expect(logUserSpy).not.toBeCalled();
    expect(removeECodeSpy).not.toBeCalled();
  });

  it(`if email is not registered and has been verified for over VALID_IN so far, it should throw 'verify email again' `, async () => {
    const someTimeAgo = new Date(Date.now() - rule.email.validIn * 1000);
    await EmailCodeModel.create({
      email: EMAIL,
      code: '000000',
      verified: true,
      updatedAt: someTimeAgo,
    });
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
    });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/verify your email again/);
    expect(emailExistSpy).toBeCalledTimes(1);
    expect(findVerifiedEmailSpy).toBeCalledTimes(1);
    expect(findVerifiedEmailSpy).toBeCalledWith(EMAIL);

    expect(createUserSpy).not.toBeCalled();
    expect(logUserSpy).not.toBeCalled();
    expect(removeECodeSpy).not.toBeCalled();
  });
  it(`if email is not registered and has been just verified recently, then registration should be successfull`, async () => {
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      { verified: true, updatedAt: new Date() },
    );
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Signup successfully/);
    expect(emailExistSpy).toBeCalledTimes(1);
    expect(findVerifiedEmailSpy).toBeCalledTimes(1);
    expect(createUserSpy).toBeCalledTimes(1);
    expect(logUserSpy).toBeCalledTimes(1);
    expect(removeECodeSpy).toBeCalledTimes(1);

    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user).toHaveProperty('_id');
    expect(response.body.data.user).toHaveProperty('email');
    expect(response.body.data.user).toHaveProperty('name');
    expect(response.body.data.user).toHaveProperty('roles');

    expect(response.body.data.tokens).toBeDefined();
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');
  });

  it(`if email has already registered, it should throw 'user has already existed`, async () => {
    const response = await request.post(endpoint).send({
      email: EMAIL,
      password: '000000',
    });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch('has already existed');
    expect(emailExistSpy).toBeCalledTimes(1);
    expect(emailExistSpy).toBeCalledWith(EMAIL);

    expect(findVerifiedEmailSpy).not.toBeCalled();
    expect(createUserSpy).not.toBeCalled();
    expect(logUserSpy).not.toBeCalled();
    expect(removeECodeSpy).not.toBeCalled();
  });
});
