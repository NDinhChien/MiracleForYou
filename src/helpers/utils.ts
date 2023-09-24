import { Request } from 'express';
import Logger from '../core/Logger';

export function findIpAddress(req: Request) {
  try {
    if (req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'].toString().split(',')[0];
    } else if (req.socket && req.socket.remoteAddress) {
      return req.socket.remoteAddress;
    }
    return req.ip;
  } catch (err) {
    Logger.error(err);
    return undefined;
  }
}
