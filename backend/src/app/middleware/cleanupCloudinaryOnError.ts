/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { deleteFromCloudinary } from '../lib/cloudinary';

/**
 * Called from the global error handler.
 * If a file was uploaded to Cloudinary during the request but the request
 * ultimately failed (e.g., DB save error), this removes the orphaned Cloudinary asset.
 */
export const cleanupCloudinaryOnError = async (req: Request): Promise<void> => {
  try {
    if (req.cloudinaryUpload?.public_id) {
      await deleteFromCloudinary(req.cloudinaryUpload.public_id, 'auto');
      console.log(`[Cloudinary Cleanup] Deleted orphaned asset: ${req.cloudinaryUpload.public_id}`);
    }
  } catch (error: any) {
    console.error('[Cloudinary Cleanup] Failed to delete orphaned asset:', error?.message);
  }
};
