import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'LoginAttempt';
export const COLLECTION_NAME = 'loginAttempts';

export default interface LoginAttempt {
  _id: Types.ObjectId;
  tryTime: number;
  updatedAt: Date;
}

const schema = new Schema<LoginAttempt>(
  {
    tryTime: {
      type: Schema.Types.Number,
      default: 0,
      min: 0,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

export const LAModel = model<LoginAttempt>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
