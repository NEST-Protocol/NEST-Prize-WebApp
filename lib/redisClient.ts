import {createClient} from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err: any) => console.log('Redis Client Error', err));

export default client;