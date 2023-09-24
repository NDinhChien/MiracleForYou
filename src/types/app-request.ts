import { Request } from 'express';
import User from '../database/model/User';
import Key from '../database/model/Key';

export declare interface ProtectedRequest extends Request {
  user?: User;
  key?: Key;
  accessToken?: string;
}
export declare interface Tokens {
  accessToken: string;
  refreshToken: string;
}
