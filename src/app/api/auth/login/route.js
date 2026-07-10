import { signToken, verifyPassword } from '@/lib/auth';
import { ApiError, ERROR_CODES, errorResponse, handleApiError, successResponse } from '@/lib/apiResponse';
import { getAuthConfig } from '@/lib/serverConfig';
import { rateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/server/audit/logAuditEvent';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  const limitResult = rateLimit(`login:${ip}`, 5, 5 * 60 * 1000);
  if (limitResult.blocked) {
    await logAuditEvent({ action: 'LOGIN_RATE_LIMITED', ip, metadata: { ip } });
    return errorResponse(ERROR_CODES.RATE_LIMITED, 'Too many login attempts. Try again later.', 429);
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid JSON payload', 400);
    }

    if (!body || typeof body !== 'object') {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Request body must be a JSON object', 400);
    }

    const { username, password } = body;

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Username and password must be strings', 400);
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername === '' || cleanPassword === '') {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Username and password cannot be empty', 400);
    }

    if (cleanUsername.length > 100 || cleanPassword.length > 100) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Credentials length limit exceeded', 400);
    }

    // Block suspicious characters associated with SQL injection or command injection
    if (/[\s;'"=]/.test(cleanUsername) && cleanUsername !== 'owner_tpl_admin') {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid characters in username', 400);
    }

    const authConfig = await getAuthConfig();

    // Auto-bootstrap CEO (admin) if User table has no admin
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      await prisma.user.create({
        data: {
          username: authConfig.adminUsername,
          passwordHash: authConfig.adminPasswordHash,
          role: 'admin',
          canManageProducts: true,
          canManageReviews: true,
          canManagePromos: true,
          canManageLeads: true,
          canDeleteLeads: true
        }
      });
      console.warn(`[System Bootstrap] Created default admin/CEO user in database: ${authConfig.adminUsername}`);
    }

    // Query user from database
    const user = await prisma.user.findUnique({ where: { username: cleanUsername } });

    let role = null;
    if (user && await verifyPassword(password, user.passwordHash)) {
      role = user.role;
    }

    if (!role) {
      await logAuditEvent({ action: 'LOGIN_FAILED', ip, metadata: { username: cleanUsername.slice(0, 80) } });
      throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS, 'Invalid username or password', 401);
    }

    const token = await signToken({
      username: cleanUsername,
      role,
      exp: Date.now() + 24 * 60 * 60 * 1000
    }, authConfig.jwtSecret);

    const response = successResponse({ role, username: cleanUsername });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    await logAuditEvent({ actor: { username, role }, action: 'LOGIN_SUCCESS', ip });
    return response;
  } catch (error) {
    return handleApiError(error, 'auth.login');
  }
}
