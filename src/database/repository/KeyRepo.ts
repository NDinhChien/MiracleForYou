import Key, { KeyModel } from '../model/Key';
import { Types } from 'mongoose';
import { createTokens } from '../../auth/utils';
import crypto from 'crypto';
import { Tokens } from 'app-request';

async function findOneById(user_id: Types.ObjectId): Promise<Key | null> {
  return await KeyModel.findOne({ _id: user_id }).lean().exec();
}

async function deleteOneById(user_id: Types.ObjectId): Promise<any> {
  return await KeyModel.deleteOne({ _id: user_id }).exec();
}

async function deleteOneByEmail(email: string): Promise<any> {
  return await KeyModel.deleteOne({ email: email }).exec();
}

async function createOrUpdate(
  user_id: Types.ObjectId,
  email: string,
  accessTokenKey: string,
  refreshTokenKey: string,
): Promise<any> {
  return KeyModel.updateOne(
    { _id: user_id },
    {
      email: email,
      primaryKey: accessTokenKey,
      secondaryKey: refreshTokenKey,
      updatedAt: new Date(),
    },
    { upsert: true },
  )
    .lean()
    .exec();
}

async function logUser(
  user_id: Types.ObjectId,
  email: string,
): Promise<Tokens> {
  const accessTokenKey = crypto.randomBytes(32).toString('hex');
  const refreshTokenKey = crypto.randomBytes(32).toString('hex');

  await createOrUpdate(user_id, email, accessTokenKey, refreshTokenKey);
  return await createTokens(user_id, accessTokenKey, refreshTokenKey);
}

export default {
  findOneById,
  deleteOneById,
  deleteOneByEmail,
  createOrUpdate,
  logUser,
};
