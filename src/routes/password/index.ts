import express, { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../../core/ApiError';
import { SuccessMsgResponse } from '../../core/ApiResponse';
import { compare } from '../../database/model/User';
import KeyRepo from '../../database/repository/KeyRepo';
import ECodeRepo from '../../database/repository/ECodeRepo';
import UserRepo from '../../database/repository/UserRepo';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import validator from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';
import checkVerification from '../../auth/verification';

const router = express.Router();

const checkUserExistence = asyncHandler<Request>(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!(await UserRepo.exists(req.body.email)))
      throw new BadRequestError('User does not exist.');
    return next();
  },
);

router.post(
  '/reset',
  validator(schema.reset),
  checkUserExistence,
  checkVerification,
  asyncHandler<Request>(
    async (req: Request, res: Response, next: NextFunction) => {
      const email = req.body.email;
      await UserRepo.resetPassword(email);
      await KeyRepo.deleteOneByEmail(email); // logout
      await ECodeRepo.remove(email);
      return new SuccessMsgResponse(
        'Please check your email for new password',
      ).send(res);
    },
  ),
);

router.put(
  '/',
  authentication,
  validator(schema.update),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const oldPassword = req.body.password;
      const newPassword = req.body.newPassword;
      if (!(await compare(oldPassword, req.user?.password as string)))
        throw new BadRequestError('Invalid password');
      await UserRepo.updatePassword(req.user?.email as string, newPassword);
      return new SuccessMsgResponse('Password updated').send(res);
    },
  ),
);

export default router;
