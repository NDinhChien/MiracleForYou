import { model, Schema, Types } from 'mongoose';
import Role, { RoleCode } from './Role';
import bcrypt from 'bcrypt';
import _ from 'lodash';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export default interface User {
  _id: Types.ObjectId;
  email?: string;
  password?: string;
  name?: string;
  nameUpdatedAt?: Date;
  avatar?: string;
  gender?: boolean;
  birthday?: Date;
  city?: string;
  intro?: string;
  roles?: Role[];
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<User>(
  {
    email: {
      type: Schema.Types.String,
      trim: true,
      unique: true,
      select: false,
      required: true,
    },
    password: {
      type: Schema.Types.String,
      select: false,
      required: true,
    },
    name: {
      type: Schema.Types.String,
      trim: true,
      unique: true,
      minlength: 4,
      maxlength: 20,
    },
    nameUpdatedAt: {
      type: Schema.Types.Date,
      select: false,
    },
    avatar: {
      type: Schema.Types.String,
    },
    gender: {
      type: Schema.Types.Boolean,
    },
    birthday: {
      type: Schema.Types.Date,
    },
    city: {
      type: Schema.Types.String,
      minlength: 2,
      maxlength: 30,
    },
    intro: {
      type: Schema.Types.String,
      minlength: 2,
      maxlength: 2000,
    },
    roles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
      required: true,
      select: false,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
      select: false,
    },
    createdAt: {
      type: Schema.Types.Date,
      select: false,
      default: Date.now,
    },
    updatedAt: {
      type: Schema.Types.Date,
      select: false,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

schema.index({ status: -1 });
schema.index({ status: -1, _id: 1 });

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);

export const isAdmin = (user: User) => {
  for (const role of user.roles as Role[]) {
    if (role.status && role.code === RoleCode.ADMIN) return true;
  }
  return false;
};

export function getUserData(user: User) {
  return _.pick(user, [
    '_id',
    'email',
    'name',
    'avatar',
    'roles',
    'gender',
    'birthday',
    'city',
    'intro',
  ]);
}

export const newUserName = () => {
  return 'user' + Date.now().toString();
};

export const newResetPassword = () => {
  let psw = '';
  for (let i = 0; i < 6; i++) psw += Math.floor(Math.random() * 10).toString();
  return psw;
};

export async function sendResetPassword(email: string, password: string) {
  return true;
}

export async function hash(message: string) {
  return await bcrypt.hash(message, 10);
}

export async function compare(currentPassword: string, password: string) {
  return await bcrypt.compare(currentPassword, password);
}
