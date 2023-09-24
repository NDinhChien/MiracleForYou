import User, { UserModel } from '../../../../src/database/model/User';
import { KeyModel } from '../../../../src/database/model/Key';
import { LAModel } from '../../../../src/database/model/LoginAttempt';
import { RoleCode } from '../../../../src/database/model/Role';
import RoleRepo from '../../../../src/database/repository/RoleRepo';
import UserRepo from '../../../../src/database/repository/UserRepo';
import LARepo from '../../../../src/database/repository/LARepo';
import KeyRepo from '../../../../src/database/repository/KeyRepo';
import bcrypt from 'bcrypt';
import { rule } from '../../../../src/config';
import { connection } from '../../../../src/database';
import cache from '../../../../src/cache';
import supertest from 'supertest';
import app from '../../../../src/app';

const findPrivateInfoByEmailSpy = jest.spyOn(
  UserRepo,
  'findPrivateInfoByEmail',
);
const addSpy = jest.spyOn(LARepo, 'add');
const compareSpy = jest.spyOn(bcrypt, 'compare');
const logUserSpy = jest.spyOn(KeyRepo, 'logUser');
const removeSpy = jest.spyOn(LARepo, 'remove');

describe('/login - integration test', () => {
  const endpoint = '/login';
  const request = supertest(app);
  const EMAIL = 'user0101@gmail.com';
  const PSW = bcrypt.hashSync('12345678', 10);
  let user: User | null = null;

  beforeAll(async () => {
    await KeyModel.deleteMany({});
    await LAModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await KeyModel.deleteMany({});
    await LAModel.deleteMany({});
    await UserModel.deleteMany({});
    await connection.close();
    await cache.disconnect();
  });

  beforeEach(() => {
    findPrivateInfoByEmailSpy.mockClear();
    addSpy.mockClear();
    compareSpy.mockClear();
    logUserSpy.mockClear();
    removeSpy.mockClear();
  });

  it(`if there is no user exists, it should throw 'user does not exist'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: 'user12345@gmail.com', password: '000000' });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/not exist/);
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(
      'user12345@gmail.com',
    );

    expect(addSpy).not.toBeCalled();
    expect(compareSpy).not.toBeCalled();
    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });

  it(` if there is one whose status is false, it should throw 'currently invalid user'`, async () => {
    const role = await RoleRepo.findByCode(RoleCode.LEARNER);
    user = (
      await UserModel.create({
        email: EMAIL,
        password: PSW,
        status: false,
        roles: [role],
      })
    ).toObject();
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/currently invalid/);
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);

    expect(addSpy).not.toBeCalled();
    expect(compareSpy).not.toBeCalled();
    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });

  it(`if there is valid one and you login the first time with wrong password, it should throw 'Invalid password - ${
    rule.login.maxTryTime - 1
  } times left to try`, async () => {
    await UserModel.updateOne({ email: EMAIL }, { status: true });
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 1} times left`),
    );
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);
    expect(addSpy).toBeCalledTimes(1);
    expect(addSpy).toBeCalledWith(user?._id);
    expect(compareSpy).toBeCalledTimes(1);

    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });

  it(`if you enter the wrong password again, it should throw 'Invalid password - ${
    rule.login.maxTryTime - 2
  } times left to try'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 2} times left`),
    );
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);
    expect(addSpy).toBeCalledTimes(1);
    expect(addSpy).toBeCalledWith(user?._id);
    expect(compareSpy).toBeCalledTimes(1);

    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });

  it(`if you enter the wrong password another time, it should throw 'Invalid password - ${
    rule.login.maxTryTime - 3
  } times left to try'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 3} times left`),
    );
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);
    expect(addSpy).toBeCalledTimes(1);
    expect(addSpy).toBeCalledWith(user?._id);
    expect(compareSpy).toBeCalledTimes(1);

    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });
  it(`if you still login with wrong password, it should throw 'maximum try time'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(
      new RegExp(
        `wrong password for ${rule.login.maxTryTime} times in sequence`,
      ),
    );
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);
    expect(addSpy).toBeCalledTimes(1);
    expect(addSpy).toBeCalledWith(user?._id);

    expect(compareSpy).not.toBeCalled();
    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });

  it(`if it has been a long time since your last login attempt (over RENEW_DURATION), it should reset try times`, async () => {
    const longTimeAgo = new Date(Date.now() - rule.login.renewDuration * 1000);
    await LAModel.updateOne(
      { email: EMAIL },
      { updatedAt: longTimeAgo },
    ).exec();
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, password: '000000' });
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(
      new RegExp(`${rule.login.maxTryTime - 1} times left`),
    );
    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);
    expect(addSpy).toBeCalledTimes(1);
    expect(addSpy).toBeCalledWith(user?._id);
    expect(compareSpy).toBeCalledTimes(1);

    expect(logUserSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
  });

  it(`if you enter the right password, you should receive your user info and tokens respectively`, async () => {
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

    expect(findPrivateInfoByEmailSpy).toBeCalledTimes(1);
    expect(findPrivateInfoByEmailSpy).toHaveBeenCalledWith(EMAIL);
    expect(addSpy).toBeCalledTimes(1);
    expect(addSpy).toBeCalledWith(user?._id);
    expect(compareSpy).toBeCalledTimes(1);
    expect(logUserSpy).toBeCalledTimes(1);
    expect(removeSpy).toBeCalledTimes(1);
  });
});
