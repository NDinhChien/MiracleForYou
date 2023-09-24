import express from 'express';
import { Types } from 'mongoose';
import { SuccessMsgResponse } from '../../core/ApiResponse';
import KeyRepo from '../../database/repository/KeyRepo';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import authentication from '../../auth/authentication';

const router = express.Router();

router.use(authentication);

router.delete(
  '/',
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    await KeyRepo.deleteOneById(req.user?._id as Types.ObjectId);
    return new SuccessMsgResponse('Logout success').send(res);
  }),
);

export default router;
