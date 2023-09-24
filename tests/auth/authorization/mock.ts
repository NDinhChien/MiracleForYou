import Role from '../../../src/database/model/Role';
import { RoleCode } from '../../../src/database/model/Role';
import { LEARNER_ROLE_ID, ADMIN_ROLE_ID } from '../authentication/mock';

export const mockFindByCodes = jest.fn(
  async (codes: string[]): Promise<Role[]> => {
    const result: Role[] = [];
    for (const code of codes) {
      switch (code) {
        case RoleCode.LEARNER:
          result.push({
            _id: LEARNER_ROLE_ID,
            code: RoleCode.LEARNER,
            status: true,
          } as Role);
          break;
        case RoleCode.ADMIN:
          result.push({
            _id: ADMIN_ROLE_ID,
            code: RoleCode.ADMIN,
            status: true,
          } as Role);
          break;
      }
    }
    return result;
  },
);

jest.mock('../../../src/database/repository/RoleRepo', () => ({
  findByCodes: mockFindByCodes,
}));
