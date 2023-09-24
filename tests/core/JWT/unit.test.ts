import { Types } from 'mongoose';
import JWT, { JwtPayload } from '../../../src/core/JWT';
import { BadTokenError, TokenExpiredError } from '../../../src/core/ApiError';
import { tokenInfo } from '../../../src/config';

import { promisify } from 'util';
import * as path from 'path';
import { readFile } from 'fs';
import { sign } from 'jsonwebtoken';

const ID = new Types.ObjectId();
const PRM = 'abcde';

describe('Json Web Token - unit test', () => {
  const validPayload = new JwtPayload(
    tokenInfo.issuer,
    tokenInfo.audience,
    ID.toString(),
    PRM,
    120,
  );
  const expiredPayload = new JwtPayload(
    tokenInfo.issuer,
    tokenInfo.audience,
    ID.toString(),
    PRM,
    -120,
  );

  it(`if a token created by encoding an unexpired payload, then both decoding and validating that token will give the original payload`, async () => {
    const token = await JWT.encode(validPayload);
    expect(await JWT.decode(token)).toEqual(validPayload);
    expect(await JWT.validate(token)).toEqual(validPayload);
  });

  it(`if a token created by encoding an expired payload, then decoding that token will give the original payload but validating should throw error`, async () => {
    const token = await JWT.encode(expiredPayload);
    expect(await JWT.decode(token)).toEqual(expiredPayload);
    expect(JWT.validate(token)).rejects.toThrow(TokenExpiredError);
  });

  it(`if a token created from a different private key, then both decoding and validing should throw errors`, async () => {
    const cert = await promisify(readFile)(
      path.resolve('keys/private.example.pem'),
      'utf-8',
    );
    // @ts-ignore
    const token = await promisify(sign)({ ...validPayload }, cert, {
      algorithm: 'RS256',
    });
    expect(JWT.decode(token ? token : '')).rejects.toThrow(BadTokenError);
    expect(JWT.validate(token ? token : '')).rejects.toThrow(BadTokenError);
  });
});
