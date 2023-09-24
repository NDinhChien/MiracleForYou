import { Request, Response, NextFunction } from 'express';

type AsyncFunction<T> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export default <T extends Request>(execution: AsyncFunction<T>) =>
  (req: T, res: Response, next: NextFunction) => {
    execution(req, res, next).catch(next);
  };
