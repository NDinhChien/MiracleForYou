import express from 'express';
import UserRepo from '../database/repository/UserRepo';
import KeyRepo from '../database/repository/KeyRepo';
import { Types } from 'mongoose';
import {
  AuthFailureError,
  AccessTokenError,
  BadTokenError,
} from '../core/ApiError';

import JWT from '../core/JWT';
import { getAccessToken, validateTokenData } from './utils';
import asyncHandler from '../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import validator, { Source } from '../helpers/validator';
import schema from './schema';

const router = express.Router();

export default router.use(
  validator(schema.auth, Source.HEADER),
  asyncHandler<ProtectedRequest>(async (req: ProtectedRequest, res, next) => {
    if (!req.headers.authorization)
      throw new AuthFailureError('Invalid Authorization Header');
    req.accessToken = getAccessToken(req.headers.authorization);

    const payload = await JWT.validate(req.accessToken);
    validateTokenData(payload);

    const key = await KeyRepo.findOneById(new Types.ObjectId(payload.sub));
    if (!key || key.primaryKey !== payload.prm)
      throw new BadTokenError('Key does not exist');
    req.key = key;

    const user = await UserRepo.findPrivateInfoById(
      new Types.ObjectId(payload.sub),
    );
    if (!user) throw new AuthFailureError('User does not exist');
    req.user = user;

    return next();
  }),
);
