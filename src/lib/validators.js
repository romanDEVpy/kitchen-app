import { ApiError, ERROR_CODES } from './apiResponse.js';

export function readString(value, field, { required = false, min = 0, max = 500, pattern = null } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') {
    if (required) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `${field} is required`, 400);
    }
    return null;
  }

  const text = String(value).trim();
  if (text.length < min || text.length > max) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `${field} must be between ${min} and ${max} characters`, 400);
  }
  if (pattern && !pattern.test(text)) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `${field} has invalid format`, 400);
  }
  return text;
}

export function readPositiveInt(value, field, { required = true, min = 1, max = 10_000_000 } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `${field} is required`, 400);
    return 0;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `${field} must be a positive number`, 400);
  }
  return number;
}

export function readRating(value) {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `rating is required`, 400);
  }
  const number = Number(value);
  if (Number.isNaN(number) || number < 1 || number > 5) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `rating must be a number between 1 and 5`, 400);
  }
  return Math.round(number * 2) / 2;
}

export function readId(value, field = 'id') {
  return readString(value, field, { required: true, max: 80, pattern: /^[a-zA-Z0-9_-]+$/ });
}

export function readSlug(value) {
  return readString(value, 'slug', { required: true, min: 2, max: 120, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ });
}

export function readPhone(value) {
  const phone = readString(value, 'phone', { required: true, min: 5, max: 32 });
  if (!/^[+()\-\s\d]{5,32}$/.test(phone)) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid phone number', 400);
  }
  return phone;
}

export function sanitizeText(value) {
  if (value === null || value === undefined) return null;
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
