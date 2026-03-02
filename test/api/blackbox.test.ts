import axios from 'axios';
import { describe, it, expect } from 'vitest';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

describe('API blackbox tests (external integration)', () => {
  it('server root returns 200', async () => {
    const resp = await axios.get(`${API_BASE}/`);
    expect(resp.status).toBe(200);
    // optional: basic response shape
    expect(resp.data).toBeDefined();
  });

  it('login returns token with TEST credentials (if provided)', async () => {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    if (!email || !password) {

      console.warn('Skipping login test: TEST_EMAIL/TEST_PASSWORD not set');
      return;
    }

    const resp = await axios.post(`${API_BASE}/api/login`, { email, password });
    expect(resp.status).toBe(200);
    expect(resp.data?.token).toBeTruthy();
  });
});
