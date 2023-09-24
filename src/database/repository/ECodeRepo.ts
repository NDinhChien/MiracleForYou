import EmailCode, {
  EmailCodeModel,
  newEmailCode,
  sendEmailCode,
} from '../model/EmailCode';

async function findOneByEmail(email: string): Promise<EmailCode | null> {
  return await EmailCodeModel.findOne({ email: email }).lean().exec();
}

async function findVerifiedEmail(email: string): Promise<EmailCode | null> {
  return await EmailCodeModel.findOne({ verified: true, email: email })
    .lean()
    .exec();
}

async function updateOne(ecode: EmailCode): Promise<any> {
  return await EmailCodeModel.updateOne(
    { email: ecode.email },
    { ...ecode },
  ).exec();
}

async function refreshEmailCode(
  email: string,
  refreshTime: number,
): Promise<boolean> {
  const newCode = newEmailCode();
  await EmailCodeModel.updateOne(
    { email: email },
    {
      code: newCode,
      refreshTime: refreshTime,
      tryTime: 0,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { upsert: true },
  );
  return await sendEmailCode(email, newCode);
}

// use after signup or reset password
async function remove(email: string): Promise<any> {
  return await EmailCodeModel.deleteOne({ email: email }).lean().exec();
}
export default {
  findOneByEmail,
  findVerifiedEmail,
  updateOne,
  refreshEmailCode,
  remove,
};
