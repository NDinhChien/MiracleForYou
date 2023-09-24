import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Logger from '../core/Logger';
import { BadRequestError } from '../core/ApiError';
import { Types } from 'mongoose';

export enum Source {
  BODY = 'body',
  HEADER = 'headers',
  QUERY = 'query',
  PARAM = 'params',
}

export const JoiObjectId = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!Types.ObjectId.isValid(value))
      return helpers.message({ custom: 'Invalid user id' });
    return value;
  }, 'Object Id Validation');

export const JoiAuthBearer = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!value.startsWith('Bearer '))
      return helpers.message({
        custom: 'authorization header value must be like Bearer <token>',
      });
    if (!value.split(' ')[1])
      return helpers.message({
        custom: 'authorization header value must be like Bearer <token>',
      });
    return value;
  }, 'Authorization Header Validation');

export const JoiPassword = () =>
  Joi.string()
    .min(6)
    .max(30)
    .custom((value: string, helpers) => {
      if (!/^[a-zA-Z0-9#$@&%]{6,30}$/.test(value))
        return helpers.message({
          custom: 'Password can only contain [#$@&%] as special characters',
        });
      return value;
    }, 'Password Validation');

export const JoiName = () =>
  Joi.string()
    .min(4)
    .max(20)
    .custom((value: string, helpers) => {
      if (!/^[a-zA-Z0-9-_]{4,20}$/.test(value))
        return helpers.message({
          custom: 'Name can only use [-_] as special characters',
        });
      return value;
    }, 'Name Validation');

export default (schema: Joi.AnySchema, source: Source = Source.BODY) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req[source]);

      if (!error) return next();

      const { details } = error;
      const message = details
        .map((i) => i.message.replace(/['"]+/g, ''))
        .join(',');

      next(new BadRequestError(message));
    } catch (error) {
      next(error);
    }
  };
