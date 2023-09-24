import { Request, Response, NextFunction } from 'express';
import { BadRequestError, ForbiddenError } from '../core/ApiError';
import { rule } from '../config';
import asyncHandler from '../helpers/asyncHandler';
import ECodeRepo from '../database/repository/ECodeRepo';

export default asyncHandler<Request>(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    if (!email) throw new BadRequestError();
    const Ecode = await ECodeRepo.findVerifiedEmail(email);
    if (!Ecode) throw new ForbiddenError('Please verify your email first.');
    if (Ecode.updatedAt.getTime() + rule.email.validIn * 1000 < Date.now())
      throw new ForbiddenError('Please verify your email again.');
    return next();
  },
);
