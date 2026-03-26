import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from './Logger.js';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  it('creates an ILogger via factory', () => {
    const logger = Logger.create({ name: 'test' });
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('info writes to stdout with correct fields', () => {
    const logger = Logger.create({ name: 'test' });
    logger.info('hello', { port: 3000 });
    const output = JSON.parse((process.stdout.write as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(output.level).toBe('info');
    expect(output.name).toBe('test');
    expect(output.message).toBe('hello');
    expect(output.meta.port).toBe(3000);
    expect(output.timestamp).toBeDefined();
  });

  it('warn writes to stdout', () => {
    const logger = Logger.create({ name: 'test' });
    logger.warn('careful');
    const output = JSON.parse((process.stdout.write as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(output.level).toBe('warn');
  });

  it('error writes to stderr', () => {
    const logger = Logger.create({ name: 'test' });
    logger.error('boom');
    const output = JSON.parse((process.stderr.write as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(output.level).toBe('error');
  });

  it('debug writes to stdout', () => {
    const logger = Logger.create({ name: 'test' });
    logger.debug('trace');
    const output = JSON.parse((process.stdout.write as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(output.level).toBe('debug');
  });
});
