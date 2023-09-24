import { readFile } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { sign, verify } from 'jsonwebtoken';
import {
  BadTokenError,
  InternalError,
  TokenExpiredError,
} from '../core/ApiError';

export class JwtPayload {
  iss: string;
  aud: string;
  sub: string;
  prm: string;
  iat: number;
  exp: number;
  constructor(
    issuer: string,
    audience: string,
    subject: string,
    param: string,
    validity: number,
  ) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.prm = param;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
  }
}

async function readPublicKey(): Promise<string> {
  return promisify(readFile)(
    path.join(__dirname, '../../keys/public.pem'),
    'utf8',
  );
}
async function readPrivateKey(): Promise<string> {
  return promisify(readFile)(
    path.join(__dirname, '../../keys/private.pem'),
    'utf8',
  );
}

async function encode(payload: JwtPayload): Promise<string> {
  const cert = await readPrivateKey();
  if (!cert) throw new InternalError('Token generation failure.');
  // @ts-ignore
  return await promisify(sign)({ ...payload }, cert, { algorithm: 'RS256' });
}

async function decode(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  if (!cert) throw new InternalError('Token decoding failure.');
  try {
    // @ts-ignore
    return (await promisify(verify)(token, cert, {
      ignoreExpiration: true,
    })) as JwtPayload;
  } catch (e: any) {
    throw new BadTokenError();
  }
}

async function validate(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  if (!cert) throw new InternalError('Token validating failure.');
  try {
    // @ts-ignore
    return (await promisify(verify)(token, cert)) as JwtPayload;
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') throw new TokenExpiredError();
    throw new BadTokenError();
  }
}

export default {
  encode,
  decode,
  validate,
  readPublicKey,
};
