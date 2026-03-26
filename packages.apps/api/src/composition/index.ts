import '@dotenvx/dotenvx/config';
import { Logger } from '@agentic/system.logging';
import { Server } from '../Server.js';

const logger = Logger.create({ name: 'api' });

const port = parseInt(process.env.PORT ?? '3000', 10);

export const server = Server.create({ port, logger });
