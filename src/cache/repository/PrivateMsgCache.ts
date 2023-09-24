import { getKey, Message } from '../utils';
import cache from '../index';

async function get(id: string) {
  const msgs = await cache.lRange(getKey(id), 0, -1);
  const data: Message[] = msgs.map((msg) => JSON.parse(msg) as Message);
  cache.del(getKey(id));
  return data;
}

async function add(id: string, message: Message) {
  return await cache.rPush(getKey(id), JSON.stringify(message));
}

export default {
  get,
  add,
};
