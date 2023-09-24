import express, { Request, Response, NextFunction } from 'express';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import { FailureMsgResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import EmailCode from '../../database/model/EmailCode';
import { rule } from '../../config';
import ECodeRepo from '../../database/repository/ECodeRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';

const router = express.Router();

router.post(
  '/refresh',
  validator(schema.refresh),
  asyncHandler<Request>(
    async (req: Request, res: Response, next: NextFunction) => {
      const email = req.body.email;
      if (!email) throw new BadRequestError();
      const ECode = await ECodeRepo.findOneByEmail(email);
      if (!ECode) {
        await ECodeRepo.refreshEmailCode(email, 0);
        return new SuccessMsgResponse('Email code issued').send(res);
      }
      if (ECode.verified) {
        if (ECode.updatedAt.getTime() + rule.email.validIn * 1000 > Date.now())
          throw new BadRequestError(
            'Have verified recently, you can sign up or reset password.',
          );
        else {
          await ECodeRepo.refreshEmailCode(email, 0);
          return new SuccessMsgResponse('Email code issued').send(res);
        }
      } else {
        if (
          ECode.updatedAt.getTime() + rule.email.renewDuration * 1000 <=
          Date.now()
        ) {
          await ECodeRepo.refreshEmailCode(email, 0);
          return new SuccessMsgResponse('Email code issued').send(res);
        } else {
          if (ECode.refreshTime >= rule.email.maxRefreshTime)
            throw new ForbiddenError(
              `You can refresh email code for ${
                rule.email.maxRefreshTime
              } times, you can try again after ${new Date(
                ECode.updatedAt.getTime() + rule.email.renewDuration * 1000,
              )}`,
            );
          else {
            await ECodeRepo.refreshEmailCode(email, ECode.refreshTime + 1);
            let msg = 'Email code refreshed';
            if (ECode.refreshTime + 1 === rule.email.maxRefreshTime)
              msg = 'Email code refreshed, the last time';
            return new SuccessMsgResponse(msg).send(res);
          }
        }
      }
    },
  ),
);

router.post(
  '/verify',
  validator(schema.verify),
  asyncHandler<Request>(
    async (req: Request, res: Response, next: NextFunction) => {
      const email = req.body.email;
      const code = req.body.code;

      const ECode = await ECodeRepo.findOneByEmail(email);
      if (!ECode)
        throw new BadRequestError('There is no code available for this email.');

      if (ECode.verified) {
        if (ECode.updatedAt.getTime() + rule.email.validIn * 1000 > Date.now())
          throw new BadRequestError('This email have already been verified.');
        else
          throw new BadRequestError(
            'You have verified for a while, please refresh new code and verify your email again.',
          );
      } else {
        if (ECode.createdAt.getTime() + rule.email.enterIn * 1000 < Date.now())
          throw new ForbiddenError(
            `Code has expired, you may refresh a new one then enter the code in less than ${rule.email.enterIn} seconds.`,
          );

        if (ECode.tryTime >= rule.email.maxTryTime)
          throw new ForbiddenError(
            `You have entered wrong codes for ${rule.email.maxTryTime} times, you may refresh a new code and try again.`,
          );
        else if (code === ECode.code) {
          await ECodeRepo.updateOne({
            email: email,
            verified: true,
            updatedAt: new Date(),
          } as EmailCode);
          return new SuccessMsgResponse('Verified successfully').send(res);
        } else {
          await ECodeRepo.updateOne({
            email: email,
            tryTime: ECode.tryTime + 1,
            updatedAt: new Date(),
          } as EmailCode);
          let msg = 'Wrong code, try again.';
          if (ECode.tryTime + 1 === rule.email.maxTryTime)
            msg = 'Wrong code, you may refresh a new code and try again.';
          return new FailureMsgResponse(msg).send(res);
        }
      }
    },
  ),
);

export default router;
