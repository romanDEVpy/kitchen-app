import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const execAsync = promisify(exec);

/**
 * Optimizes an image to WebP using Python + Pillow.
 * Resizes the image to a max dimension of 1200px.
 * @param {string} inputPath - Absolute path to input image.
 * @param {string} outputPath - Absolute path to save optimized WebP image.
 */
export async function optimizeImage(inputPath, outputPath) {
  const tempDir = path.dirname(outputPath);
  await fs.mkdir(tempDir, { recursive: true });

  const scriptId = crypto.randomUUID();
  const scriptPath = path.join(tempDir, `optimize_img_${scriptId}.py`);

  // Use double backslashes for paths in Python string literals
  const pyInput = inputPath.replace(/\\/g, '\\\\');
  const pyOutput = outputPath.replace(/\\/g, '\\\\');

  const pythonCode = `
import sys
from PIL import Image

try:
    with Image.open(r"${pyInput}") as img:
        if img.mode in ("RGBA", "LA"):
            pass
        elif img.mode != "RGB":
            img = img.convert("RGB")
        
        max_dim = 1200
        if img.width > max_dim or img.height > max_dim:
            if img.width > img.height:
                w_percent = (max_dim / float(img.width))
                h_size = int((float(img.height) * float(w_percent)))
                img = img.resize((max_dim, h_size), Image.Resampling.LANCZOS)
            else:
                h_percent = (max_dim / float(img.height))
                w_size = int((float(img.width) * float(h_percent)))
                img = img.resize((w_size, max_dim), Image.Resampling.LANCZOS)
        
        img.save(r"${pyOutput}", "WEBP", quality=80)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
`;

  try {
    await fs.writeFile(scriptPath, pythonCode, 'utf-8');
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`);
    if (stdout.includes('ERROR') || stderr) {
      throw new Error(stdout || stderr);
    }
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  } finally {
    await fs.rm(scriptPath, { force: true });
  }
}

/**
 * Optimizes a video to MP4 (H.264/AAC with faststart for streaming) using FFmpeg.
 * @param {string} inputPath - Absolute path to input video.
 * @param {string} outputPath - Absolute path to save optimized video.
 */
export async function optimizeVideo(inputPath, outputPath) {
  // ffmpeg options for web:
  // -c:v libx264: H.264 video codec
  // -crf 26: Constant Rate Factor (23 is default, 26 is slightly compressed but excellent quality/size ratio)
  // -preset fast: Fast encoding speed
  // -pix_fmt yuv420p: Wide compatibility pixel format
  // -movflags +faststart: Relocates index to start of file (enables immediate playback/streaming)
  // -c:a aac: AAC audio codec
  // -b:a 128k: Audio bitrate
  // -vf scale="min(1280\,iw):-2": Scale to max 720p width, keeping aspect ratio (even dimensions)
  const cmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -crf 26 -preset fast -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k -vf "scale='min(1280,iw)':-2" "${outputPath}"`;
  
  try {
    await execAsync(cmd);
  } catch (error) {
    console.error('Video optimization failed:', error);
    throw error;
  }
}
