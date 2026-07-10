import { ApiError, ERROR_CODES } from './apiResponse.js';
import { verifyToken } from './auth.js';
import { prisma } from './prisma.js';

export async function getAuthenticatedUser(request) {
  const token = request.cookies.get('admin_token')?.value;
  const user = await verifyToken(token);
  return user;
}

export async function requireAuthenticatedUser(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new ApiError(ERROR_CODES.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
  }
  return user;
}

export async function requireRole(request, role) {
  const user = await requireAuthenticatedUser(request);
  if (user.role !== role) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden', 403);
  }
  return user;
}

export async function requireAnyRole(request, roles) {
  const user = await requireAuthenticatedUser(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden', 403);
  }
  return user;
}

export async function requirePermission(request, permissionKey) {
  const actor = await requireAuthenticatedUser(request);
  if (actor.role === 'admin') {
    return actor;
  }
  const dbUser = await prisma.user.findUnique({ where: { username: actor.username } });
  if (!dbUser || !dbUser[permissionKey]) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden: Insufficient permissions', 403);
  }
  return actor;
}
