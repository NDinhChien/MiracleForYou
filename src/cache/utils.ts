export enum KEY {
  WORLD = 'WORLD',
}

export function getKey(id: string) {
  return `TO_${id}`;
}

import { Types } from 'mongoose';

export class Message {
  constructor(
    public authorId: Types.ObjectId,
    public authorName: string,
    public authorAvt: string | undefined,
    public isAdmin: boolean,
    public message: string,
    public createdAt: Date,
  ) {
    this.message = Message.filter(this.message);
  }
  public static filter(message: string) {
    return message;
  }
}
