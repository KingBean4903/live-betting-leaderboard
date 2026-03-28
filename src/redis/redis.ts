import { Redis } from 'ioredis'

const port: number = Number(process.env.REDISPORT) || 6379

export const redis = new Redis({
								port: port,
								host: process.env.REDISHOST as string,
								username: process.env.REDISUSER as string,
								password: process.env.REDIS_PASSWORD as string
});

