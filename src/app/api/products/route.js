import { prisma } from '@/lib/prisma';
import { ApiError, ERROR_CODES, handleApiError, successResponse } from '@/lib/apiResponse';
import { requirePermission } from '@/lib/serverAuth';
import { readId, readPositiveInt, readSlug, readString } from '@/lib/validators';
import { logAuditEvent } from '@/server/audit/logAuditEvent';

function parseProductBody(body, { requireId = false } = {}) {
  const data = {
    title: readString(body.title, 'title', { required: true, min: 2, max: 160 }),
    slug: readSlug(body.slug),
    shape: readString(body.shape, 'shape', { required: true, max: 80 }),
    frontType: readString(body.frontType, 'frontType', { required: true, max: 80 }),
    price: readPositiveInt(body.price, 'price', { min: 1, max: 100_000_000 }),
    imageUrl: readString(body.imageUrl, 'imageUrl', { required: true, max: 500 }),
    width: readPositiveInt(body.width, 'width', { required: false, min: 0, max: 100_000 }),
    height: readPositiveInt(body.height, 'height', { required: false, min: 0, max: 100_000 }),
    depth: readPositiveInt(body.depth, 'depth', { required: false, min: 0, max: 100_000 }),
    materials: readString(body.materials, 'materials', { max: 1000 }) || '',
    hardware: readString(body.hardware, 'hardware', { max: 1000 }) || '',
    backlight: readString(body.backlight, 'backlight', { max: 500 }) || '',
    description: readString(body.description, 'description', { max: 3000 }) || '',
    seo_title: readString(body.seo_title, 'seo_title', { max: 180 }),
    seo_description: readString(body.seo_description, 'seo_description', { max: 300 }),
    showOnMain: body.showOnMain === true || body.showOnMain === 'true'
  };

  if (requireId) {
    data.id = readId(body.id);
  }
  return data;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shape = searchParams.get('shape');
    const frontType = searchParams.get('frontType');
    const showOnMain = searchParams.get('showOnMain');

    const where = {};
    if (shape && !['all', 'featured'].includes(shape)) where.shape = shape;
    if (frontType) where.frontType = frontType;
    if (showOnMain === 'true') where.showOnMain = true;

    const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    return successResponse(products);
  } catch (error) {
    return handleApiError(error, 'products.get');
  }
}

export async function POST(request) {
  try {
    const actor = await requirePermission(request, 'canManageProducts');
    const data = parseProductBody(await request.json());
    const product = await prisma.product.create({ data });
    await logAuditEvent({ actor, action: 'PRODUCT_CREATED', entityType: 'Product', entityId: product.id, ip: request.headers.get('x-forwarded-for') });
    return successResponse(product, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'products.post');
  }
}

export async function PUT(request) {
  try {
    const actor = await requirePermission(request, 'canManageProducts');
    const { id, ...data } = parseProductBody(await request.json(), { requireId: true });
    const product = await prisma.product.update({ where: { id }, data });
    await logAuditEvent({ actor, action: 'PRODUCT_UPDATED', entityType: 'Product', entityId: id, ip: request.headers.get('x-forwarded-for') });
    return successResponse(product);
  } catch (error) {
    return handleApiError(error, 'products.put');
  }
}

export async function DELETE(request) {
  try {
    const actor = await requirePermission(request, 'canManageProducts');
    const id = readId(new URL(request.url).searchParams.get('id'));
    await prisma.product.delete({ where: { id } });
    await logAuditEvent({ actor, action: 'PRODUCT_DELETED', entityType: 'Product', entityId: id, ip: request.headers.get('x-forwarded-for') });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, 'products.delete');
  }
}
