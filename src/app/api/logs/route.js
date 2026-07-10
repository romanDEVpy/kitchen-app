import { prisma } from '@/lib/prisma';
import { handleApiError, successResponse } from '@/lib/apiResponse';
import { requireRole } from '@/lib/serverAuth';

export async function GET(request) {
  try {
    await requireRole(request, 'admin');
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return successResponse(logs);
  } catch (error) {
    return handleApiError(error, 'logs.get');
  }
}
