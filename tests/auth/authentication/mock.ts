import { Types } from 'mongoose';
import JWT, { JwtPayload } from '../../../src/core/JWT';
import { tokenInfo } from '../../../src/config';
import { BadTokenError } from '../../../src/core/ApiError';
import Key from '../../../src/database/model/Key';
import User from '../../../src/database/model/User';
import Role from '../../../src/database/model/Role';
import { RoleCode } from '../../../src/database/model/Role';

export const LEARNER_ACCESS_TOKEN = 'leanerAccessToken';
export const ADMIN_ACCESS_TOKEN = 'adminAccessToken';

export const LEARNER_ID = new Types.ObjectId();
export const ADMIN_ID = new Types.ObjectId();

export const LEARNER_PRIMARY_KEY = 'learnerPrimaryKey';
export const ADMIN_PRIMARY_KEY = 'adminPrimaryKey';

export const LEARNER_ROLE_ID = new Types.ObjectId();
export const ADMIN_ROLE_ID = new Types.ObjectId();

export const mockJwtValidate = jest.fn(
  async (token: string): Promise<JwtPayload> => {
    switch (token) {
      case LEARNER_ACCESS_TOKEN:
        return new JwtPayload(
          tokenInfo.issuer,
          tokenInfo.audience,
          LEARNER_ID.toString(),
          LEARNER_PRIMARY_KEY,
          100,
        );
      case ADMIN_ACCESS_TOKEN:
        return new JwtPayload(
          tokenInfo.issuer,
          tokenInfo.audience,
          ADMIN_ID.toString(),
          ADMIN_PRIMARY_KEY,
          100,
        );
      default:
        throw new BadTokenError();
    }
  },
);

export const mockFindKeyById = jest.fn(
  async (id: Types.ObjectId): Promise<Key | null> => {
    switch (id.toString()) {
      case LEARNER_ID.toString():
        return {
          _id: LEARNER_ID,
          primaryKey: LEARNER_PRIMARY_KEY,
        } as Key;
      case ADMIN_ID.toString():
        return {
          _id: ADMIN_ID,
          primaryKey: ADMIN_PRIMARY_KEY,
        } as Key;
      default:
        return null;
    }
  },
);

export const mockFindPrivateInfoById = jest.fn(
  async (id: Types.ObjectId): Promise<User | null> => {
    switch (id.toString()) {
      case LEARNER_ID.toString():
        return {
          _id: LEARNER_ID,
          roles: [
            {
              _id: LEARNER_ROLE_ID,
              code: RoleCode.LEARNER,
              status: true,
            } as Role,
          ],
        } as User;
      case ADMIN_ID.toString():
        return {
          _id: ADMIN_ID,
          roles: [
            {
              _id: LEARNER_ROLE_ID,
              code: RoleCode.LEARNER,
              status: true,
            } as Role,
            { _id: ADMIN_ROLE_ID, code: RoleCode.ADMIN, status: true } as Role,
          ],
        } as User;
      default:
        return null;
    }
  },
);
JWT.validate = mockJwtValidate;

jest.mock('../../../src/database/repository/KeyRepo', () => ({
  findOneById: mockFindKeyById,
}));

jest.mock('../../../src/database/repository/UserRepo', () => ({
  findPrivateInfoById: mockFindPrivateInfoById,
}));
