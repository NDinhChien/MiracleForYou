import Role, { RoleModel } from '../model/Role';

async function findByCode(code: string): Promise<Role | null> {
  return RoleModel.findOne({ status: true, code: code }).lean().exec();
}

async function findByCodes(codes: string[]): Promise<Role[]> {
  return RoleModel.find({ status: true, code: { $in: codes } })
    .lean()
    .exec();
}

export default {
  findByCode,
  findByCodes,
};
