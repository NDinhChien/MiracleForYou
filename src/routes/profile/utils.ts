import multer, { FileFilterCallback } from 'multer';
import mime from 'mime-types';
import { BadRequestError, InternalError } from '../../core/ApiError';
import { ProtectedRequest } from 'app-request';
import { rule, getPubDir } from '../../config';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const pubDir = getPubDir();

const avatarFileFilter = (
  req: ProtectedRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const mimeType = file.mimetype;
  if (!rule.avatar.mimeTypes.includes(mimeType))
    return cb(new BadRequestError('Invalid mime type!'));

  const fileSize = parseInt(req.headers['content-length'] as string);
  if (fileSize > rule.avatar.maxSize)
    return cb(new BadRequestError('Too big in size!'));

  return cb(null, true);
};

const avatarStorage = multer.diskStorage({
  destination: function (
    req: ProtectedRequest,
    file: Express.Multer.File,
    cb: DestinationCallback,
  ) {
    cb(null, path.join(pubDir, '/avatars'));
  },
  filename: function (
    req: ProtectedRequest,
    file: Express.Multer.File,
    cb: FileNameCallback,
  ) {
    if (req.user)
      cb(null, req.user._id.toString() + '.' + mime.extension(file.mimetype));
    else cb(new InternalError(), '');
  },
});

export default multer({
  limits: { fileSize: rule.avatar.maxSize },
  fileFilter: avatarFileFilter,
  storage: avatarStorage,
});

export async function deleteOldAvatar(newAvatar: string) {
  const id = newAvatar.substring(0, newAvatar.lastIndexOf('.'));
  let fname = '';
  for (const mm of rule.avatar.mimeTypes) {
    fname = id + '.' + mime.extension(mm);
    if (fname === newAvatar) continue;
    if (fs.existsSync(path.join(pubDir, 'avatars', fname))) {
      await promisify(fs.unlink)(path.join(pubDir, 'avatars', fname));
      return;
    }
  }
}
