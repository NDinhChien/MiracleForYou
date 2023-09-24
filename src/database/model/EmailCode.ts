import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'EmailCode';
export const COLLECTION_NAME = 'emailCodes';

export default interface EmailCode {
  _id: Types.ObjectId;
  email: string;
  code: string;
  refreshTime: number;
  tryTime: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<EmailCode>(
  {
    email: {
      type: Schema.Types.String,
      trim: true,
      required: true,
      unique: true,
    },
    code: {
      type: Schema.Types.String,
      trim: true,
      required: true,
    },
    refreshTime: {
      type: Schema.Types.Number,
      default: 0,
      min: 0,
    },
    tryTime: {
      type: Schema.Types.Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

schema.index({ verified: -1, email: 1 });

export const EmailCodeModel = model<EmailCode>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

export const newEmailCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
};

export async function sendEmailCode(
  email: string,
  code: string,
): Promise<boolean> {
  return true;
}
