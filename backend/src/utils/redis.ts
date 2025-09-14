import { createClient } from 'redis';
import logger from './logger';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  logger.error('Redis Client Error', { error: err.message });
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.info('Redis disabled - no REDIS_URL provided');
    return;
  }
  try {
    await client.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', { error });
  }
};

export const setCache = async (key: string, value: any, ttl: number = 300) => {
  if (!process.env.REDIS_URL) return;
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error('Redis SET error', { key, error });
  }
};

export const getCache = async (key: string) => {
  if (!process.env.REDIS_URL) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis GET error', { key, error });
    return null;
  }
};

export default client;