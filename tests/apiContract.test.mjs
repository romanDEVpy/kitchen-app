import test from 'node:test';
import assert from 'node:assert/strict';
import { ERROR_CODES, ApiError, errorResponse, handleApiError, successResponse } from '../src/lib/apiResponse.js';

test('successResponse wraps payload in the standard API contract', async () => {
  const response = successResponse({ id: 'lead-1' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, data: { id: 'lead-1' } });
});

test('errorResponse hides details and uses the standard error contract', async () => {
  const response = errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Check submitted data', 400, 'raw details');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Check submitted data',
      details: 'raw details'
    }
  });
});

test('handleApiError converts ApiError to the standard error contract', async () => {
  const response = handleApiError(new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden', 403), 'test');
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: { code: ERROR_CODES.FORBIDDEN, message: 'Forbidden' }
  });
});
