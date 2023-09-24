import { EmailCodeModel } from '../../../../src/database/model/EmailCode';
import ECodeRepo from '../../../../src/database/repository/ECodeRepo';
import { connection } from '../../../../src/database';
import cache from '../../../../src/cache';
import supertest from 'supertest';
import app from '../../../../src/app';
import { rule } from '../../../../src/config';
const findOneByEmailSpy = jest.spyOn(ECodeRepo, 'findOneByEmail');
const updateOneSpy = jest.spyOn(ECodeRepo, 'updateOne');

describe('/email/verify - integration test', () => {
  const endpoint = '/email/verify';
  const request = supertest(app);
  const EMAIL = 'user12345@gmail.com';
  const CODE = '000000';

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
    updateOneSpy.mockClear();
  });

  it(`if there is no record associated with the email in emailCodes collection, it should throw 'no code available'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: CODE });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/no code available/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).not.toBeCalled();
  });

  it(`if there is one and you try to verify over ENTER_IN time, it should throw 'code expired'`, async () => {
    const someTimeAgo = new Date(Date.now() - rule.email.enterIn * 1000);
    await EmailCodeModel.create({
      email: EMAIL,
      code: CODE,
      refreshTime: 0,
      tryTime: 0,
      verified: false,
      createdAt: someTimeAgo,
      updatedAt: someTimeAgo,
    });
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: CODE });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Code has expired/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).not.toBeCalled();
  });

  it(`if there is one, and you try to verify in ENTER_IN time with the right code, verification should be successfull'`, async () => {
    const now = new Date();
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      { verified: false, createdAt: now, updatedAt: now },
    );
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: CODE });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Verified successfully/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).toHaveBeenCalledTimes(1);
    expect(updateOneSpy).toBeCalledWith({
      email: EMAIL,
      verified: true,
      updatedAt: expect.any(Date),
    });
  });

  it(`if the email has been verified in VALID_IN time and you try to verify again, it should throw 'already verified'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: CODE });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already been verified/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).not.toBeCalled();
  });

  it(`if the email has been verified for a while, it should throw 'verification expired, refresh new code and verify again'`, async () => {
    const someTimeAgo = new Date(Date.now() - rule.email.validIn * 1000);
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      { verified: true, updatedAt: someTimeAgo },
    );
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: CODE });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/verified for a while/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).not.toBeCalled();
  });

  it(`if there is an one, and you try to verify in ENTER_IN time with wrong code, it should throw 'wrong code'`, async () => {
    const now = new Date();
    await EmailCodeModel.updateOne(
      { email: EMAIL },
      { tryTime: 0, verified: false, createdAt: now, updatedAt: now },
    );
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Wrong code, try again/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).toHaveBeenCalledTimes(1);
    expect(updateOneSpy).toBeCalledWith({
      email: EMAIL,
      tryTime: 1,
      updatedAt: expect.any(Date),
    });
  });

  it(`if you keep enter the wrong code in ENTER_IN time, and this is the last time you can try, 
  it shoud throw 'wrong code' and suggest to refresh new code`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: '123456' });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Wrong code, you may refresh/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).toHaveBeenCalledTimes(1);
    expect(updateOneSpy).toBeCalledWith({
      email: EMAIL,
      tryTime: 2,
      updatedAt: expect.any(Date),
    });
  });

  it(`if you still try to verify other more times, it should warn 'maximum try time'`, async () => {
    const response = await request
      .post(endpoint)
      .send({ email: EMAIL, code: '123456' });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/entered wrong codes for/);
    expect(findOneByEmailSpy).toHaveBeenCalledTimes(1);
    expect(findOneByEmailSpy).toBeCalledWith(EMAIL);
    expect(updateOneSpy).not.toBeCalled();
  });
});
