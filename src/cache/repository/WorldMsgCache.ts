import cache from '../index';
import { KEY, Message } from '../utils';
import { rule } from '../../config';

async function getBefore(score: number) {
  const end =
    (await cache.zCard(KEY.WORLD)) -
    (await cache.zCount(KEY.WORLD, score, Date.now())) -
    1;
  if (end < 0) return [];
  let start = end + 1 - rule.wmsg.maxGet;
  if (start < 0) start = 0;
  const msgs = await cache.zRange(KEY.WORLD, start, end);
  const data: Message[] = msgs.map((msg) => JSON.parse(msg) as Message);
  return data;
}

async function getAfter(score: number): Promise<Message[]> {
  const start = await cache.zCount(KEY.WORLD, 0, score);
  const end = start - 1 + rule.wmsg.maxGet;
  const msgs = await cache.zRange(KEY.WORLD, start, end);
  const data: Message[] = msgs.map((msg) => JSON.parse(msg) as Message);
  return data;
}

async function getLatest() {
  const end = await cache.zCard(KEY.WORLD);
  let start = end - rule.wmsg.maxGet;
  if (start < 0) start = 0;
  const msgs = await cache.zRange(KEY.WORLD, start, end - 1);
  const data: Message[] = msgs.map((msg) => JSON.parse(msg) as Message);
  return data;
}

async function add(message: Message) {
  await cache.zAdd(KEY.WORLD, {
    score: message.createdAt.getTime(),
    value: JSON.stringify(message),
  });
  if ((await cache.zCard(KEY.WORLD)) >= rule.wmsg.maxCapacity + 1) {
    await cache.zPopMin(KEY.WORLD);
  }
}

export default {
  getBefore,
  getAfter,
  getLatest,
  add,
};
