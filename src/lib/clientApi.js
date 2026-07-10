export async function parseApiResponse(response) {
  const payload = await response.json().catch(() => null);
  if (payload && payload.ok === true) {
    return payload.data;
  }
  if (payload && payload.ok === false) {
    const error = new Error(payload.error?.message || 'Data loaded');
    error.code = payload.error?.code;
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(payload?.error || response.statusText || 'Data loaded');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function getApiErrorMessage(error, fallback = 'Data loaded') {
  return error?.message || fallback;
}
