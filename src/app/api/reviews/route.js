import { prisma } from '@/lib/prisma';
import { ApiError, ERROR_CODES, handleApiError, successResponse } from '@/lib/apiResponse';
import { requirePermission } from '@/lib/serverAuth';
import { readRating, readString } from '@/lib/validators';
import { logAuditEvent } from '@/server/audit/logAuditEvent';

function validateImageUrl(url) {
  if (!url) return null;
  const urls = url.split(',').map(s => s.trim()).filter(Boolean);
  for (const u of urls) {
    if (!u.startsWith('/') && !u.startsWith('http://') && !u.startsWith('https://')) {
      throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid image URL format', 400);
    }
  }
  return urls.join(',');
}

function validateVideoUrl(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (u === '') return null;
  if (!u.startsWith('/') && !u.startsWith('http://') && !u.startsWith('https://')) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid video URL format', 400);
  }
  return u;
}

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(reviews);
  } catch (error) {
    return handleApiError(error, 'reviews.get');
  }
}

export async function POST(request) {
  try {
    const actor = await requirePermission(request, 'canManageReviews');
    const body = await request.json();
    const rawImageUrl = readString(body.imageUrl, 'imageUrl', { max: 1000 });
    const rawVideoUrl = readString(body.videoUrl, 'videoUrl', { max: 500 });

    const review = await prisma.review.create({
      data: {
        author: readString(body.author, 'author', { required: true, min: 2, max: 120 }),
        rating: readRating(body.rating),
        title: readString(body.title, 'title', { max: 160 }),
        text: readString(body.text, 'text', { required: true, min: 2, max: 3000 }),
        imageUrl: validateImageUrl(rawImageUrl),
        videoUrl: validateVideoUrl(rawVideoUrl),
        seo_title: readString(body.seo_title, 'seo_title', { max: 180 }),
        seo_description: readString(body.seo_description, 'seo_description', { max: 300 })
      }
    });
    await logAuditEvent({ actor, action: 'REVIEW_CREATED', entityType: 'Review', entityId: review.id, ip: request.headers.get('x-forwarded-for') });
    return successResponse(review, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'reviews.post');
  }
}
