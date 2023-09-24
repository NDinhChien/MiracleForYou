import express, { Request } from 'express';
import { Types } from 'mongoose';
import { TokenRefreshResponse } from '../../core/ApiResponse';
import {
  AuthFailureError,
  BadRequestError,
  AccessTokenError,
  BadTokenError,
} from '../../core/ApiError';
import KeyRepo from '../../database/repository/KeyRepo';

import { tokenInfo } from '../../config';
import JWT from '../../core/JWT';
import { validateTokenData, getAccessToken } from '../../auth/utils';
import validator, { Source } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';

const router = express.Router();

router.post(
  '/refresh',
  validator(schema.auth, Source.HEADER),
  validator(schema.refreshToken),
  asyncHandler<Request>(async (req: Request, res, next) => {
    if (!req.headers.authorization)
      throw new AuthFailureError('Invalid Authorization Header');
    const accessToken = getAccessToken(req.headers.authorization);

    const payload = await JWT.decode(accessToken);
    validateTokenData(payload);

    const key = await KeyRepo.findOneById(new Types.ObjectId(payload.sub));

    if (!key || key.primaryKey !== payload.prm)
      throw new AccessTokenError('Invalid access token');

    if (payload.exp - Date.now() / 1000 >= tokenInfo.accessTokenValidity * 0.1)
      throw new BadRequestError('Token is still usable');

    const refreshPayload = await JWT.validate(req.body.refreshToken);
    validateTokenData(refreshPayload);

    if (
      refreshPayload.sub !== payload.sub ||
      refreshPayload.prm !== key.secondaryKey
    )
      throw new BadTokenError('Invalid refresh token');

    const tokens = await KeyRepo.logUser(
      key._id as Types.ObjectId,
      key.email as string,
    );

    new TokenRefreshResponse(
      'Token Issued',
      tokens.accessToken,
      tokens.refreshToken,
    ).send(res);
  }),
);

export default router;
