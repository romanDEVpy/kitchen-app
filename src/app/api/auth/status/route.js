import { ERROR_CODES, errorResponse, handleApiError, successResponse } from '@/lib/apiResponse';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return errorResponse(ERROR_CODES.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
    }

    const dbUser = await prisma.user.findUnique({ where: { username: user.username } });
    const permissions = dbUser ? {
      canManageProducts: dbUser.canManageProducts,
      canManageReviews: dbUser.canManageReviews,
      canManagePromos: dbUser.canManagePromos,
      canManageLeads: dbUser.canManageLeads,
      canDeleteLeads: dbUser.canDeleteLeads
    } : {
      canManageProducts: user.role === 'admin',
      canManageReviews: user.role === 'admin',
      canManagePromos: user.role === 'admin',
      canManageLeads: user.role === 'admin',
      canDeleteLeads: user.role === 'admin'
    };

    return successResponse({
      authenticated: true,
      username: user.username,
      role: user.role,
      permissions
    });
  } catch (error) {
    return handleApiError(error, 'auth.status');
  }
}
