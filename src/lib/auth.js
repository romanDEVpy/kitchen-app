import { ApiError, ERROR_CODES } from './apiResponse.js';

const encoder = new TextEncoder();

export async function hashPassword(password) {
  const saltBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(saltHex),
      iterations: 100000,
      hash: 'SHA-512'
    },
    baseKey,
    512
  );
  
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [saltHex, originalHash] = storedHash.split(':');
  
  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(saltHex),
      iterations: 100000,
      hash: 'SHA-512'
    },
    baseKey,
    512
  );
  
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === originalHash;
}

async function getCryptoKey(secret) {
  const keyData = encoder.encode(secret);
  return globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function resolveSecret(secret) {
  const s = secret || process.env.JWT_SECRET;
  if (!s) {
    throw new ApiError(ERROR_CODES.SERVER_CONFIGURATION_ERROR, 'Server authorization is not configured', 500, 'Missing required env: JWT_SECRET');
  }
  return s;
}

export async function signToken(payload, secret) {
  const resolvedSecret = resolveSecret(secret);
  const key = await getCryptoKey(resolvedSecret);
  const payloadStr = JSON.stringify(payload);
  const data = encoder.encode(payloadStr);
  const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const payloadBase64 = btoa(payloadStr);
  return `${payloadBase64}.${signatureHex}`;
}

export async function verifyToken(token, secret) {
  try {
    if (!token) return null;
    const [payloadBase64, signatureHex] = token.split('.');
    if (!payloadBase64 || !signatureHex) return null;

    const payloadStr = atob(payloadBase64);
    const payload = JSON.parse(payloadStr);
    if (!['admin', 'manager'].includes(payload.role)) return null;

    const resolvedSecret = resolveSecret(secret);
    const key = await getCryptoKey(resolvedSecret);
    const data = encoder.encode(payloadStr);
    const matches = signatureHex.match(/.{1,2}/g);
    if (!matches) return null;

    const sigBytes = new Uint8Array(matches.map(byte => parseInt(byte, 16)));
    const isValid = await globalThis.crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!isValid) return null;

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError && error.code === ERROR_CODES.SERVER_CONFIGURATION_ERROR) {
      throw error;
    }
    return null;
  }
}
