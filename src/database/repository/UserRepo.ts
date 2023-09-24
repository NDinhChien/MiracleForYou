import RoleRepo from '../repository/RoleRepo';
import { RoleCode } from '../model/Role';
import User, {
  UserModel,
  newUserName,
  hash,
  newResetPassword,
  sendResetPassword,
} from '../model/User';

import { Types } from 'mongoose';

async function exists(email: string): Promise<User | null> {
  return await UserModel.exists({ email: email }).exec();
}

async function existsByName(name: string): Promise<User | null> {
  return await UserModel.exists({ name: name }).exec();
}

async function findPublicInfoById(
  user_id: Types.ObjectId,
): Promise<User | null> {
  return await UserModel.findOne({ _id: user_id }).lean().exec();
}

async function findPrivateInfoByEmail(email: string): Promise<User | null> {
  return await UserModel.findOne({ email: email })
    .select('+nameUpdateAt +email +password +roles +status')
    .populate('roles')
    .lean()
    .exec();
}

async function findPrivateInfoById(
  user_id: Types.ObjectId,
): Promise<User | null> {
  return await UserModel.findOne({ _id: user_id })
    .select('+nameUpdatedAt +email +password +roles +status')
    .populate('roles')
    .lean()
    .exec();
}

async function searchNameLike(like: string): Promise<User[]> {
  return await UserModel.find({
    name: { $regex: `.*${like}.*`, $options: 'i' },
  })
    .select('-nameUpdatedAt +email -password +roles +status')
    .populate('roles')
    .lean()
    .exec();
}

async function findUsers(page: number, limit: number): Promise<User[]> {
  return await UserModel.find({})
    .sort({ name: 1 })
    .skip(page * limit)
    .limit(limit)
    .select('-nameUpdatedAt +email -password +roles +status')
    .populate('roles')
    .lean()
    .exec();
}

async function updatePublicInfo(user: User): Promise<User | null> {
  user.updatedAt = new Date();
  return await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { ...user } },
    { new: true },
  )
    .select('+email')
    .lean()
    .exec();
}

async function updateName(
  user_id: Types.ObjectId,
  newName: string,
): Promise<User | null> {
  return await UserModel.findOneAndUpdate(
    { _id: user_id },
    { name: newName, updatedAt: new Date(), nameUpdatedAt: new Date() },
    { new: true },
  )
    .select('+email')
    .lean()
    .exec();
}

async function updateAvatar(
  user_id: Types.ObjectId,
  newAvatar: string,
): Promise<User | null> {
  return await UserModel.findOneAndUpdate(
    { _id: user_id },
    { avatar: newAvatar, updatedAt: new Date() },
    { new: true },
  )
    .select('+email')
    .lean()
    .exec();
}

async function create(email: string, password: string): Promise<User> {
  const now = new Date();
  const learner = await RoleRepo.findByCode(RoleCode.LEARNER);
  const user = await UserModel.create({
    email: email,
    password: await hash(password),
    name: newUserName(),
    roles: [learner],
    createdAt: now,
    updatedAt: now,
  });
  return { ...user.toObject(), roles: [learner] } as User;
}

async function updatePassword(email: string, newPassword: string) {
  return await UserModel.updateOne(
    { email: email },
    { password: await hash(newPassword), updatedAt: new Date() },
  ).exec();
}

async function resetPassword(email: string) {
  const newPassword = newResetPassword();
  console.log(newPassword);
  await updatePassword(email, newPassword);
  return await sendResetPassword(email, newPassword);
}

export default {
  findPublicInfoById,
  findPrivateInfoByEmail,
  findPrivateInfoById,
  updatePublicInfo,
  updateName,
  create,
  updatePassword,
  resetPassword,
  exists,
  existsByName,
  updateAvatar,
  searchNameLike,
  findUsers,
};
