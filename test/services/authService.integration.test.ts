import nock from 'nock';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:3001';
process.env.API_BASE_URL = API_BASE;
import * as authService from '../../src/services/authService';


beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
  nock.cleanAll();
  nock.restore();
});

describe('authService integration (with HTTP mocks)', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    if (!nock.isDone()) {
      // Print pending mocks for easier debugging
      // eslint-disable-next-line no-console
      console.error('Pending mocks:', nock.pendingMocks());
    }
    nock.cleanAll();
  });

  it('login() returns token on success', async () => {
    const scope = nock(API_BASE)
      .post('/api/login', { email: 'alice@example.com', password: 'pw' })
      .reply(200, { token: 'mock-token-123' });

    const token = await authService.login('alice@example.com', 'pw');
    expect(token).toBe('mock-token-123');
    scope.done();
  });

  it('login() throws on 401', async () => {
    const scope = nock(API_BASE)
      .post('/api/login')
      .reply(401, { message: 'Unauthorized' });

    await expect(authService.login('bad@example.com', 'wrong')).rejects.toThrow();
    scope.done();
  });

  it('register() posts data and resolves', async () => {
    const scope = nock(API_BASE)
      .post('/api/register', { email: 'new@example.com', password: 'Secret1!' })
      .reply(201);

    await expect(
      authService.register('new@example.com', 'Secret1!'),
    ).resolves.toBeUndefined();
    scope.done();
  });
});
