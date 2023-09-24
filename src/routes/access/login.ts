import express, { Response, NextFunction } from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError, AuthFailureError } from '../../core/ApiError';
import UserRepo from '../../database/repository/UserRepo';
import LARepo from '../../database/repository/LARepo';
import KeyRepo from '../../database/repository/KeyRepo';

import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import schema from './schema';
import validator from '../../helpers/validator';
import { compare, getUserData } from '../../database/model/User';

const router = express.Router();

router.post(
  '/',
  validator(schema.login),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const email = req.body.email;
      const password = req.body.password;
      const user = await UserRepo.findPrivateInfoByEmail(email);
      if (!user) throw new BadRequestError('User does not exist.');
      if (user.status === false)
        throw new AuthFailureError('User is currently invalid.');

      const timesLeft = await LARepo.add(user._id);
      if (!(await compare(password, user.password as string)))
        throw new AuthFailureError(
          `Invalid password! You have ${timesLeft} times left to try.`,
        );

      req.user = user;
      const tokens = await KeyRepo.logUser(user._id, user.email as string);
      await LARepo.remove(user._id);
      return new SuccessResponse('Login successfully', {
        user: getUserData(user),
        tokens: tokens,
      }).send(res);
    },
  ),
);

export default router;
