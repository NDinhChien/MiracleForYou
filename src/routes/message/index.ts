import express, { Response, NextFunction } from 'express';
import { InternalError } from '../../core/ApiError';
import { SuccessMsgResponse, SuccessResponse } from '../../core/ApiResponse';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';

import schema from './schema';
import validator, { Source } from '../../helpers/validator';
import authentication from '../../auth/authentication';

import { isAdmin } from '../../database/model/User';
import { Message } from '../../cache/utils';
import PrivateMsgCache from '../../cache/repository/PrivateMsgCache';
import WorldMsgCache from '../../cache/repository/WorldMsgCache';

const router = express.Router();

router.get(
  '/world/latest',
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const msgs = await WorldMsgCache.getLatest();
      return new SuccessResponse('Latest world messages', msgs).send(res);
    },
  ),
);

router.get(
  '/world/after',
  validator(schema.date, Source.QUERY),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const msgs = await WorldMsgCache.getAfter(
        new Date(req.query.date as string).getTime(),
      );
      return new SuccessResponse('World messages', msgs).send(res);
    },
  ),
);
router.get(
  '/world/before',
  validator(schema.date, Source.QUERY),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const msgs = await WorldMsgCache.getBefore(
        new Date(req.query.date as string).getTime(),
      );
      return new SuccessResponse('World messages', msgs).send(res);
    },
  ),
);

router.use(authentication);

router.post(
  '/world',
  validator(schema.message),
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new InternalError();

    const msg = new Message(
      req.user._id,
      req.user.name as string,
      req.user.avatar,
      isAdmin(req.user),
      req.body.message,
      new Date(),
    );
    await WorldMsgCache.add(msg);
    return new SuccessMsgResponse('Sent to world messages!').send(res);
  },
);

router.get(
  '/',
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user) throw new InternalError();
      const msgs = await PrivateMsgCache.get(req.user._id.toString());
      return new SuccessResponse('New messages', msgs).send(res);
    },
  ),
);

router.post(
  '/id/:id',
  validator(schema.id, Source.PARAM),
  validator(schema.message),
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user) throw new InternalError();

      const msg = new Message(
        req.user._id,
        req.user.name as string,
        req.user.avatar,
        isAdmin(req.user),
        req.body.message,
        new Date(),
      );
      await PrivateMsgCache.add(req.params.id as string, msg);
      return new SuccessMsgResponse('Sent').send(res);
    },
  ),
);

export default router;
