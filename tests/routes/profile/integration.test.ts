import User, { UserModel } from '../../../src/database/model/User';
import { KeyModel } from '../../../src/database/model/Key';
import UserRepo from '../../../src/database/repository/UserRepo';
import { rule } from '../../../src/config';
import { connection } from '../../../src/database';
import cache from '../../../src/cache';
import supertest from 'supertest';
import app from '../../../src/app';
import { Tokens } from '../../../src/types/app-request';
import { addAuthHeaders } from '../../auth/utils';

const updateNameSpy = jest.spyOn(UserRepo, 'updateName');
const request = supertest(app);
const EMAIL = 'user@gmail.com';
let existedName: string;
let user: { user: User; tokens: Tokens };

describe(`PUT /profile/name - name update - integration test`, () => {
  const endpoint = '/profile/name';
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await KeyModel.deleteMany({});
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
    await KeyModel.deleteMany({});
    await connection.close();
    await cache.disconnect();
  });

  beforeEach(async () => {
    updateNameSpy.mockClear();
  });

  it(`if user changes name for the first time, user should be allowed to. If the new name is already existed, it should throw 'already existed'`, async () => {
    existedName = (await UserRepo.create('user2@gmail.com', '12345678'))
      .name as string;
    await UserRepo.create(EMAIL, '12345678');
    user = (
      await request.post('/login').send({ email: EMAIL, password: '12345678' })
    ).body.data;
    const response = await addAuthHeaders(
      request.put(endpoint),
      user.tokens.accessToken,
    ).send({ name: existedName });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already existed/);
    expect(updateNameSpy).not.toBeCalled();
  });

  it(`if the new name is the same as current name, it should throw 'your current name'`, async () => {
    const response = await addAuthHeaders(
      request.put(endpoint),
      user.tokens.accessToken,
    ).send({ name: user.user.name });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/current name/);
    expect(updateNameSpy).not.toBeCalled();
  });

  it(`if the new name is not owned by anyone yet, it should be successful`, async () => {
    const response = await addAuthHeaders(
      request.put(endpoint),
      user.tokens.accessToken,
    ).send({ name: 'chiendinh' });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Name updated/);
    expect(updateNameSpy).toBeCalledTimes(1);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBeDefined();
    expect(response.body.data.name).toEqual('chiendinh');
  });

  it(`if user name has been updated recently, it should throw 'can only update name after'`, async () => {
    const response = await addAuthHeaders(
      request.put(endpoint),
      user.tokens.accessToken,
    ).send({ name: 'chiendinh' });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/can only update name after/);
    expect(updateNameSpy).not.toBeCalled();
  });
  it(`if the last time user changed name is a long time ago (over renew duration), user should be allowed to`, async () => {
    const alongTimeAgo = new Date(Date.now() - rule.name.renewDuration * 1000);
    await UserModel.updateOne(
      { email: EMAIL },
      { nameUpdatedAt: alongTimeAgo },
    );
    const response = await addAuthHeaders(
      request.put(endpoint),
      user.tokens.accessToken,
    ).send({ name: 'dinhchien' });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Name updated/);
    expect(updateNameSpy).toBeCalledTimes(1);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBeDefined();
    expect(response.body.data.name).toEqual('dinhchien');
  });
});
