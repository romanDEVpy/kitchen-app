import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuthConfig } from '../src/lib/serverConfig.js';

const ORIGINAL_ENV = { ...process.env };

function resetAuthEnv(overrides = {}) {
  process.env.JWT_SECRET = 'a-secure-test-secret-value-with-32-chars';
  process.env.ADMIN_USERNAME = 'owner';
  process.env.ADMIN_PASSWORD_HASH = 'f70904b89d0b9e09874409d06815276e:edb63da1788d39e99bd2dae360ccbb3c74118d7b66321920a03f0bc35e5f57be34fa061beda6d62b8a9344b3ef089b621d94ab124330bbdc90971f20c6731d13';
  process.env.MANAGER_USERNAME = 'crm-manager';
  process.env.MANAGER_PASSWORD_HASH = 'aaf57cf7141a90ede52194acd2bdfad5:d91cb875eb11757ea76302433ad1be4cd47cb569f692b461f38c608b7fedb47134b119f04bdbb95c165a74862dca5cc234ab3435a5bf2abfad631af440e1293a';
  Object.assign(process.env, overrides);
}

test.afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test('auth config rejects missing JWT secret instead of using a fallback', async () => {
  resetAuthEnv();
  delete process.env.JWT_SECRET;
  await assert.rejects(async () => await getAuthConfig(), (error) => error.code === 'SERVER_CONFIGURATION_ERROR' && error.details === 'Missing required env: JWT_SECRET');
});

test('auth config rejects insecure default credentials', async () => {
  resetAuthEnv({ ADMIN_USERNAME: 'admin' });
  await assert.rejects(async () => await getAuthConfig(), (error) => error.code === 'SERVER_CONFIGURATION_ERROR' && /Insecure default value/.test(error.details));
});

test('auth config rejects insecure default password hashes', async () => {
  // Hash corresponding to 'admin' password with salt '1234'
  resetAuthEnv({ ADMIN_PASSWORD_HASH: '1234:2cf0872783c3df1ecd092057a0eba0ffcb9983688e7e6695b8a9f3e94b94ad80d114d7026a200bc32b144ef5fffb0751c9b53a0981de4790f4144e6ae4f774ef' });
  await assert.rejects(async () => await getAuthConfig(), (error) => error.code === 'SERVER_CONFIGURATION_ERROR' && /Insecure default value/.test(error.details));
});

test('auth config requires a sufficiently long JWT secret', async () => {
  resetAuthEnv({ JWT_SECRET: 'short' });
  await assert.rejects(async () => await getAuthConfig(), (error) => error.code === 'SERVER_CONFIGURATION_ERROR' && /at least 32 characters/.test(error.details));
});

test('auth config accepts explicit non-default runtime credentials', async () => {
  resetAuthEnv();
  assert.deepEqual(await getAuthConfig(), {
    jwtSecret: process.env.JWT_SECRET,
    adminUsername: process.env.ADMIN_USERNAME,
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
    managerUsername: process.env.MANAGER_USERNAME,
    managerPasswordHash: process.env.MANAGER_PASSWORD_HASH
  });
});
