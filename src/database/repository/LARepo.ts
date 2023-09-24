import { LAModel } from '../model/LoginAttempt';
import { Types } from 'mongoose';
import { ForbiddenError } from '../../core/ApiError';
import { rule } from '../../config';

async function createOrUpdate(
  user_id: Types.ObjectId,
  tryTime: number,
): Promise<any> {
  return await LAModel.updateOne(
    { _id: user_id },
    { tryTime: tryTime, updatedAt: new Date() },
    { upsert: true },
  ).exec();
}

// use before user attempts to login,
async function add(user_id: Types.ObjectId): Promise<number | null> {
  const la = await LAModel.findOne({ _id: user_id }).lean().exec();
  if (la) {
    if (la.updatedAt.getTime() + rule.login.renewDuration * 1000 <= Date.now())
      await createOrUpdate(user_id, 0);
    else {
      if (la.tryTime >= rule.login.maxTryTime - 1)
        throw new ForbiddenError(
          `Entered wrong password for ${
            rule.login.maxTryTime
          } times in sequence, you can reset password or try later after ${new Date(
            la.updatedAt.getTime() + rule.login.renewDuration * 1000,
          )}`,
        );
      else await createOrUpdate(user_id, la.tryTime + 1);
      return rule.login.maxTryTime - la.tryTime - 2;
    }
  } else await createOrUpdate(user_id, 0);
  return rule.login.maxTryTime - 1;
}

// use after user logins successfully
async function remove(user_id: Types.ObjectId): Promise<any> {
  return await LAModel.deleteOne({ _id: user_id }).exec();
}

export default {
  createOrUpdate,
  add,
  remove,
};
