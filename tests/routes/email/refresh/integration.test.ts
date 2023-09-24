import { EmailCodeModel } from '../../../../src/database/model/EmailCode';
import ECodeRepo from '../../../../src/database/repository/ECodeRepo';
import { connection } from '../../../../src/database';
import cache from '../../../../src/cache';
import supertest from 'supertest';
import app from '../../../../src/app';
import { rule } from '../../../../src/config';

const findOneByEmailSpy = jest.spyOn(ECodeRepo, 'findOneByEmail');
const refreshEmailCodeSpy = jest.spyOn(ECodeRepo, 'refreshEmailCode');

describe('/email/refresh - integraton test', () => {
  const endpoint = '/email/refresh';
  const request = supertest(app);
  const EMAIL = 'user12345@gmail.com';

  beforeAll(async () => {
    await EmailCodeModel.deleteMany({});
  });

  afterAll(async () => {
    await EmailCodeModel.deleteMany({});
    await connection.close();
    await cache.disconnect();
  });

  beforeEach(() => {
    findOneByEmailSpy.mockClear();
    refreshEmailCodeSpy.mockClear();
  });

  it(`if there is no record associated with the email in emailCodes collection, it should issue an email code`, async () => {
    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/code issued/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).toHaveBeenCalledTimes(1);
    expect(refreshEmailCodeSpy).toBeCalledWith(EMAIL, 0);
  });

  it(`if there is one, but has already been verified recently (not over IN_VALID time), it shoud throw 'verified recently'`, async () => {
    const now = new Date();
    await EmailCodeModel.deleteMany({});
    await EmailCodeModel.create({
      email: EMAIL,
      code: '000000',
      verified: true,
      refreshTime: 0,
      tryTime: 1,
      createdAt: now,
      updatedAt: now,
    });

    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/verified recently/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).not.toBeCalled();
  });

  it(`if there is one, but has been verified for a while (over IN_VALID time), it should issue a new email code and reset refresh time`, async () => {
    const someTimeAgo = new Date(Date.now() - rule.email.validIn * 1000);
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      { verified: true, updatedAt: someTimeAgo },
    );

    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/code issued/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).toHaveBeenCalledTimes(1);
    expect(refreshEmailCodeSpy).toBeCalledWith(EMAIL, 0);
  });

  it(`if there is an unverified one, and you ask to refresh the first time, it should issue a new email code
  `, async () => {
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      { verified: false, refreshTime: 0, updatedAt: new Date() },
    );

    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/code refreshed/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).toHaveBeenCalledTimes(1);
    expect(refreshEmailCodeSpy).toBeCalledWith(EMAIL, 1);
  });

  it(`if you ask to refresh the last time, it should issue a new email code with message 'the last time'`, async () => {
    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/code refreshed, the last time/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).toHaveBeenCalledTimes(1);
    expect(refreshEmailCodeSpy).toBeCalledWith(EMAIL, 2);
  });

  it(`if you still try to refresh other more times, it should warn 'maximum refresh time'`, async () => {
    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/you can try again after/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).not.toBeCalled();
  });

  it(` if there is an unverified one, but it has been over RENEW_DURATION time since the last try, then it should issue a new email code and reset refresh time`, async () => {
    const someTimeAgo = new Date(Date.now() - rule.email.renewDuration * 1000);
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      {
        verified: false,
        refreshTime: rule.email.maxRefreshTime,
        updatedAt: someTimeAgo,
      },
    );

    const response = await request.post(endpoint).send({ email: EMAIL });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/code issued/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(refreshEmailCodeSpy).toHaveBeenCalledTimes(1);
    expect(refreshEmailCodeSpy).toBeCalledWith(EMAIL, 0);
  });
});
