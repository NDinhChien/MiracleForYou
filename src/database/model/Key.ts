import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Key';
export const COLLECTION_NAME = 'keys';

export default interface Key {
  _id: Types.ObjectId;
  email: string;
  primaryKey: string;
  secondaryKey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Key>(
  {
    email: {
      type: Schema.Types.String,
      trim: true,
      required: true,
      unique: true,
    },
    primaryKey: {
      type: Schema.Types.String,
      trim: true,
      required: true,
    },
    secondaryKey: {
      type: Schema.Types.String,
      trim: true,
      required: true,
    },
    createdAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

export const KeyModel = model<Key>(DOCUMENT_NAME, schema, COLLECTION_NAME);
