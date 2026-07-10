import { prisma } from '@/lib/prisma';
import { handleApiError, successResponse } from '@/lib/apiResponse';
import { requirePermission } from '@/lib/serverAuth';
import { readString } from '@/lib/validators';
import { logAuditEvent } from '@/server/audit/logAuditEvent';

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(promos);
  } catch (error) {
    return handleApiError(error, 'promos.get');
  }
}

export async function POST(request) {
  try {
    const actor = await requirePermission(request, 'canManagePromos');
    const body = await request.json();
    const promo = await prisma.promo.create({
      data: {
        title: readString(body.title, 'title', { required: true, min: 2, max: 160 }),
        discount: readString(body.discount, 'discount', { required: true, min: 1, max: 80 }),
        description: readString(body.description, 'description', { required: true, min: 2, max: 1000 }),
        imageUrl: readString(body.imageUrl, 'imageUrl', { max: 500 }),
        seo_title: readString(body.seo_title, 'seo_title', { max: 180 }),
        seo_description: readString(body.seo_description, 'seo_description', { max: 300 })
      }
    });
    await logAuditEvent({ actor, action: 'PROMO_CREATED', entityType: 'Promo', entityId: promo.id, ip: request.headers.get('x-forwarded-for') });
    return successResponse(promo, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'promos.post');
  }
}
