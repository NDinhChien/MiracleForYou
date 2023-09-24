import { Types } from 'mongoose';
import { Tokens } from '../../../../src/types/app-request';
import bcrypt from 'bcrypt';

export const ID = new Types.ObjectId();
export const EMAIL = 'user0909@gmail.com';
export const PSW = bcrypt.hashSync('12345678', 10);

export const mockFindPrivateInfoByEmail = jest.fn();

export const mockLA_Add = jest.fn();

export const compareSpy = jest.spyOn(bcrypt, 'compare');

export const mockLogUser = jest.fn(
  async (id: Types.ObjectId, email: string): Promise<Tokens> => {
    return {
      refreshToken: 'refreshToken',
      accessToken: 'accessToken',
    } as Tokens;
  },
);

export const mockLA_Remove = jest.fn();

jest.mock('../../../../src/database/repository/UserRepo', () => ({
  findPrivateInfoByEmail: mockFindPrivateInfoByEmail,
}));

jest.mock('../../../../src/database/repository/KeyRepo', () => ({
  logUser: mockLogUser,
}));

jest.mock('../../../../src/database/repository/LARepo', () => ({
  add: mockLA_Add,
  remove: mockLA_Remove,
}));
