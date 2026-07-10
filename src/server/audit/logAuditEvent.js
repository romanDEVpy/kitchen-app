import { prisma } from '@/lib/prisma';

export async function logAuditEvent({ actor = null, action, entityType = '', entityId = '', metadata = {}, ip = null }) {
  try {
    const username = actor?.username || 'system';
    const role = actor?.role || 'system';
    await prisma.auditLog.create({
      data: {
        action,
        user: `${username} (${role})`,
        details: JSON.stringify({ entityType, entityId, ...metadata }),
        ip
      }
    });
  } catch (error) {
    console.error('[audit] failed to write audit event:', error?.message || error);
  }
}
