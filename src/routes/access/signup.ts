import express, { Request, Response, NextFunction } from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';

import UserRepo from '../../database/repository/UserRepo';
import KeyRepo from '../../database/repository/KeyRepo';
import ECodeRepo from '../../database/repository/ECodeRepo';
import { getUserData } from '../../database/model/User';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import checkVerification from '../../auth/verification';

const checkUserAbsence = asyncHandler<Request>(
  async (req: Request, res: Response, next: NextFunction) => {
    if (await UserRepo.exists(req.body.email))
      throw new ForbiddenError('User has already existed!');
    return next();
  },
);

const router = express.Router();

router.post(
  '/',
  validator(schema.signup),
  checkUserAbsence,
  checkVerification,
  asyncHandler<Request>(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await UserRepo.create(req.body.email, req.body.password);
      const tokens = await KeyRepo.logUser(user._id, user.email as string);
      await ECodeRepo.remove(req.body.email);
      return new SuccessResponse('Signup successfully.', {
        user: getUserData(user),
        tokens: tokens,
      }).send(res);
    },
  ),
);

export default router;
