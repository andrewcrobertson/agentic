import { describe, expect, it, vi } from 'vitest';
import { healthHandler } from './health.js';
import type { Request, Response } from 'express';

describe('healthHandler', () => {
  it('responds with { status: "ok" }', () => {
    const req = {} as Request;
    const res = { json: vi.fn() } as unknown as Response;

    healthHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
