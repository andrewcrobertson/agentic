import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'http';
import express from 'express';
import { healthHandler } from './health.js';

let httpServer: Server;
let baseUrl: string;

beforeAll(() => {
  const app = express();
  app.get('/health', healthHandler);
  return new Promise<void>((resolve) => {
    httpServer = app.listen(0, () => {
      const addr = httpServer.address() as { port: number };
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise<void>((resolve, reject) => {
    httpServer.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('GET /health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
