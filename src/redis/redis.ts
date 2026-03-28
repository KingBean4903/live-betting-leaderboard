import { Redis } from 'ioredis'

const redis = new Redis({
								port: process.env.REDISPORT,
								host: process.env.REDISHOST,
								username: process.env.REDISUSER,
								password: process.env.REDIS_PASSWORD
});

export redis;redis
