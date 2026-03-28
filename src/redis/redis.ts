import { Redis } from 'ioredis'
import dotenv from 'dotenv';

dotenv.config();

export const redis = new Redis({
								port: process.env.REDISPORT,
								host: process.env.REDISHOST,
								username: process.env.REDISUSER,
								password: process.env.REDIS_PASSWORD
});

