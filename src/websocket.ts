import { getRepository } from 'typeorm';
import querystring from 'querystring';
import { Server } from 'http';
import WebSocket from 'ws';

import { isAccessToken, verifyToken } from './service/token';
import { BadRequestError, UnauthorizedError } from './error';
import { RedisService } from './service/redis';
import { getAuthCookie } from './utils/cookie';
import { Users } from './model/Users';
import { Token } from './constants';
import logger from './service/log';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

interface SubscriberInfo {
  ws: WebSocket;
  channel: string;
}

export const channelType = 'machine:';

export class WebSocketWrapper {
  private connections: Record<string, SubscriberInfo> = {};
  private wss: WebSocket.Server | null = null;

  private static instance: WebSocketWrapper;

  constructor(private server: Server, private redisService: RedisService) {
    if (WebSocketWrapper.instance instanceof WebSocketWrapper) {
      return WebSocketWrapper.instance;
    }

    this.wss = new WebSocket.Server({ noServer: true });
    this.addSubscriberListener();
    this.addWebSocketListener();

    WebSocketWrapper.instance = this;
  }

  init(): void {
    const redis = this.getRedisInstance();

    this.server.on('upgrade', async (request, socket, head: Buffer) => {
      try {
        const userInfo = await this.authenticate(request);
        const key = `${channelType}${userInfo.machineId}`;

        redis.hset(key, userInfo.userId as string, 'true');

        // @ts-ignore
        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.wss?.emit('connection', ws, request, { ...userInfo, channel: key });
        });
      } catch (error) {
        logger.error('Error in socket connection : ', error);
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });
  }

  private getSubscriber() {
    return this.redisService.getSubscriber();
  }

  private getRedisInstance() {
    return this.redisService.getInstance();
  }

  private addSubscriberListener() {
    const redisSubscriber = this.getSubscriber();
    const redis = this.getRedisInstance();

    redisSubscriber.psubscribe(`${channelType}*`);

    redisSubscriber.on('pmessage', async (_: string, channel: string, message: string) => {
      // retrieving all subscribers related to specific channel
      const subscribers = await redis.hgetall(channel);

      // retrieving all users user ids.
      const userIds = Object.keys(subscribers);

      if (userIds && userIds.length) {
        const payload = JSON.stringify({ channel, data: JSON.parse(message) });

        userIds.forEach((userId) => {
          // retrieving connection info of specific user.
          const connection = this.connections[userId];
          if (connection) {
            const websocket = connection.ws;
            websocket.send(payload);
          }
        });
      }
    });
  }

  private addWebSocketListener() {
    const redis = this.getRedisInstance();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wss?.on('connection', (ws: WebSocket, _: any, client: Record<string, string | number>) => {
      const { userId } = client;

      this.connections[userId] = {
        ws,
        channel: client.channel as string,
      };

      ws.on('close', async () => {
        const connection = this.connections[userId];

        await redis.hdel(connection.channel, userId as string);

        delete this.connections[userId];
      });

      logger.info(`Socket connection established with user : [${userId}]`);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async authenticateUser(request: any) {
    const authCookie = getAuthCookie(request.headers.cookie as string);
    const authHeader = request.headers.authorization;

    if (!authHeader && !authCookie) {
      logger.error('JWT token is missing');
      throw new Error('JWT token is missing');
    }

    const [, token] = (authCookie || authHeader).split(' ');

    try {
      const decoded = await verifyToken(token, Token.ACCESS);

      if (!isAccessToken(decoded)) {
        logger.error(`Provided token is not valid access token : [${token}]`);
        throw new BadRequestError(
          'Provided token is not valid access token',
          'INVALID_ACCESS_TOKEN',
        );
      }

      const { sub } = decoded as TokenPayload;

      const usersRepo = getRepository(Users);
      const user = await usersRepo.findOne(sub, {
        relations: ['factories'],
      });

      if (!user) {
        logger.info(`user does not exists with user id [${sub}]`);
        throw new UnauthorizedError('User does not exist.');
      }

      request.user = {
        id: sub,
      };

      return user;
    } catch (err) {
      logger.error('Error in socket connection : ', err);
      throw new UnauthorizedError('Invalid JWT token', 'INVALID_TOKEN');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async authenticate(request: any) {
    if (!request) {
      logger.error('request object missing : ', request);
      throw new Error('request missing');
    }

    const queryString = request.url.split('?')[1];
    const queryJson = querystring.parse(queryString);
    const user = await this.authenticateUser(request);

    const userInfo: Record<string, string | number> = {
      userId: user.id,
      machineId: parseInt(queryJson.machineId as string, 10),
    };

    return userInfo;
  }
}
