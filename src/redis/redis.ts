import { Redis } from 'ioredis'

const redis_url = process.env.REDIS_URL as string

const redis = new Redis(redis_url);

export redis;
