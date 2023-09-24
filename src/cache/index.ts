import { redis } from '../config';
import { createClient } from 'redis';
import Logger from '../core/Logger';
import { KEY } from './utils';

const client = createClient({
  password: redis.password,
  socket: {
    host: redis.host,
    port: redis.port,
  },
});

client.on('connect', () => Logger.info('Cache is connecting'));
client.on('ready', () => Logger.info('Cache is ready'));
client.on('end', () => Logger.info('Cache disconnected'));
client.on('reconnecting', () => Logger.info('Cache is reconnecting'));
client.on('error', (e) => Logger.error(e));

(async () => {
  await client.connect();
  await client.del(KEY.WORLD);
})();

// If the Node process ends, close the Cache connection
process.on('SIGINT', async () => {
  await client.disconnect();
});

export default client;
