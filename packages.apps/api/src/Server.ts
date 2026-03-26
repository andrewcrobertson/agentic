import express from 'express';
import type { ILogger } from '@andrewcrobertson/system.logging';
import type { IServer } from './IServer.js';
import { healthHandler } from './routes/health.js';

export interface ServerOptions {
  port: number;
  logger: ILogger;
}

class ServerImpl implements IServer {
  private readonly app: express.Application;
  private readonly port: number;
  private readonly logger: ILogger;

  constructor(options: ServerOptions) {
    this.port = options.port;
    this.logger = options.logger;
    this.app = express();
    this.app.use(express.json());
    this.app.use((req, _res, next) => {
      this.logger.info(`${req.method} ${req.path}`);
      next();
    });
    this.app.get('/health', healthHandler);
  }

  start(): void {
    this.app.listen(this.port, () => {
      this.logger.info(`Server listening`, { port: this.port });
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}

export const Server = {
  create(options: ServerOptions): IServer & { getApp(): express.Application } {
    return new ServerImpl(options);
  },
};
