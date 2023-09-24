import { Response, NextFunction } from 'express';
import { ForbiddenError, InternalError } from '../core/ApiError';
import asyncHandler from '../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import RoleRepo from '../database/repository/RoleRepo';

export default (...requiredRoles: string[]) =>
  asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.roles) throw new ForbiddenError();
      const rRoles = await RoleRepo.findByCodes(requiredRoles);
      if (rRoles.length === 0) throw new InternalError();

      let authorized = false;
      for (const rRole of rRoles) {
        if (authorized) break;
        for (const role of req.user.roles) {
          if (role.status && role._id.equals(rRole._id)) {
            authorized = true;
            break;
          }
        }
      }
      if (!authorized) throw new ForbiddenError();
      return next();
    },
  );
