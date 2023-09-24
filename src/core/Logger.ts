import { createLogger, transports, format } from 'winston';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';
import { environment, getLogDir } from '../config';

const logDir = getLogDir();
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logLevel = environment === 'production' ? 'warn' : 'debug';

const dailyRotateFile = new DailyRotateFile({
  level: logLevel,
  filename: logDir + '/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  handleExceptions: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  ),
});

export default createLogger({
  transports: [
    new transports.Console({
      level: logLevel,
      format: format.combine(
        format.errors({ stack: true }),
        format.prettyPrint(),
      ),
    }),
    dailyRotateFile,
  ],
  exceptionHandlers: [dailyRotateFile],
  exitOnError: false,
});
