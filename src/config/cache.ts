// src/config/cache.ts
import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function initCache() {
    redisClient = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('connect', () => {
        console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
        console.error('❌ Redis error:', err);
    });
}

export function getRedisClient(): Redis {
    if (!redisClient) {
        throw new Error(
            'Redis Client is not initialized. Please call initCache() first.'
        );
    }
    return redisClient;
}
