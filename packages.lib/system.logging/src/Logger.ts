import type { ILogger } from './ILogger.js';

export interface LoggerOptions {
  name: string;
}

class LoggerImpl implements ILogger {
  private readonly name: string;

  constructor(options: LoggerOptions) {
    this.name = options.name;
  }

  private write(level: string, message: string, meta?: Record<string, unknown>): void {
    const entry = JSON.stringify({
      level,
      name: this.name,
      message,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta } : {}),
    });
    if (level === 'error') {
      process.stderr.write(entry + '\n');
    } else {
      process.stdout.write(entry + '\n');
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write('debug', message, meta);
  }
}

export const Logger = {
  create(options: LoggerOptions): ILogger {
    return new LoggerImpl(options);
  },
};
