import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function json(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  let body;
  try { body = await response.json(); } catch { body = null; }
  return { response, body };
}

test('Phase 23 health and readiness contracts stay consistent', async () => {
  const health = await json('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.ok, true);
  assert.equal(health.body.phase, 23);
  assert.equal(health.response.headers.get('cache-control'), 'no-store');

  const ready = await json('/api/ready');
  assert.ok([200, 503].includes(ready.response.status));
  assert.equal(ready.body.phase, 23);
  assert.equal(ready.body.ok, ready.response.status === 200);
  assert.equal(ready.body.database === 'connected', ready.response.status === 200);
});

test('company profile and chatbot configuration provide usable public workflow context', async () => {
  const company = await json('/api/company');
  assert.equal(company.response.status, 200);
  assert.equal(company.body.company.name, 'Shahnawaz Enterprises');
  assert.equal(company.body.company.tagline, 'We Make Interiors');
  assert.ok(Array.isArray(company.body.company.services));
  assert.ok(company.body.company.services.length > 0);

  const chatbot = await json('/api/chatbot/config');
  assert.equal(chatbot.response.status, 200);
  assert.match(chatbot.body.name, /Shahnawaz Enterprises/);
  assert.ok(Array.isArray(chatbot.body.features));
});

test('appointment and delivery setup endpoints expose valid workflow options', async () => {
  const appointment = await json('/api/appointments/config');
  assert.equal(appointment.response.status, 200);
  assert.equal(appointment.body.timezone, 'Asia/Karachi');
  assert.ok(Array.isArray(appointment.body.types) && appointment.body.types.length > 0);
  assert.ok(appointment.body.types.every(item => item.key && Number(item.durationMinutes) > 0));

  const delivery = await json('/api/deliveries/config');
  assert.equal(delivery.response.status, 200);
  assert.ok(Array.isArray(delivery.body.cities) && delivery.body.cities.length > 0);
  assert.ok(Array.isArray(delivery.body.statuses) && delivery.body.statuses.includes('delivered'));
  assert.ok(Array.isArray(delivery.body.timeWindows) && delivery.body.timeWindows.length > 0);
});

test('review configuration exposes rating and eligibility contract', async () => {
  const result = await json('/api/reviews/config');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.ratingScale, 5);
  assert.equal(result.body.minimumBodyLength, 20);
  assert.ok(result.body.eligibleStatuses.includes('delivered'));
  assert.ok(result.body.eligibleStatuses.includes('completed'));
});

test('estimate configuration exposes preliminary PKR rates and disclaimer', async () => {
  const result = await json('/api/estimates/config');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.currency, 'PKR');
  assert.ok(result.body.materialRates && Object.keys(result.body.materialRates).length > 0);
  assert.ok(result.body.finishRates && Object.keys(result.body.finishRates).length > 0);
  assert.match(result.body.note, /planning defaults|verified company rates/i);
});

test('calculator supports a multi-item project estimate without database fixtures', async () => {
  const result = await json('/api/estimates/calculate-project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        { quantity: 2, dimensions: { length: 6, width: 3 }, material: 'MDF', finish: 'Matte' },
        { quantity: 1, dimensions: { length: 4, width: 2 }, material: 'Plywood', finish: 'Veneer' }
      ]
    })
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.estimate.isPreliminary, true);
  assert.equal(result.body.estimate.totals.count, 2);
  assert.equal(result.body.estimate.lineItems.length, 2);
  assert.ok(result.body.estimate.totals.total > 0);
  assert.equal(result.body.estimate.currency, 'PKR');
});

test('calculator rejects empty project estimates with a clear client error', async () => {
  const result = await json('/api/estimates/calculate-project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [] })
  });
  assert.equal(result.response.status, 400);
  assert.match(result.body.message, /at least one estimate item/i);
});

test('customer-owned workflows reject requests without a bearer token', async () => {
  const routes = [
    ['/api/users/profile', 'GET'],
    ['/api/quotations/mine', 'GET'],
    ['/api/orders/mine', 'GET'],
    ['/api/appointments/mine', 'GET'],
    ['/api/invoices/mine', 'GET'],
    ['/api/reviews/mine', 'GET'],
    ['/api/deliveries/mine/507f1f77bcf86cd799439011', 'GET']
  ];
  for (const [path, method] of routes) {
    const result = await json(path, { method });
    assert.equal(result.response.status, 401, `${method} ${path} must require authentication`);
    assert.ok(result.body?.message, `${method} ${path} should explain the auth failure`);
  }
});

test('administrator workflows reject requests without a bearer token', async () => {
  const routes = [
    '/api/admin/dashboard',
    '/api/admin/products',
    '/api/admin/quotations',
    '/api/admin/orders',
    '/api/admin/appointments',
    '/api/admin/deliveries',
    '/api/admin/reviews',
    '/api/admin/inventory',
    '/api/admin/invoices',
    '/api/admin/portfolio',
    '/api/admin/media/status'
  ];
  for (const path of routes) {
    const result = await json(path);
    assert.equal(result.response.status, 401, `GET ${path} must require authentication`);
    assert.ok(result.body?.message, `GET ${path} should explain the auth failure`);
  }
});

test('invalid JSON stays rejected during workflow requests', async () => {
  const result = await json('/api/quotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad-json'
  });
  assert.equal(result.response.status, 400);
  assert.equal(result.body.message, 'Request body contains invalid JSON.');
});
