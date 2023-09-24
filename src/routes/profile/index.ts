import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
} from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import { rule } from '../../config';
import Role from '../../database/model/Role';
import UserRepo from '../../database/repository/UserRepo';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import validator, { Source } from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';

import avatarUpload, { deleteOldAvatar } from './utils';

const router = express.Router();

router.get(
  '/id/:id',
  validator(schema.id, Source.PARAM),
  asyncHandler<Request>(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await UserRepo.findPublicInfoById(
        new Types.ObjectId(req.params.id),
      );
      if (!user) throw new BadRequestError('User does not exist');
      return new SuccessResponse('User profile', user).send(res);
    },
  ),
);

router.use(authentication);

router.get(
  '/my',
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const user = req.user;
      delete user?.password;
      delete user?.nameUpdatedAt;
      return new SuccessResponse('My profile', user).send(res);
    },
  ),
);

router.put(
  '/',
  validator(schema.profile),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user) throw new InternalError();
      const updatedUser = await UserRepo.updatePublicInfo({
        _id: req.user._id,
        ...req.body,
      });
      if (!updatedUser) throw new InternalError('Update profile failure');
      updatedUser.roles = req.user.roles as Role[];
      return new SuccessResponse('Profile updated', updatedUser).send(res);
    },
  ),
);

router.put(
  '/name',
  validator(schema.name),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user) throw new InternalError();
      const nameUpdateAt = req.user.nameUpdatedAt;
      if (
        nameUpdateAt &&
        nameUpdateAt.getTime() + rule.name.renewDuration * 1000 >= Date.now()
      )
        throw new ForbiddenError(
          `You can only update name after ${new Date(
            nameUpdateAt.getTime() + rule.name.renewDuration * 1000,
          )}`,
        );

      if (req.user.name === req.body.name)
        throw new BadRequestError('This is your current name.');
      if (await UserRepo.existsByName(req.body.name))
        throw new BadRequestError('This name has already existed.');

      const updatedUser = await UserRepo.updateName(
        req.user._id,
        req.body.name,
      );
      if (!updatedUser) throw new InternalError('Name update failure.');
      updatedUser.roles = req.user.roles as Role[];
      return new SuccessResponse('Name updated', updatedUser).send(res);
    },
  ),
);

router.put(
  '/avatar',
  avatarUpload.single('avatar'),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !req.file)
        throw new BadRequestError('Please upload an image');

      await deleteOldAvatar(req.file.filename);

      const updatedUser = await UserRepo.updateAvatar(
        req.user._id,
        req.file.filename,
      );
      if (!updatedUser) throw new InternalError('Update avatar failure');
      updatedUser.roles = req.user.roles as Role[];
      return new SuccessResponse('Avatar updated', updatedUser).send(res);
    },
  ),
);

export default router;
