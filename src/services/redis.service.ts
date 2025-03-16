// src/services/redis.service.ts
import { createClient, RedisClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config(); // .env 로드

export class RedisService {
    private client: RedisClient;

    constructor() {
        const options: any = {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };
        if (process.env.REDIS_PASSWORD) {
            options.password = process.env.REDIS_PASSWORD;
        }
        this.client = createClient(options);
    }

    public async get(key: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (err) return reject(err);
                resolve(reply);
            });
        });
    }

    public async set(
        key: string,
        value: string,
        duration: number
    ): Promise<boolean> {
        return new Promise((resolve) => {
            this.client.set(key, value, 'EX', duration, (error) => {
                if (error) return resolve(false);
                resolve(true);
            });
        });
    }

    public async incr(key: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.client.incr(key, (err, number) => {
                if (err) return reject(err);
                resolve(number);
            });
        });
    }

    public async del(key: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.client.del(key, (error) => {
                if (error) return resolve(false);
                resolve(true);
            });
        });
    }

    public async pub(channel: string, value: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.client.publish(channel, value, (err, reply) => {
                if (err) return reject(err);
                resolve(reply);
            });
        });
    }
}
