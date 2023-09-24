import path from 'path';
// Mapper for environment variables
export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;

export const db = {
  name: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_USER_PWD || '',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
};

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY || '0'),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY || '0'),
  issuer: process.env.TOKEN_ISSUER || '',
  audience: process.env.TOKEN_AUDIENCE || '',
};

export const logDir = process.env.LOG_DIR;

export const pubDir = process.env.PUB_DIR;

export const getLogDir = () => {
  let dir = path.resolve('logs');
  if (logDir) dir = path.resolve(logDir);
  return dir;
};
export const getPubDir = () => {
  let dir = path.resolve('public');
  if (pubDir) dir = path.resolve(pubDir);
  return dir;
};

export const redis = {
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT || '0'),
  password: process.env.REDIS_PASSWORD || '',
};

export const caching = {
  contentCacheDuration: parseInt(
    process.env.CONTENT_CACHE_DURATION_MILLIS || '600000',
  ),
};

export const rule = {
  email: {
    maxRefreshTime: parseInt(process.env.EMAIL_REFRESH_TIME || '2'),
    maxTryTime: parseInt(process.env.EMAIL_TRY_TIME || '3'),
    enterIn: parseInt(process.env.EMAIL_ENTER_IN || '75'),
    validIn: parseInt(process.env.EMAIL_VALID_IN || '60'),
    renewDuration: parseInt(process.env.EMAIL_RENEW_DURATION || '3600'),
  },
  login: {
    maxTryTime: parseInt(process.env.LOGIN_TRY_TIME || '5'),
    renewDuration: parseInt(process.env.LOGIN_RENEW_DURATION || '3600'),
  },
  name: {
    renewDuration: parseInt(process.env.NAME_RENEW_DURATION || '604800'),
  },
  avatar: {
    maxSize: parseInt(process.env.AVT_MAX_SIZE || '2097152'),
    mimeTypes: (process.env.AVT_MIME_TYPES || 'image/png, image/jpeg').split(
      ', ',
    ),
  },
  wmsg: {
    maxGet: parseInt(process.env.WMSG_MAX_GET || '3'),
    maxCapacity: parseInt(process.env.WMSG_MAX_CAPACITY || '9'),
  },
};
