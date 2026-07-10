import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rateLimit';
import { ERROR_CODES, errorResponse, handleApiError, successResponse } from '@/lib/apiResponse';
import { optimizeImage, optimizeVideo } from '@/lib/optimize';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.webm'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Rate limiting to prevent storage space exhaustion DDoS attacks
  const limitResult = rateLimit(ip, 10, 60 * 1000); // 10 uploads per minute per IP
  if (limitResult.blocked) {
    console.warn(`[Security Alert] Rate limit exceeded for file upload from IP: ${ip}`);
    return errorResponse(ERROR_CODES.RATE_LIMITED, 'Too many requests. Try again later.', 429);
  }

  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      console.warn(`[Security Incident] Empty upload attempt from IP: ${ip}`);
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'File is required', 400);
    }

    // 2. Strict file size validation
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[Security Incident] File size limit exceeded (${file.size} bytes) from IP: ${ip}`);
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'File is too large', 400);
    }

    // 3. Strict extension validation using only path.extname in lowercase
    const fileExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      console.warn(`[Security Incident] Unapproved file extension: "${fileExt}" from IP: ${ip}`);
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Unsupported file extension', 400);
    }

    // 4. Strict MIME-type check (Note: Client-provided headers can be spoofed)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.warn(`[Security Incident] Unapproved MIME-type: "${file.type}" from IP: ${ip}`);
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Unsupported file type', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const header = buffer.toString('hex', 0, 4);
    const validSignature =
      (fileExt === '.jpg' || fileExt === '.jpeg') ? header.startsWith('ffd8') :
      fileExt === '.png' ? header === '89504e47' :
      fileExt === '.webp' ? buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' :
      fileExt === '.pdf' ? buffer.toString('ascii', 0, 4) === '%PDF' :
      fileExt === '.mp4' ? buffer.toString('ascii', 4, 8) === 'ftyp' :
      fileExt === '.webm' ? header === '1a45dfa3' :
      false;

    if (!validSignature) {
      console.warn(`[Security Incident] File signature mismatch for extension: "${fileExt}" from IP: ${ip}`);
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'File content does not match file type', 400);
    }

    // 5. Generate secure random file name (completely ignoring client-provided filename)
    // to prevent Path Traversal and Shell injection vectors
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    const tempDir = path.join(uploadDir, 'temp');
    await mkdir(uploadDir, { recursive: true });
    await mkdir(tempDir, { recursive: true });

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    let finalName = '';
    if (isImage) {
      finalName = `${crypto.randomUUID()}.webp`;
    } else if (isVideo) {
      finalName = `${crypto.randomUUID()}.mp4`;
    } else {
      finalName = `${crypto.randomUUID()}${fileExt}`;
    }

    const finalPath = path.join(uploadDir, finalName);

    if (isImage || isVideo) {
      const tempName = `temp_${crypto.randomUUID()}${fileExt}`;
      const tempPath = path.join(tempDir, tempName);
      
      try {
        // Write uploaded file to temp file
        await writeFile(tempPath, buffer);

        // Optimize and convert format
        if (isImage) {
          await optimizeImage(tempPath, finalPath);
        } else {
          await optimizeVideo(tempPath, finalPath);
        }
      } finally {
        // Clean up temp file
        await rm(tempPath, { force: true });
      }
    } else {
      // PDF or other non-optimized types
      await writeFile(finalPath, buffer);
    }

    // Log successful upload (Audit Log)
    console.warn(`[Audit Log] File uploaded and optimized successfully from IP: ${ip}, assigned name: ${finalName}`);

    return successResponse({ url: `/images/${finalName}` });
  } catch (error) {
    return handleApiError(error, 'upload.post');
  }
}
