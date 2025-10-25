import request from 'supertest';
import express from 'express';

describe('basic', () => {
  it('health route', async () => {
    const app = express();
    app.get('/api/health', (_, res) => res.json({ ok: true }));
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
