import { ApiError, ERROR_CODES } from './apiResponse.js';
import { verifyPassword } from './auth.js';

const REQUIRED_AUTH_ENV = [
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'MANAGER_USERNAME',
  'MANAGER_PASSWORD_HASH'
];

const INSECURE_VALUES = new Set([
  'admin',
  'manager',
  'password',
  'manager_password',
  'super-secret-key-change-me-in-production-1234567890',
  'your-secret-key'
]);

export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new ApiError(
      ERROR_CODES.SERVER_CONFIGURATION_ERROR,
      'Server authorization is not configured',
      500,
      `Missing required env: ${name}`
    );
  }
  return value;
}

export async function getAuthConfig() {
  const config = Object.fromEntries(REQUIRED_AUTH_ENV.map((name) => [name, getRequiredEnv(name)]));

  for (const [name, value] of Object.entries(config)) {
    if (INSECURE_VALUES.has(String(value).trim())) {
      throw new ApiError(
        ERROR_CODES.SERVER_CONFIGURATION_ERROR,
        'Server authorization is not configured',
        500,
        `Insecure default value is not allowed for ${name}`
      );
    }
  }

  const insecurePasswords = ['admin', 'manager', 'password', 'manager_password'];
  for (const pwd of insecurePasswords) {
    if (await verifyPassword(pwd, config.ADMIN_PASSWORD_HASH)) {
      throw new ApiError(
        ERROR_CODES.SERVER_CONFIGURATION_ERROR,
        'Server authorization is not configured',
        500,
        'Insecure default value is not allowed for ADMIN_PASSWORD_HASH'
      );
    }
    if (await verifyPassword(pwd, config.MANAGER_PASSWORD_HASH)) {
      throw new ApiError(
        ERROR_CODES.SERVER_CONFIGURATION_ERROR,
        'Server authorization is not configured',
        500,
        'Insecure default value is not allowed for MANAGER_PASSWORD_HASH'
      );
    }
  }

  if (config.JWT_SECRET.length < 32) {
    throw new ApiError(
      ERROR_CODES.SERVER_CONFIGURATION_ERROR,
      'Server authorization is not configured',
      500,
      'JWT_SECRET must be at least 32 characters'
    );
  }

  return {
    jwtSecret: config.JWT_SECRET,
    adminUsername: config.ADMIN_USERNAME,
    adminPasswordHash: config.ADMIN_PASSWORD_HASH,
    managerUsername: config.MANAGER_USERNAME,
    managerPasswordHash: config.MANAGER_PASSWORD_HASH
  };
}

export function getDatabaseFilePath() {
  return process.env.TEST_DATABASE_FILE || process.env.DATABASE_FILE || 'dev.db';
}
