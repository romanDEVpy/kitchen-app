import { prisma } from '@/lib/prisma';
import { ApiError, ERROR_CODES, errorResponse, handleApiError, successResponse } from '@/lib/apiResponse';
import { requireRole } from '@/lib/serverAuth';
import { hashPassword } from '@/lib/auth';
import { readId, readString, sanitizeText } from '@/lib/validators';
import { logAuditEvent } from '@/server/audit/logAuditEvent';

function getIp(request) {
  return request.headers.get('x-forwarded-for') || '127.0.0.1';
}

export async function GET(request) {
  try {
    const actor = await requireRole(request, 'admin');
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    
    const sanitized = users.map(u => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    return successResponse(sanitized);
  } catch (error) {
    return handleApiError(error, 'users.get');
  }
}

export async function POST(request) {
  try {
    const actor = await requireRole(request, 'admin');
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const methodOverride = searchParams.get('_method') || request.headers.get('x-http-method-override');

    if (methodOverride === 'DELETE' || (idParam && methodOverride === 'DELETE')) {
      const id = readId(idParam);
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
      }
      if (targetUser.role === 'admin') {
        throw new ApiError(ERROR_CODES.FORBIDDEN, 'Невозможно удалить аккаунт CEO/Администратора', 403);
      }
      await prisma.user.delete({ where: { id } });
      await logAuditEvent({
        actor,
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: id,
        metadata: { username: targetUser.username },
        ip: getIp(request)
      });
      return successResponse({ deleted: true });
    }

    if (methodOverride === 'PATCH' || idParam) {
      const id = readId(idParam);
      const body = await request.json();
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
      }

      const updateData = {};
      if (body.username !== undefined) {
        const newUsername = sanitizeText(readString(body.username, 'username', { required: true, min: 3, max: 80 }));
        if (newUsername !== targetUser.username) {
          const existing = await prisma.user.findUnique({ where: { username: newUsername } });
          if (existing) {
            throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Имя пользователя уже занято', 400);
          }
          updateData.username = newUsername;
        }
      }

      if (body.password !== undefined && String(body.password).trim() !== '') {
        const password = readString(body.password, 'password', { min: 6, max: 100 });
        updateData.passwordHash = await hashPassword(password);
      }

      if (targetUser.role === 'manager') {
        if (body.canManageProducts !== undefined) updateData.canManageProducts = !!body.canManageProducts;
        if (body.canManageReviews !== undefined) updateData.canManageReviews = !!body.canManageReviews;
        if (body.canManagePromos !== undefined) updateData.canManagePromos = !!body.canManagePromos;
        if (body.canManageLeads !== undefined) updateData.canManageLeads = !!body.canManageLeads;
        if (body.canDeleteLeads !== undefined) updateData.canDeleteLeads = !!body.canDeleteLeads;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData
      });

      await logAuditEvent({
        actor,
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: id,
        metadata: { username: updated.username, fields: Object.keys(updateData) },
        ip: getIp(request)
      });

      const { passwordHash: _, ...sanitized } = updated;
      return successResponse(sanitized);
    }

    const body = await request.json();
    const username = sanitizeText(readString(body.username, 'username', { required: true, min: 3, max: 80 }));
    const password = readString(body.password, 'password', { required: true, min: 6, max: 100 });

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Пользователь с таким именем уже существует', 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: 'manager',
        canManageProducts: !!body.canManageProducts,
        canManageReviews: !!body.canManageReviews,
        canManagePromos: !!body.canManagePromos,
        canManageLeads: !!body.canManageLeads,
        canDeleteLeads: !!body.canDeleteLeads
      }
    });

    await logAuditEvent({
      actor,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      metadata: { username: user.username },
      ip: getIp(request)
    });

    const { passwordHash: _, ...sanitized } = user;
    return successResponse(sanitized, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'users.post');
  }
}

export async function PATCH(request) {
  try {
    const actor = await requireRole(request, 'admin');
    const id = readId(new URL(request.url).searchParams.get('id'));
    const body = await request.json();

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
    }

    const updateData = {};
    if (body.username !== undefined) {
      const newUsername = sanitizeText(readString(body.username, 'username', { required: true, min: 3, max: 80 }));
      if (newUsername !== targetUser.username) {
        const existing = await prisma.user.findUnique({ where: { username: newUsername } });
        if (existing) {
          throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Имя пользователя уже занято', 400);
        }
        updateData.username = newUsername;
      }
    }

    if (body.password !== undefined && String(body.password).trim() !== '') {
      const password = readString(body.password, 'password', { min: 6, max: 100 });
      updateData.passwordHash = await hashPassword(password);
    }

    // Only allow updating permissions if the target user is a manager (do not strip CEO permissions)
    if (targetUser.role === 'manager') {
      if (body.canManageProducts !== undefined) updateData.canManageProducts = !!body.canManageProducts;
      if (body.canManageReviews !== undefined) updateData.canManageReviews = !!body.canManageReviews;
      if (body.canManagePromos !== undefined) updateData.canManagePromos = !!body.canManagePromos;
      if (body.canManageLeads !== undefined) updateData.canManageLeads = !!body.canManageLeads;
      if (body.canDeleteLeads !== undefined) updateData.canDeleteLeads = !!body.canDeleteLeads;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData
    });

    await logAuditEvent({
      actor,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      metadata: { username: updated.username, fields: Object.keys(updateData) },
      ip: getIp(request)
    });

    const { passwordHash: _, ...sanitized } = updated;
    return successResponse(sanitized);
  } catch (error) {
    return handleApiError(error, 'users.patch');
  }
}

export async function DELETE(request) {
  try {
    const actor = await requireRole(request, 'admin');
    const id = readId(new URL(request.url).searchParams.get('id'));

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
    }

    if (targetUser.role === 'admin') {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Невозможно удалить аккаунт CEO/Администратора', 403);
    }

    await prisma.user.delete({ where: { id } });

    await logAuditEvent({
      actor,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
      metadata: { username: targetUser.username },
      ip: getIp(request)
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, 'users.delete');
  }
}
