import User, { UserModel, isAdmin } from '../../../src/database/model/User';
import { KeyModel } from '../../../src/database/model/Key';
import UserRepo from '../../../src/database/repository/UserRepo';
import RoleRepo from '../../../src/database/repository/RoleRepo';
import { RoleCode } from '../../../src/database/model/Role';

import { rule } from '../../../src/config';
import { connection } from '../../../src/database';
import cache from '../../../src/cache';
import supertest from 'supertest';
import app from '../../../src/app';
import WorldMsgCache from '../../../src/cache/repository/WorldMsgCache';
import PrivateMsgCache from '../../../src/cache/repository/PrivateMsgCache';
import { Tokens } from '../../../src/types/app-request';
import { addAuthHeaders } from '../../auth/utils';
const privateMsgAddSpy = jest.spyOn(PrivateMsgCache, 'add');
const privateMsgGetSpy = jest.spyOn(PrivateMsgCache, 'get');
const wmsgGetLatestSpy = jest.spyOn(WorldMsgCache, 'getLatest');
const wmsgGetAfterSpy = jest.spyOn(WorldMsgCache, 'getAfter');
const wmsgGetBeforeSpy = jest.spyOn(WorldMsgCache, 'getBefore');
const wmsgAddSpy = jest.spyOn(WorldMsgCache, 'add');
const request = supertest(app);

let admin: { user: User; tokens: Tokens },
  user1: { user: User; tokens: Tokens },
  user2: { user: User; tokens: Tokens };

const msgCreate = (user: User, msg: string) => {
  return {
    authorId: user._id.toString(),
    authorName: user.name,
    authorAvt: user.avatar,
    isAdmin: isAdmin(user),
    message: msg,
    createdAt: expect.any(String),
  };
};

const sleep = async (milis: number) =>
  new Promise((resolve) => setTimeout(resolve, milis));

describe('message - integration test', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`admin, user1 and user2 login with right passwords, it should be all successfull`, async () => {
    const adminRole = await RoleRepo.findByCode(RoleCode.ADMIN);
    const admin_id = (await UserRepo.create('admin@gmail.com', '12345678'))._id;
    await UserModel.updateOne(
      { _id: admin_id },
      {
        avatar: admin_id.toString() + '.png',
        name: 'admin',
        $push: { roles: adminRole },
      },
    );

    const user1_id = (await UserRepo.create('user1@gmail.com', '12345678'))._id;
    await UserModel.updateOne(
      { _id: user1_id },
      { avatar: user1_id.toString() + '.png', name: 'user1' },
    );

    const user2_id = (await UserRepo.create('user2@gmail.com', '12345678'))._id;
    await UserModel.updateOne(
      { _id: user2_id },
      { avatar: user2_id.toString() + '.png', name: 'user2' },
    );

    admin = (
      await request
        .post('/login')
        .send({ email: 'admin@gmail.com', password: '12345678' })
    ).body.data;
    user1 = (
      await request
        .post('/login')
        .send({ email: 'user1@gmail.com', password: '12345678' })
    ).body.data;
    user2 = (
      await request
        .post('/login')
        .send({ email: 'user2@gmail.com', password: '12345678' })
    ).body.data;

    expect(admin.tokens).toBeDefined();
    expect(admin.tokens).toHaveProperty('accessToken');
    expect(admin.tokens).toHaveProperty('refreshToken');
    expect(admin.user).toBeDefined();
    expect(admin.user).toHaveProperty('email');
    expect(admin.user).toHaveProperty('roles');
    expect(admin.user).toHaveProperty('name');
    expect(admin.user).toHaveProperty('avatar');

    expect(user2.tokens).toBeDefined();
    expect(user2.tokens).toHaveProperty('accessToken');
    expect(user2.tokens).toHaveProperty('refreshToken');
    expect(user2.user).toBeDefined();
    expect(user2.user).toHaveProperty('email');
    expect(user2.user).toHaveProperty('roles');
    expect(user2.user).toHaveProperty('name');
    expect(user2.user).toHaveProperty('avatar');
  });

  describe('/message - private message - integration test', () => {
    const sendMsgEP = '/message/id/';
    const getMsgEp = '/message';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it(`admin send a message to user1, it should be sucessfull`, async () => {
      const response = await addAuthHeaders(
        request.post(sendMsgEP + user1.user._id.toString()),
        admin.tokens.accessToken,
      ).send({ message: 'hello' });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent/);
      expect(privateMsgAddSpy).toBeCalledTimes(1);
    });

    it(`user2 send a message to user1, it should be sucessfull`, async () => {
      const response = await addAuthHeaders(
        request.post(sendMsgEP + user1.user._id.toString()),
        user2.tokens.accessToken,
      ).send({ message: 'hi' });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent/);
      expect(privateMsgAddSpy).toBeCalledTimes(1);
    });

    it(`if user1 try to get new messages, there should be two message from user2 and admin`, async () => {
      const response = await addAuthHeaders(
        request.get(getMsgEp),
        user1.tokens.accessToken,
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/New messages/);
      expect(privateMsgGetSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(admin.user, 'hello'),
          msgCreate(user2.user, 'hi'),
        ]),
      );
    });
    it(`if user1 check new messages again, it should be empty`, async () => {
      const response = await addAuthHeaders(
        request.get(getMsgEp),
        user1.tokens.accessToken,
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/New messages/);
      expect(privateMsgGetSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('/message/world - world message - integration test', () => {
    const sendMsgEP = '/message/world';
    const getMsgEp = '/message/world/';
    let bf_1: Date, bf_2: Date, bf_3: Date, bf_4: Date, bf_5: Date, bf_6: Date;

    const msg_1 = 'admin say hello to the world msg#1';
    const msg_2 = 'admin say hello to the world msg#2';
    const msg_3 = 'user1 says hello to the world msg#3';
    const msg_4 = 'user1 says hello to the world msg#4';
    const msg_5 = 'user2 says hello to the world msg#5';
    const msg_6 = 'user2 says hello to the world msg#6';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it(`admin sends 2 messages to the world successfully`, async () => {
      bf_1 = new Date();
      let response = await addAuthHeaders(
        request.post(sendMsgEP),
        admin.tokens.accessToken,
      ).send({ message: msg_1 });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent to world messages/);
      await sleep(500);
      bf_2 = new Date();
      response = await addAuthHeaders(
        request.post(sendMsgEP),
        admin.tokens.accessToken,
      ).send({ message: msg_2 });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent to world messages/);
      expect(wmsgAddSpy).toBeCalledTimes(2);
    });

    it(`user1 sends 2 messages to the world successfully`, async () => {
      await sleep(500);
      bf_3 = new Date();
      let response = await addAuthHeaders(
        request.post(sendMsgEP),
        user1.tokens.accessToken,
      ).send({ message: msg_3 });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent to world messages/);
      await sleep(500);
      bf_4 = new Date();
      response = await addAuthHeaders(
        request.post(sendMsgEP),
        user1.tokens.accessToken,
      ).send({ message: msg_4 });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent to world messages/);
      expect(wmsgAddSpy).toBeCalledTimes(2);
    });

    it(`user2 sends 2 messages to the world successfully`, async () => {
      await sleep(500);
      bf_5 = new Date();
      let response = await addAuthHeaders(
        request.post(sendMsgEP),
        user2.tokens.accessToken,
      ).send({ message: msg_5 });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent to world messages/);
      await sleep(500);
      bf_6 = new Date();
      response = await addAuthHeaders(
        request.post(sendMsgEP),
        user2.tokens.accessToken,
      ).send({ message: msg_6 });
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Sent to world messages/);
      expect(wmsgAddSpy).toBeCalledTimes(2);
    });

    it(`if user tries to get latest messages, he/she should receive msg#5 and msg#6`, async () => {
      const response = await request.get(getMsgEp + 'latest');
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Latest world messages/);
      expect(wmsgGetLatestSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(rule.wmsg.maxGet);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(user2.user, msg_5),
          msgCreate(user2.user, msg_6),
        ]),
      );
    });

    it(`if user tries to get messages before the time bf_5, he/she should receive msg#3 and msg#4`, async () => {
      const response = await request.get(
        getMsgEp + 'before?date=' + bf_5.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetBeforeSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(rule.wmsg.maxGet);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(user1.user, msg_3),
          msgCreate(user1.user, msg_4),
        ]),
      );
    });
    it(`if user tries to get messages before the time bf_4, he/she should receive msg#2 and msg#3`, async () => {
      const response = await request.get(
        getMsgEp + 'before?date=' + bf_4.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetBeforeSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(user1.user, msg_3),
          msgCreate(admin.user, msg_2),
        ]),
      );
    });
    it(`if user tries to get messages before the time bf_3, he/she should receive msg#2 only, since msg#1 has been removed`, async () => {
      const response = await request.get(
        getMsgEp + 'before?date=' + bf_3.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetBeforeSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data).toEqual(
        expect.arrayContaining([msgCreate(admin.user, msg_2)]),
      );
    });
    it(`if user tries to get messages before the time bf_2, he/she should receive empty []`, async () => {
      const response = await request.get(
        getMsgEp + 'before?date=' + bf_2.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetBeforeSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(0);
    });
    it(`if user tries to get messages after the time bf_2, he/she should receive msg#2 and msg#3`, async () => {
      const response = await request.get(
        getMsgEp + 'after?date=' + bf_2.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetAfterSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(admin.user, msg_2),
          msgCreate(user1.user, msg_3),
        ]),
      );
    });

    it(`if user tries to get messages after the time bf_3, he/she should receive msg#3 and msg#4`, async () => {
      const response = await request.get(
        getMsgEp + 'after?date=' + bf_3.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetAfterSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(user1.user, msg_3),
          msgCreate(user1.user, msg_4),
        ]),
      );
    });

    it(`if user tries to get messages after the time bf_5, he/she should receive msg#5 and msg#6`, async () => {
      const response = await request.get(
        getMsgEp + 'after?date=' + bf_5.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetAfterSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          msgCreate(user2.user, msg_5),
          msgCreate(user2.user, msg_6),
        ]),
      );
    });

    it(`if user tries to get messages after the time bf_6, he/she should receive msg#6 only`, async () => {
      const response = await request.get(
        getMsgEp + 'after?date=' + bf_6.toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetAfterSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data).toEqual(
        expect.arrayContaining([msgCreate(user2.user, msg_6)]),
      );
    });

    it(`if user tries to get messages after now, he/she should receive empty []`, async () => {
      const response = await request.get(
        getMsgEp + 'after?date=' + new Date().toString(),
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/World messages/);
      expect(wmsgGetAfterSpy).toBeCalledTimes(1);
      expect(response.body.data).toHaveLength(0);
    });
  });
});
