import express, { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';

import UserRepo from '../../database/repository/UserRepo';
import { RoleCode } from '../../database/model/Role';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import schema from './schema';
import validator, { Source } from '../../helpers/validator';
import authentication from '../../auth/authentication';
import authorization from '../../auth/authorization';

const router = express.Router();

router.use(authentication, authorization(RoleCode.ADMIN));

router.get(
  '/search/name/',
  validator(schema.like, Source.QUERY),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const users = await UserRepo.searchNameLike(req.query.like as string);
      return new SuccessResponse('User info list', users).send(res);
    },
  ),
);

router.get(
  '/all',
  validator(schema.pagination, Source.QUERY),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const users = await UserRepo.findUsers(
        parseInt(req.query.page as string),
        parseInt(req.query.limit as string),
      );
      return new SuccessResponse('User info list', users).send(res);
    },
  ),
);

router.get(
  '/id/:id',
  validator(schema.id, Source.PARAM),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const user = await UserRepo.findPrivateInfoById(
        new Types.ObjectId(req.params.id),
      );
      if (!user) throw new BadRequestError('User does not exist');
      delete user.password;
      delete user.nameUpdatedAt;
      return new SuccessResponse('User info', user).send(res);
    },
  ),
);

export default router;
