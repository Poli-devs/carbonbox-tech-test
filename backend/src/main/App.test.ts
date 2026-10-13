import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { App } from './App';

describe('Fastify REST API Integration Tests', () => {
  const app = new App();

  beforeAll(async () => {
    // Start app without integrated worker loop to test HTTP cleanly
    await app.setup();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns status ok', async () => {
    const response = await app.getFastify().inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('carbonbox-backend');
  });

  it('GET /api/v1/uploads returns list and stats', async () => {
    const response = await app.getFastify().inject({
      method: 'GET',
      url: '/api/v1/uploads?page=1&limit=10',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.stats).toBeDefined();
    expect(typeof body.total).toBe('number');
  });
});
