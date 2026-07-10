import { prisma } from '@/lib/prisma';
import { ApiError, ERROR_CODES, errorResponse, handleApiError, successResponse } from '@/lib/apiResponse';
import { rateLimit } from '@/lib/rateLimit';
import { requirePermission } from '@/lib/serverAuth';
import { isLeadStatus } from '@/lib/leadStatus';
import { readId, readPhone, readString, sanitizeText } from '@/lib/validators';
import { logAuditEvent } from '@/server/audit/logAuditEvent';
import { sendTelegramLeadNotification } from '@/server/notifications';

function getIp(request) {
  return request.headers.get('x-forwarded-for') || '127.0.0.1';
}

function parseLeadCreate(body) {
  return {
    name: sanitizeText(readString(body.name, 'name', { required: true, min: 2, max: 120 })),
    phone: sanitizeText(readPhone(body.phone)),
    kitchenType: sanitizeText(readString(body.kitchenType, 'kitchenType', { max: 120 })),
    installTime: sanitizeText(readString(body.installTime, 'installTime', { max: 120 })),
    kitchenLength: sanitizeText(readString(body.kitchenLength, 'kitchenLength', { max: 120 })),
    budget: sanitizeText(readString(body.budget, 'budget', { max: 120 })),
    city: sanitizeText(readString(body.city, 'city', { max: 120 })),
    projectFile: sanitizeText(readString(body.projectFile, 'projectFile', { max: 500 }))
  };
}

function parseLeadPatch(body) {
  const updateData = {};
  const allowedKeys = new Set(['status', 'notes']);
  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, `Field ${key} is not allowed`, 400);
    }
  }

  if (body.status !== undefined) {
    if (!isLeadStatus(body.status)) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Unsupported lead status', 400);
    }
    updateData.status = body.status;
  }
  if (body.notes !== undefined) {
    updateData.notes = readString(body.notes, 'notes', { max: 3000 }) || '';
  }
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'No fields to update', 400);
  }
  return updateData;
}

export async function GET(request) {
  try {
    await requirePermission(request, 'canManageLeads');
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(leads);
  } catch (error) {
    return handleApiError(error, 'leads.get');
  }
}

export async function POST(request) {
  const ip = getIp(request);
  const limitResult = rateLimit(`lead:${ip}`, 5, 5 * 60 * 1000);
  if (limitResult.blocked) {
    return errorResponse(ERROR_CODES.RATE_LIMITED, 'Too many requests. Try again later.', 429);
  }

  try {
    const body = await request.json();
    if (body.website && String(body.website).trim() !== '') {
      console.warn(`[Security Alert] Bot spam blocked from IP: ${ip} via honeypot field`);
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Spam detected', 400);
    }
    const data = parseLeadCreate(body);
    const lead = await prisma.lead.create({ data });
    await logAuditEvent({ action: 'LEAD_CREATED', entityType: 'Lead', entityId: lead.id, ip });
    sendTelegramLeadNotification(lead).catch(() => {});
    return successResponse({ leadId: lead.id, lead }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'leads.post');
  }
}

export async function PATCH(request) {
  try {
    const actor = await requirePermission(request, 'canManageLeads');
    const id = readId(new URL(request.url).searchParams.get('id'));
    const updateData = parseLeadPatch(await request.json());
    const lead = await prisma.lead.update({ where: { id }, data: updateData });
    await logAuditEvent({ actor, action: 'LEAD_UPDATED', entityType: 'Lead', entityId: id, metadata: { fields: Object.keys(updateData) }, ip: getIp(request) });
    return successResponse(lead);
  } catch (error) {
    return handleApiError(error, 'leads.patch');
  }
}

export async function DELETE(request) {
  try {
    const actor = await requirePermission(request, 'canDeleteLeads');
    const id = readId(new URL(request.url).searchParams.get('id'));
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Lead not found', 404);
    }
    await prisma.lead.delete({ where: { id } });
    await logAuditEvent({ actor, action: 'LEAD_DELETED', entityType: 'Lead', entityId: id, metadata: { name: lead.name }, ip: getIp(request) });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, 'leads.delete');
  }
}
