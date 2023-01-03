import IORedis, { KeyType, ValueType } from 'ioredis';

import configs from '../config';

export class RedisService {
  private static instance: RedisService;
  private redis!: IORedis.Redis;
  private publisher!: IORedis.Redis;
  private subscriber!: IORedis.Redis;

  private PORT = configs.REDIS_PORT;
  private HOST = configs.REDIS_HOST;

  constructor() {
    if (RedisService.instance instanceof RedisService) {
      return RedisService.instance;
    }

    this.redis = new IORedis({ port: this.PORT, host: this.HOST });
    this.publisher = new IORedis({ port: this.PORT, host: this.HOST });
    this.subscriber = new IORedis({ port: this.PORT, host: this.HOST });

    RedisService.instance = this;
  }

  getInstance = (): IORedis.Redis => this.redis;

  getPublisher = (): IORedis.Redis => this.publisher;

  getSubscriber = (): IORedis.Redis => this.subscriber;

  publish = async (channel: string, message: string): Promise<number> => {
    return await this.publisher.publish(channel, message);
  };

  psubscribe = async (channel: string): Promise<number> => {
    return await this.subscriber.psubscribe(channel);
  };

  punsubscribe = async (channel: string): Promise<number> => {
    return await this.subscriber.punsubscribe(channel);
  };

  hset = async (key: KeyType, field: string, value: ValueType): Promise<boolean> => {
    // @ts-ignore
    return (await this.redis.hset(key, field, value)) === 'OK';
  };

  hdel = async (key: KeyType, field: string): Promise<number> => {
    return await this.redis.hdel(key, field);
  };

  disconnect = (): void => {
    this.redis.disconnect();
    this.publisher.disconnect();
    this.subscriber.disconnect();
  };
}
