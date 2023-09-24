import express, { Request, Response, NextFunction } from 'express';
import Logger from './core/Logger';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { corsUrl, environment, getPubDir } from './config';
import './database'; // initialize database
import './cache'; // initialize cache
import {
  NotFoundError,
  ApiError,
  InternalError,
  ErrorType,
} from './core/ApiError';
import routes from './routes';

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const app = express();

const pubDir = getPubDir();

if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir);
  fs.mkdirSync(path.join(pubDir, 'avatars'));
}
app.use(express.static(pubDir));

app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }),
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

// Routes
app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    if (err.type === ErrorType.INTERNAL)
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
      );
    return ApiError.handle(err, res);
  } else {
    Logger.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
    if (environment === 'development') {
      return res.status(500).send(err);
    }
    return ApiError.handle(new InternalError(), res);
  }
});

export default app;
