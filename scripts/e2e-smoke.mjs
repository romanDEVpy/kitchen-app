import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const port = Number(process.env.E2E_PORT || 3017);
const baseUrl = `http://127.0.0.1:${port}`;
const scratchDir = path.join(root, 'scratch');
const dbPath = path.join(scratchDir, 'e2e-smoke.db');

const env = Object.fromEntries(Object.entries({
  ...process.env,
  NODE_ENV: 'production',
  PORT: String(port),
  DATABASE_FILE: dbPath,
  JWT_SECRET: 'e2e-secure-secret-value-with-at-least-32-characters',
  ADMIN_USERNAME: 'e2e-admin',
  ADMIN_PASSWORD_HASH: '2cdca5fe554527019e8f8f81ff34e441:f9ce3e5d46003ac19ac611140da38ed7a01eeb6e574da9d8afc370634478af0cc902bc31bc8a73e451dfe7439923e71e96513f77e6d113bedd153f9fdf241f4c',
  MANAGER_USERNAME: 'e2e-manager',
  MANAGER_PASSWORD_HASH: '4040f7d70ebfff73c1bd636c55400bbb:a0c5ea4bc2e177d8fea0626bedccc74ac87faf69ed43c2a930c1d6d9e3721cf0baae7f9b8e557c1ae9e0ec394b1fefaff072bc0258d74409849b98d4c8e80b43',
  TELEGRAM_BOT_TOKEN: '',
  TELEGRAM_CHAT_ID: ''
}).filter(([, value]) => value !== undefined));

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: 'manual',
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body };
}

async function waitForServer(child) {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`next start exited early with code ${child.exitCode}`);
    }
    try {
      const res = await fetch(`${baseUrl}/`);
      if (res.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError || new Error('Timed out waiting for server');
}

async function login(username, password) {
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  assert.equal(response.status, 200, JSON.stringify(body));
  assert.equal(body.ok, true);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie || '', /admin_token=/);
  return cookie.split(';')[0];
}

await mkdir(scratchDir, { recursive: true });
await rm(dbPath, { force: true });
await copyFile(path.join(root, 'dev.db'), dbPath);

const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextCli, 'start', '--port', String(port)], {
  cwd: root,
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

try {
  await waitForServer(child);

  assert.equal((await request('/')).response.status, 200);
  assert.equal((await request('/catalog')).response.status, 200);

  const invalidLead = await request('/api/leads', {
    method: 'POST',
    body: JSON.stringify({ name: 'No Phone', phone: '' })
  });
  assert.equal(invalidLead.response.status, 400);
  assert.equal(invalidLead.body.ok, false);
  assert.equal(invalidLead.body.error.code, 'VALIDATION_ERROR');

  const created = await request('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      name: 'E2E Client',
      phone: '+79991234567',
      kitchenType: 'straight',
      budget: 'test budget',
      city: 'Moscow',
      role: 'admin'
    })
  });
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.ok, true);
  const leadId = created.body.data.leadId;
  assert.ok(leadId);

  const publicRead = await request('/api/leads');
  assert.equal(publicRead.response.status, 401);
  assert.equal(publicRead.body.error.code, 'AUTHENTICATION_REQUIRED');

  // Dynamic user creation testing
  const adminCookieForSetup = await login(env.ADMIN_USERNAME, 'e2e-admin-password');
  const createManagerRes = await request('/api/users', {
    method: 'POST',
    headers: { cookie: adminCookieForSetup },
    body: JSON.stringify({
      username: env.MANAGER_USERNAME,
      password: 'e2e-manager-password',
      canManageLeads: true,
      canDeleteLeads: true,
      canManageProducts: false,
      canManageReviews: false,
      canManagePromos: false
    })
  });
  assert.equal(createManagerRes.response.status, 201, JSON.stringify(createManagerRes.body));

  const managerCookie = await login(env.MANAGER_USERNAME, 'e2e-manager-password');
  const managerLeads = await request('/api/leads', { headers: { cookie: managerCookie } });
  assert.equal(managerLeads.response.status, 200, JSON.stringify(managerLeads.body));
  assert.equal(managerLeads.body.ok, true);
  assert.ok(managerLeads.body.data.some((lead) => lead.id === leadId));

  const managerMassAssignment = await request(`/api/leads?id=${leadId}`, {
    method: 'PATCH',
    headers: { cookie: managerCookie },
    body: JSON.stringify({ status: 'PROCESSING', role: 'admin' })
  });
  assert.equal(managerMassAssignment.response.status, 400);
  assert.equal(managerMassAssignment.body.error.code, 'VALIDATION_ERROR');

  const managerUpdate = await request(`/api/leads?id=${leadId}`, {
    method: 'PATCH',
    headers: { cookie: managerCookie },
    body: JSON.stringify({ status: 'PROCESSING', notes: 'manager note' })
  });
  assert.equal(managerUpdate.response.status, 200, JSON.stringify(managerUpdate.body));
  assert.equal(managerUpdate.body.data.status, 'PROCESSING');

  const managerDelete = await request(`/api/leads?id=${leadId}`, {
    method: 'DELETE',
    headers: { cookie: managerCookie },
    body: JSON.stringify({})
  });
  assert.equal(managerDelete.response.status, 200, JSON.stringify(managerDelete.body));
  assert.equal(managerDelete.body.data.deleted, true);

  const managerProductCreate = await request('/api/products', {
    method: 'POST',
    headers: { cookie: managerCookie },
    body: JSON.stringify({ title: 'Denied', slug: 'denied', shape: 'straight', frontType: 'AGT', price: 1, imageUrl: '/x.jpg', width: 1, height: 1, depth: 1 })
  });
  assert.equal(managerProductCreate.response.status, 403);

  const managerPromoCreate = await request('/api/promos', {
    method: 'POST',
    headers: { cookie: managerCookie },
    body: JSON.stringify({ title: 'Denied', discount: '1%', description: 'Denied' })
  });
  assert.equal(managerPromoCreate.response.status, 403);

  const managerReviewCreate = await request('/api/reviews', {
    method: 'POST',
    headers: { cookie: managerCookie },
    body: JSON.stringify({ author: 'Denied', rating: 5, text: 'Denied' })
  });
  assert.equal(managerReviewCreate.response.status, 403);

  const managerLogs = await request('/api/logs', { headers: { cookie: managerCookie } });
  assert.equal(managerLogs.response.status, 403);

  const invalidToken = await request('/api/leads', { headers: { cookie: 'admin_token=invalid-token' } });
  assert.equal(invalidToken.response.status, 401);

  // Create another lead to verify admin deletion works and logs the audit event
  const leadResponse2 = await request('/api/leads', {
    method: 'POST',
    body: JSON.stringify({ name: 'E2E Client 2', phone: '+79998887767', kitchenType: 'corner', installTime: '3months', budget: '200k', city: 'Moscow' })
  });
  assert.equal(leadResponse2.response.status, 201, JSON.stringify(leadResponse2.body));
  const leadId2 = leadResponse2.body.data.leadId;

  const adminCookie = await login(env.ADMIN_USERNAME, 'e2e-admin-password');
  const adminDelete = await request(`/api/leads?id=${leadId2}`, {
    method: 'DELETE',
    headers: { cookie: adminCookie },
    body: JSON.stringify({})
  });
  assert.equal(adminDelete.response.status, 200, JSON.stringify(adminDelete.body));

  const adminLogs = await request('/api/logs', { headers: { cookie: adminCookie } });
  assert.equal(adminLogs.response.status, 200, JSON.stringify(adminLogs.body));
  assert.equal(adminLogs.body.ok, true);
  assert.ok(adminLogs.body.data.some((entry) => entry.action === 'LEAD_DELETED'));

  const badUpload = new FormData();
  badUpload.append('file', new Blob(['not an image'], { type: 'image/png' }), '../fake.png');
  const uploadResult = await request('/api/upload', { method: 'POST', body: badUpload });
  assert.equal(uploadResult.response.status, 400);
  assert.equal(uploadResult.body.error.code, 'VALIDATION_ERROR');

  console.log('E2E smoke passed');
} catch (error) {
  console.error(stdout);
  console.error(stderr);
  throw error;
} finally {
  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));
}
