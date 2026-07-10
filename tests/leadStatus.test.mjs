import test from 'node:test';
import assert from 'node:assert/strict';
import { LEAD_STATUSES, isLeadStatus } from '../src/lib/leadStatus.js';

test('lead status allow-list contains the CRM pipeline states', () => {
  assert.deepEqual(LEAD_STATUSES, [
    'NEW',
    'PROCESSING',
    'MEASURING',
    'PROJECT_READY',
    'SIGNED',
    'CANCELLED'
  ]);
});

test('lead status validator rejects arbitrary frontend strings', () => {
  assert.equal(isLeadStatus('SIGNED'), true);
  assert.equal(isLeadStatus('DELETED'), false);
  assert.equal(isLeadStatus(''), false);
});
